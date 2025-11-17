import random
from datetime import datetime, timedelta


class MockModelGateway:
    """Заглушка для обращения к ML-моделям.

    Здесь хранятся точки подключения к реальным моделям. Сейчас
    возвращаем синтетические данные, чтобы фронтенд уже умел их рисовать.
    """

    def predict_transactions(self, document_name: str) -> list:
        transactions = []
        base_datetime = datetime.utcnow()
        categories = ['Зарплаты', 'Подрядчики', 'Счета', 'Налоги', 'Закупки']
        statuses = ['Выполнено', 'Ожидает', 'Отклонено']
        channels = ['API', 'Мобильный банк', 'Интернет-банк']
        tags = ['Рутинное', 'Требует внимания', 'Высокий приоритет']

        for index in range(28):
            ts = base_datetime.replace(hour=9) + timedelta(hours=index * 5)
            amount = round(random.uniform(5_000, 120_000), 2)
            is_income = bool(random.getrandbits(1))
            counterparty = f'Контрагент {index + 1}'
            transactions.append(
                {
                    'id': index + 1,
                    'document': document_name,
                    'category': random.choice(categories),
                    'risk': random.choice(['низкий', 'средний', 'высокий']),
                    'amount': amount if is_income else -amount,
                    'currency': 'RUB',
                    'date': ts.strftime('%d.%m.%Y'),
                    'time': ts.strftime('%H:%M'),
                    'counterparty': counterparty,
                    'inn': f"77{(4500000 + index * 19):07d}",
                    'kpp': f"77{(5500000 + index * 13):07d}",
                    'purpose': f'Оплата по договору №{3200 + index}',
                    'status': random.choice(statuses),
                    'channel': random.choice(channels),
                    'tag': random.choice(tags),
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

    def counterparty_volume(self, transactions: list) -> list:
        buckets = {}
        for tx in transactions:
            counterparty = tx.get('counterparty', 'Неизвестно')
            amount = abs(tx.get('amount') or 0)
            buckets[counterparty] = buckets.get(counterparty, 0) + amount
        sorted_items = sorted(buckets.items(), key=lambda item: item[1], reverse=True)[:4]
        return [{'name': name, 'value': round(value, 2)} for name, value in sorted_items]

    def risk_mix(self, transactions: list) -> list:
        risk_buckets = {'низкий': 0, 'средний': 0, 'высокий': 0}
        for tx in transactions:
            risk = tx.get('risk') or 'средний'
            risk_buckets[risk] = risk_buckets.get(risk, 0) + 1
        total = sum(risk_buckets.values()) or 1
        return [
            {'name': name.capitalize(), 'value': round(count * 100 / total)}
            for name, count in risk_buckets.items()
        ]

    def counterparty_trend(self, transactions: list) -> list:
        month_buckets = {}
        for tx in transactions:
            month_label = tx.get('date', '')[3:5]  # assumes dd.MM.YYYY
            month_buckets[month_label] = month_buckets.get(month_label, 0) + 1
        labels = ['07', '08', '09', '10', '11', '12']
        mapping = {'07': 'Июль', '08': 'Авг', '09': 'Сен', '10': 'Окт', '11': 'Ноя', '12': 'Дек'}
        return [
            {'month': mapping.get(label, label), 'operations': month_buckets.get(label, 0) + index * 3}
            for index, label in enumerate(labels)
        ]

    def counterparty_velocity(self, transactions: list) -> list:
        velocity = []
        week_counts = {}
        for tx in transactions:
            try:
                parsed = datetime.strptime(tx.get('date'), '%d.%m.%Y')
            except Exception:
                continue
            week = parsed.isocalendar().week
            week_counts[week] = week_counts.get(week, 0) + 1

        for index, (week, count) in enumerate(sorted(week_counts.items())):
            velocity.append(
                {
                    'week': f'Нед {index + 1}',
                    'newPartners': count,
                    'alerts': max(1, count // 3),
                }
            )
        return velocity or [{'week': 'Нед 1', 'newPartners': 4, 'alerts': 1}]
