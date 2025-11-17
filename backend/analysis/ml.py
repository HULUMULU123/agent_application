import random
from datetime import datetime, timedelta


class MockModelGateway:
    """Заглушка для обращения к ML-моделям.

    Здесь хранятся точки подключения к реальным моделям. Сейчас
    возвращаем синтетические данные, чтобы фронтенд уже умел их рисовать.
    """

    def predict_transactions(self, document_name: str) -> list:
        transactions = []
        for index in range(20):
            transactions.append(
                {
                    'id': index + 1,
                    'document': document_name,
                    'category': random.choice(['Зарплаты', 'Подрядчики', 'Счета', 'Налоги']),
                    'risk': random.choice(['низкий', 'средний', 'высокий']),
                    'amount': round(random.uniform(5_000, 120_000), 2),
                    'currency': 'RUB',
                }
            )
        return transactions

    def build_cashflow_summary(self):
        now = datetime.utcnow()
        months = ['Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь']
        return [
            {
                'month': month,
                'inFlow': round(8 + idx * 1.7 + random.random() * 2, 1),
                'outFlow': round(6 + idx * 1.4 + random.random() * 2.4, 1),
            }
            for idx, month in enumerate(months)
        ]

    def forecast_balance(self):
        base = 40
        stress = 34
        projection = []
        for quarter in ['Q1', 'Q2', 'Q3', 'Q4']:
            base += random.uniform(4, 7)
            stress += random.uniform(2, 5)
            projection.append({'quarter': quarter, 'base': round(base), 'stress': round(stress)})
        return projection

    def build_activity_heatmap(self):
        week_days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
        return [
            {
                'day': day,
                'inflow': random.randint(5, 16),
                'outflow': random.randint(3, 11),
            }
            for day in week_days
        ]

    def next_control_dates(self):
        today = datetime.utcnow()
        return [
            {
                'title': 'Обновление лимитов',
                'date': (today + timedelta(days=idx * 3)).strftime('%d.%m.%Y'),
                'owner': random.choice(['Служба безопасности', 'Финансы', 'Юристы']),
            }
            for idx in range(1, 4)
        ]
