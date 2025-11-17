from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='UploadedDocument',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file', models.FileField(upload_to='uploads/')),
                ('display_name', models.CharField(max_length=255)),
                (
                    'kind',
                    models.CharField(
                        choices=[('pdf', 'PDF'), ('csv', 'CSV'), ('excel', 'Excel')], max_length=16
                    ),
                ),
                (
                    'status',
                    models.CharField(
                        choices=[('получен', 'Получен'), ('анализируется', 'Анализируется'), ('готово', 'Готово'), ('архив', 'Архив')],
                        default='получен',
                        max_length=32,
                    ),
                ),
                ('source', models.CharField(default='Веб-интерфейс', max_length=64)),
                ('uploaded_at', models.DateTimeField(auto_now_add=True)),
                ('detected_columns', models.PositiveIntegerField(default=0)),
                ('detected_rows', models.PositiveIntegerField(default=0)),
                ('preview_notes', models.TextField(blank=True)),
            ],
            options={
                'ordering': ['-uploaded_at'],
                'verbose_name': 'Загруженный документ',
                'verbose_name_plural': 'Загруженные документы',
            },
        ),
        migrations.CreateModel(
            name='AnalysisSnapshot',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('payload', models.JSONField(default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                (
                    'source_document',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='snapshots',
                        to='analysis.uploadeddocument',
                    ),
                ),
            ],
            options={
                'ordering': ['-created_at'],
                'verbose_name': 'Срез анализа',
                'verbose_name_plural': 'Срезы анализа',
            },
        ),
    ]
