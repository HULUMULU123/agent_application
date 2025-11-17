from datetime import datetime
from io import BytesIO

import pandas as pd

from .external import ExternalAPIGateway
from .ml import MockModelGateway


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
