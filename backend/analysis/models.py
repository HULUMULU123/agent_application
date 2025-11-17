from django.db import models


class UploadedDocument(models.Model):
    KIND_CHOICES = (
        ('pdf', 'PDF'),
        ('csv', 'CSV'),
        ('excel', 'Excel'),
    )

    STATUS_CHOICES = (
        ('получен', 'Получен'),
        ('анализируется', 'Анализируется'),
        ('готово', 'Готово'),
        ('архив', 'Архив'),
    )

    file = models.FileField(upload_to='uploads/')
    display_name = models.CharField(max_length=255)
    kind = models.CharField(max_length=16, choices=KIND_CHOICES)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default='получен')
    source = models.CharField(max_length=64, default='Веб-интерфейс')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    detected_columns = models.PositiveIntegerField(default=0)
    detected_rows = models.PositiveIntegerField(default=0)
    preview_notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-uploaded_at']
        verbose_name = 'Загруженный документ'
        verbose_name_plural = 'Загруженные документы'

    def __str__(self):
        return self.display_name


class AnalysisSnapshot(models.Model):
    title = models.CharField(max_length=255)
    payload = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    source_document = models.ForeignKey(UploadedDocument, on_delete=models.CASCADE, related_name='snapshots', null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Срез анализа'
        verbose_name_plural = 'Срезы анализа'

    def __str__(self):
        return f"{self.title} ({self.created_at:%Y-%m-%d})"
