# preza

## Запуск фронтенда

```bash
cd frontend
npm install
npm run dev
```

## Запуск Django бэкенда

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Бэкенд использует [django-jazzmin](https://github.com/farridav/django-jazzmin) для оформления админки и выдает API на `/api/`:

- `POST /api/uploads/` — загрузка CSV, PDF или Excel и проброс в пайплайн ML.
- `GET /api/uploads/` — список последних загрузок (с заглушками, чтобы интерфейс был заполнен).
- `GET /api/analysis/summary/` — сводка анализа с предобученными демо-данными.
- `GET /api/exports/csv|excel/` — выгрузка таблиц для проверки UI.

Фронтенд ожидает адрес API в переменной `VITE_API_BASE` (по умолчанию `http://localhost:8000/api`).
