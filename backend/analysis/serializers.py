from rest_framework import serializers
from .models import AnalysisSnapshot, UploadedDocument


class UploadedDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedDocument
        fields = [
            'id',
            'display_name',
            'kind',
            'status',
            'source',
            'uploaded_at',
            'detected_columns',
            'detected_rows',
            'preview_notes',
        ]


class AnalysisSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalysisSnapshot
        fields = ['id', 'title', 'payload', 'created_at', 'source_document']
