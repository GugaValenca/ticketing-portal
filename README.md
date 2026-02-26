# Ticketing Portal

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Django](https://img.shields.io/badge/django-%23092E20.svg?style=for-the-badge&logo=django&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-%23336791.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/deployed%20on-vercel-black?style=for-the-badge&logo=vercel)

A full-stack ticket management platform built with Django REST Framework + React (Vite), featuring JWT authentication, role-based access, advanced ticket filters, and a modern admin-ready workflow.

## Live Demo

- Frontend: `https://frontend-eight-omega-38.vercel.app`
- Backend API: `https://backend-five-teal-88.vercel.app`
- API docs (Swagger): `https://backend-five-teal-88.vercel.app/api/docs/`
- OpenAPI schema: `https://backend-five-teal-88.vercel.app/api/schema/`

## Features

- JWT authentication (login + refresh token flow)
- Automatic token refresh with Axios interceptors
- Role-aware ticket access (`requester`, `assignee`, `staff/superuser`)
- Full ticket CRUD with DRF `ModelViewSet`
- Status and priority updates directly in ticket details modal
- Search with debounce, filtering, sorting, and pagination
- Professional Django admin branding
- API documentation via `drf-spectacular` (Swagger/OpenAPI)

## Tech Stack

### Backend
- Python 3.12+
- Django 6
- Django REST Framework
- SimpleJWT
- drf-spectacular
- PostgreSQL (production) / SQLite (local fallback)

### Frontend
- React 19
- TypeScript
- Vite
- Axios
- Tailwind CSS
- Vitest

## Project Structure

```bash
ticketing-portal/
+-- backend/
¦   +-- api/
¦   ¦   +-- index.py
¦   +-- config/
¦   ¦   +-- settings.py
¦   ¦   +-- urls.py
¦   ¦   +-- wsgi.py
¦   +-- tickets/
¦   ¦   +-- models.py
¦   ¦   +-- serializers.py
¦   ¦   +-- permissions.py
¦   ¦   +-- views.py
¦   ¦   +-- me.py
¦   ¦   +-- urls.py
¦   +-- manage.py
¦   +-- requirements.txt
¦   +-- vercel.json
+-- frontend/
¦   +-- public/
¦   +-- src/
¦   ¦   +-- components/
¦   ¦   +-- lib/
¦   ¦   +-- App.tsx
¦   ¦   +-- main.tsx
¦   +-- package.json
¦   +-- vite.config.ts
+-- docker-compose.yml
+-- README.md
```

## API Endpoints

- `POST /api/token/` - obtain access + refresh token
- `POST /api/token/refresh/` - refresh access token
- `GET /api/me/` - authenticated user profile
- `GET /api/tickets/` - list tickets (permission-aware)
- `POST /api/tickets/` - create ticket (requester = current user)
- `PATCH /api/tickets/{id}/` - update ticket fields
- `GET /api/docs/` - Swagger UI
- `GET /api/schema/` - OpenAPI schema

## Installation

1. Clone the repository:
```bash
git clone https://github.com/GugaValenca/ticketing-portal.git
cd ticketing-portal
```

2. Backend setup:
```bash
cd backend
python -m venv .venv
```

Windows:
```bash
.venv\Scripts\activate
```

Mac/Linux:
```bash
source .venv/bin/activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

Create environment variables (example):
```env
DJANGO_SECRET_KEY=change-me
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost
CORS_ALLOWED_ORIGINS=http://localhost:5173
CSRF_TRUSTED_ORIGINS=http://localhost:5173
# optional for local postgres:
# DATABASE_URL=postgresql://user:password@localhost:5432/ticketing_db
```

Run migrations and seed data:
```bash
python manage.py migrate
python manage.py seed
```

Run backend:
```bash
python manage.py runserver
```

3. Frontend setup:
```bash
cd ../frontend
npm install
```

Create `.env`:
```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Run frontend:
```bash
npm run dev
```

## Production Deployment

### Backend (Vercel)

Required env vars:
- `DJANGO_SECRET_KEY`
- `DEBUG=False`
- `ALLOWED_HOSTS=.vercel.app,localhost,127.0.0.1`
- `CORS_ALLOWED_ORIGINS=<frontend-url>,http://localhost:5173`
- `CSRF_TRUSTED_ORIGINS=<frontend-url>`
- `DATABASE_URL=<postgres-connection-string>`

Deploy:
```bash
cd backend
npx vercel --prod
```

### Frontend (Vercel)

Required env vars:
- `VITE_API_BASE_URL=https://your-backend.vercel.app`

Deploy:
```bash
cd frontend
npx vercel --prod
```

## License

This project is licensed under the MIT License.

## Contact

**Gustavo Valenca**

[![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)](https://github.com/GugaValenca)
[![LinkedIn](https://img.shields.io/badge/linkedin-%230077B5.svg?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/gugavalenca/)
[![Instagram](https://img.shields.io/badge/Instagram-%23E4405F.svg?style=for-the-badge&logo=Instagram&logoColor=white)](https://www.instagram.com/gugatampa)
[![Twitch](https://img.shields.io/badge/Twitch-%239146FF.svg?style=for-the-badge&logo=Twitch&logoColor=white)](https://www.twitch.tv/gugatampa)
[![Discord](https://img.shields.io/badge/Discord-%235865F2.svg?style=for-the-badge&logo=discord&logoColor=white)](https://discord.com/invite/3QQyR5whBZ)

---

If you found this project helpful, please give it a star.
