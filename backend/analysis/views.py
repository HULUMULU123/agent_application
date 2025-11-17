import random

from django.http import HttpResponse
from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AnalysisSnapshot, UploadedDocument
from .serializers import AnalysisSnapshotSerializer, UploadedDocumentSerializer
from .services import (
    build_analysis_payload,
    build_preview_notes,
    detect_kind,
    export_transactions_to_csv,
    export_transactions_to_excel,
)


class UploadedDocumentViewSet(viewsets.ModelViewSet):
    queryset = UploadedDocument.objects.all()
    serializer_class = UploadedDocumentSerializer
    http_method_names = ['get', 'post']

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        if not queryset.exists():
            sample = [
                {
                    'id': 1,
                    'display_name': 'statement_november.pdf',
                    'kind': 'pdf',
                    'status': 'готово',
                    'source': 'Веб-интерфейс',
                    'uploaded_at': '2024-11-12T09:12:00Z',
                    'detected_columns': 11,
                    'detected_rows': 186,
                    'preview_notes': 'Сгенерировано для предпросмотра интерфейса.',
                },
                {
                    'id': 2,
                    'display_name': 'counterparty_registry.csv',
                    'kind': 'csv',
                    'status': 'анализируется',
                    'source': 'API',
                    'uploaded_at': '2024-11-11T18:40:00Z',
                    'detected_columns': 9,
                    'detected_rows': 242,
                    'preview_notes': 'Имитация активного задания.',
                },
            ]
            return Response(sample)
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
        AnalysisSnapshot.objects.create(title=f'Анализ {file.name}', payload=payload, source_document=document)

        serializer = self.get_serializer(document)
        return Response({'document': serializer.data, 'analysis': payload}, status=status.HTTP_201_CREATED)


class AnalysisSummaryView(APIView):
    def get(self, request):
        snapshot = AnalysisSnapshot.objects.order_by('-created_at').first()
        payload = snapshot.payload if snapshot else build_analysis_payload('demo.csv')
        serializer = AnalysisSnapshotSerializer(snapshot) if snapshot else None
        response_data = {'payload': payload}
        if serializer:
            response_data['snapshot'] = serializer.data
        return Response(response_data)


class ExportCSVView(APIView):
    def get(self, request):
        snapshot = AnalysisSnapshot.objects.order_by('-created_at').first()
        payload = snapshot.payload if snapshot else build_analysis_payload('demo.csv')
        transactions = payload.get('transactions', [])
        csv_content = export_transactions_to_csv(transactions)
        response = HttpResponse(csv_content, content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="agent-transactions.csv"'
        return response


class ExportExcelView(APIView):
    def get(self, request):
        snapshot = AnalysisSnapshot.objects.order_by('-created_at').first()
        payload = snapshot.payload if snapshot else build_analysis_payload('demo.csv')
        transactions = payload.get('transactions', [])
        excel_content = export_transactions_to_excel(transactions)
        response = HttpResponse(
            excel_content,
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        )
        response['Content-Disposition'] = 'attachment; filename="agent-transactions.xlsx"'
        return response
