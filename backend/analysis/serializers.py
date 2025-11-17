from rest_framework import serializers
from .models import AgentMessage, AnalysisSnapshot, AnalysisStatistic, UploadedDocument


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


class AgentMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgentMessage
        fields = ['id', 'role', 'content', 'created_at', 'snapshot']


class AnalysisStatisticSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalysisStatistic
        fields = [
            'id',
            'snapshot',
            'total_transactions',
            'risky_transactions',
            'counterparties',
            'alerts',
            'generated_at',
        ]
