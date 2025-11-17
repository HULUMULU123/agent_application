from datetime import datetime
from io import BytesIO

import pandas as pd
from django.core.files.base import ContentFile
from django.db import transaction

from .external import ExternalAPIGateway
from .ml import MockModelGateway
from .models import AnalysisSnapshot, AnalysisStatistic, UploadedDocument


def detect_kind(upload_name: str) -> str:
    name = upload_name.lower()
    if name.endswith('.pdf'):
        return 'pdf'
    if name.endswith(('.xls', '.xlsx')):
        return 'excel'
    return 'csv'


def build_preview_notes(file_name: str) -> str:
    return (
        f'Файл {file_name} прошел проверку структуры. '
        'Поля распознаны, готовы отправить в пайплайн моделей.'
    )


def export_transactions_to_csv(transactions: list) -> bytes:
    dataframe = pd.DataFrame(transactions)
    buffer = BytesIO()
    dataframe.to_csv(buffer, index=False, encoding='utf-8')
    return buffer.getvalue()


def export_transactions_to_excel(transactions: list) -> bytes:
    dataframe = pd.DataFrame(transactions)
    buffer = BytesIO()
    with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
        dataframe.to_excel(writer, sheet_name='Транзакции', index=False)
    return buffer.getvalue()


def build_analysis_payload(document_name: str) -> dict:
    ml = MockModelGateway()
    external = ExternalAPIGateway()
    transactions = ml.predict_transactions(document_name)
    scores = [external.fetch_counterparty_score(f'77{450000 + idx * 3}') for idx in range(3)]
    signals = external.latest_signals()
    registry = [
        {
            'name': f'Контрагент {idx + 1}',
            'inn': score['inn'],
            'segment': score['provider'],
            'operations': 32 + idx * 12,
            'risk': 'низкий' if score['score'] > 0.75 else 'средний',
        }
        for idx, score in enumerate(scores)
    ]

    return {
        'cashflow': ml.build_cashflow_summary(),
        'balance_projection': ml.forecast_balance(),
        'activity_heatmap': ml.build_activity_heatmap(),
        'control_dates': ml.next_control_dates(),
        'category_split': [
            {'category': 'Зарплатные проекты', 'value': 6.4},
            {'category': 'Подрядчики', 'value': 4.8},
            {'category': 'Налоги', 'value': 3.1},
            {'category': 'Операционные расходы', 'value': 2.6},
            {'category': 'Инвестиции', 'value': 1.9},
        ],
        'transactions': transactions,
        'scores': scores,
        'registry': registry,
        'counterparty_volume': ml.counterparty_volume(transactions),
        'risk_mix': ml.risk_mix(transactions),
        'counterparty_trend': ml.counterparty_trend(transactions),
        'counterparty_velocity': ml.counterparty_velocity(transactions),
        'signals': signals,
        'generated_at': datetime.utcnow().isoformat(),
    }


def persist_analysis(document: UploadedDocument, payload: dict) -> AnalysisSnapshot:
    transactions = payload.get('transactions', [])
    risky_transactions = len([item for item in transactions if str(item.get('risk', '')).startswith('выс')])

    with transaction.atomic():
        snapshot = AnalysisSnapshot.objects.create(
            title=f'Анализ {document.display_name}',
            payload=payload,
            source_document=document,
        )
        AnalysisStatistic.objects.update_or_create(
            snapshot=snapshot,
            defaults={
                'total_transactions': len(transactions),
                'risky_transactions': risky_transactions,
                'counterparties': len(payload.get('registry', [])),
                'alerts': len(payload.get('signals', [])),
            },
        )
    return snapshot


def seed_demo_if_needed() -> AnalysisSnapshot:
    snapshot = AnalysisSnapshot.objects.order_by('-created_at').first()
    if snapshot:
        return snapshot

    content = 'date,amount,currency\n2024-11-12,18250,RUB\n2024-11-13,-7420,RUB\n'
    document = UploadedDocument(
        display_name='demo_statement.csv',
        kind=detect_kind('demo_statement.csv'),
        status='готово',
        source='Демо пайплайн',
        detected_columns=3,
        detected_rows=2,
        preview_notes='Демонстрационные данные для стартового экрана.',
    )
    document.file.save('demo_statement.csv', ContentFile(content), save=True)
    payload = build_analysis_payload(document.display_name)
    return persist_analysis(document, payload)


def latest_analysis_payload() -> tuple[AnalysisSnapshot, dict]:
    snapshot = seed_demo_if_needed()
    return snapshot, snapshot.payload if snapshot else {}
