# Gym API (Django + DRF)

## Setup

PowerShell:

```
cd gym_api
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
$env:DJANGO_SETTINGS_MODULE="config.settings"
python manage.py makemigrations
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

API base: `/api/`

- Members: `/api/members/`
- Plans: `/api/plans/`
- Subscriptions: `/api/subscriptions/`

CORS is open for local development. Configure `ALLOWED_HOSTS` and CORS in `config/settings.py` for production.





