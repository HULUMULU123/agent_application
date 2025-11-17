from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AnalysisSummaryView, ExportCSVView, ExportExcelView, UploadedDocumentViewSet

router = DefaultRouter()
router.register('uploads', UploadedDocumentViewSet, basename='uploads')

urlpatterns = [
    path('', include(router.urls)),
    path('analysis/summary/', AnalysisSummaryView.as_view(), name='analysis-summary'),
    path('exports/csv/', ExportCSVView.as_view(), name='export-csv'),
    path('exports/excel/', ExportExcelView.as_view(), name='export-excel'),
]
