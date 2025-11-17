import random

from django.http import HttpResponse
from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AgentMessage, AnalysisSnapshot, UploadedDocument
from .serializers import (
    AgentMessageSerializer,
    AnalysisSnapshotSerializer,
    AnalysisStatisticSerializer,
    UploadedDocumentSerializer,
)
from .services import (
    build_analysis_payload,
    build_preview_notes,
    detect_kind,
    export_transactions_to_csv,
    export_transactions_to_excel,
    latest_analysis_payload,
    persist_analysis,
    seed_demo_if_needed,
)


class UploadedDocumentViewSet(viewsets.ModelViewSet):
    queryset = UploadedDocument.objects.all()
    serializer_class = UploadedDocumentSerializer
    http_method_names = ['get', 'post']

    def list(self, request, *args, **kwargs):
        seed_demo_if_needed()
        return super().list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        file = request.FILES.get('file')
        if not file:
            return Response({'detail': 'Файл обязателен для загрузки.'}, status=status.HTTP_400_BAD_REQUEST)

        kind = detect_kind(file.name)
        document = UploadedDocument.objects.create(
            file=file,
            display_name=file.name,
            kind=kind,
            status='анализируется',
            detected_columns=random.randint(6, 12),
            detected_rows=random.randint(120, 320),
            preview_notes=build_preview_notes(file.name),
        )

        payload = build_analysis_payload(file.name)
        snapshot = persist_analysis(document, payload)
        AgentMessage.objects.bulk_create(
            [
                AgentMessage(snapshot=snapshot, role='user', content=f'Загрузил {file.name} для анализа.'),
                AgentMessage(
                    snapshot=snapshot,
                    role='assistant',
                    content='Анализ выполнен, построены графики и собрана статистика по контрагентам.',
                ),
            ]
        )

        serializer = self.get_serializer(document)
        history = AgentMessageSerializer(snapshot.messages.all(), many=True).data
        stats = AnalysisStatisticSerializer(snapshot.statistics).data if hasattr(snapshot, 'statistics') else None
        response = {'document': serializer.data, 'analysis': payload, 'history': history}
        if stats:
            response['statistics'] = stats
        return Response(response, status=status.HTTP_201_CREATED)


class AnalysisSummaryView(APIView):
    def get(self, request):
        snapshot, payload = latest_analysis_payload()
        serializer = AnalysisSnapshotSerializer(snapshot) if snapshot else None
        history = AgentMessageSerializer(snapshot.messages.all(), many=True).data if snapshot else []
        statistics = (
            AnalysisStatisticSerializer(snapshot.statistics).data if snapshot and hasattr(snapshot, 'statistics') else None
        )

        response_data = {'payload': payload, 'history': history}
        if serializer:
            response_data['snapshot'] = serializer.data
        if statistics:
            response_data['statistics'] = statistics
        return Response(response_data)


class ExportCSVView(APIView):
    def get(self, request):
        snapshot, payload = latest_analysis_payload()
        transactions = payload.get('transactions', [])
        csv_content = export_transactions_to_csv(transactions)
        response = HttpResponse(csv_content, content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="agent-transactions.csv"'
        return response


class ExportExcelView(APIView):
    def get(self, request):
        snapshot, payload = latest_analysis_payload()
        transactions = payload.get('transactions', [])
        excel_content = export_transactions_to_excel(transactions)
        response = HttpResponse(
            excel_content,
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        )
        response['Content-Disposition'] = 'attachment; filename="agent-transactions.xlsx"'
        return response
