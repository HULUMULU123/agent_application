from django.contrib import admin
from .models import AgentMessage, AnalysisSnapshot, AnalysisStatistic, UploadedDocument


@admin.register(UploadedDocument)
class UploadedDocumentAdmin(admin.ModelAdmin):
    list_display = ('display_name', 'kind', 'status', 'uploaded_at', 'detected_rows')
    list_filter = ('kind', 'status')
    search_fields = ('display_name',)
    readonly_fields = ('uploaded_at',)


@admin.register(AnalysisSnapshot)
class AnalysisSnapshotAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_at', 'source_document')
    search_fields = ('title',)
    readonly_fields = ('created_at',)


@admin.register(AgentMessage)
class AgentMessageAdmin(admin.ModelAdmin):
    list_display = ('role', 'created_at', 'snapshot')
    list_filter = ('role',)
    search_fields = ('content',)
    readonly_fields = ('created_at',)


@admin.register(AnalysisStatistic)
class AnalysisStatisticAdmin(admin.ModelAdmin):
    list_display = ('snapshot', 'total_transactions', 'risky_transactions', 'counterparties', 'alerts', 'generated_at')
    readonly_fields = ('generated_at',)
