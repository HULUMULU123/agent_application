import django.db.models.deletion
from django.db import migrations, models


def seed_initial_data(apps, schema_editor):
    UploadedDocument = apps.get_model('analysis', 'UploadedDocument')
    AnalysisSnapshot = apps.get_model('analysis', 'AnalysisSnapshot')
    AgentMessage = apps.get_model('analysis', 'AgentMessage')
    AnalysisStatistic = apps.get_model('analysis', 'AnalysisStatistic')

    if AnalysisSnapshot.objects.exists():
        return

    from django.core.files.base import ContentFile
    from django.utils import timezone
    from analysis.services import build_analysis_payload, detect_kind

    demo_content = 'date,amount,currency\n2024-11-12,18250,RUB\n2024-11-13,-7420,RUB\n'

    document = UploadedDocument(
        display_name='demo_statement.csv',
        kind=detect_kind('demo_statement.csv'),
        status='готово',
        source='Демо пайплайн',
        detected_columns=3,
        detected_rows=2,
        preview_notes='Демонстрационные данные для стартового экрана.',
    )
    document.file.save('demo_statement.csv', ContentFile(demo_content), save=True)

    payload = build_analysis_payload(document.display_name)
    snapshot = AnalysisSnapshot.objects.create(
        title='Демонстрационный анализ',
        payload=payload,
        created_at=timezone.now(),
        source_document=document,
    )

    transactions = payload.get('transactions', [])
    risky_transactions = len([item for item in transactions if str(item.get('risk', '')).startswith('выс')])
    AnalysisStatistic.objects.create(
        snapshot=snapshot,
        total_transactions=len(transactions),
        risky_transactions=risky_transactions,
        counterparties=len(payload.get('registry', [])),
        alerts=len(payload.get('signals', [])),
    )

    AgentMessage.objects.bulk_create(
        [
            AgentMessage(
                snapshot=snapshot,
                role='system',
                content='Создан демо-срез на основе загруженной выписки для витрины.',
            ),
            AgentMessage(
                snapshot=snapshot,
                role='user',
                content='Загрузил таблицу с выпиской. Проверь агрегаты и риски.',
            ),
            AgentMessage(
                snapshot=snapshot,
                role='assistant',
                content='Проанализировал выписку, построил графики и сегментировал контрагентов.',
            ),
        ]
    )


class Migration(migrations.Migration):
    dependencies = [
        ('analysis', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='AgentMessage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('role', models.CharField(choices=[('user', 'Пользователь'), ('assistant', 'Ассистент'), ('system', 'Система')], max_length=16)),
                ('content', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                (
                    'snapshot',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='messages',
                        to='analysis.analysissnapshot',
                    ),
                ),
            ],
            options={
                'ordering': ['created_at'],
                'verbose_name': 'Сообщение агента',
                'verbose_name_plural': 'Сообщения агента',
            },
        ),
        migrations.CreateModel(
            name='AnalysisStatistic',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('total_transactions', models.PositiveIntegerField(default=0)),
                ('risky_transactions', models.PositiveIntegerField(default=0)),
                ('counterparties', models.PositiveIntegerField(default=0)),
                ('alerts', models.PositiveIntegerField(default=0)),
                ('generated_at', models.DateTimeField(auto_now_add=True)),
                (
                    'snapshot',
                    models.OneToOneField(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='statistics',
                        to='analysis.analysissnapshot',
                    ),
                ),
            ],
            options={
                'ordering': ['-generated_at'],
                'verbose_name': 'Статистика анализа',
                'verbose_name_plural': 'Статистика анализов',
            },
        ),
        migrations.RunPython(seed_initial_data, migrations.RunPython.noop),
    ]
