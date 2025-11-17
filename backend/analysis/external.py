import random


class ExternalAPIGateway:
    """Заглушка внешних API (KYC, санкционные списки и т.п.)."""

    PROVIDERS = ['ФНС', 'СПАРК', 'Контур', 'Росфинмониторинг']

    def fetch_counterparty_score(self, inn: str) -> dict:
        provider = random.choice(self.PROVIDERS)
        return {
            'provider': provider,
            'inn': inn,
            'score': round(random.uniform(0.4, 0.96), 2),
            'flags': [flag for flag in ['negative_news', 'watch_list', 'delays'] if random.random() > 0.55],
        }

    def latest_signals(self):
        signals = []
        for idx in range(3):
            signals.append(
                {
                    'title': f'Сигнал #{idx + 1}',
                    'description': 'Данные от провайдера о необычной активности контрагента',
                    'provider': random.choice(self.PROVIDERS),
                }
            )
        return signals
