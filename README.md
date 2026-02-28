# Ticketing Portal

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Django](https://img.shields.io/badge/django-%23092E20.svg?style=for-the-badge&logo=django&logoColor=white)
![Django REST Framework](https://img.shields.io/badge/django%20rest%20framework-%23A30000.svg?style=for-the-badge&logo=django&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-%23336791.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/deployed%20on-vercel-black?style=for-the-badge&logo=vercel)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

A full-stack ticket management platform built with Django REST Framework + React (Vite), focused on real-world support workflows: authentication, permission-aware ticket access, and fast day-to-day ticket operations.

## Live Demo

- Frontend: <a href="https://ticketing-portal-web.vercel.app/" target="_blank" rel="noopener noreferrer">https://ticketing-portal-web.vercel.app/</a>
- Backend API: <a href="https://ticketing-portal-api.vercel.app/" target="_blank" rel="noopener noreferrer">https://ticketing-portal-api.vercel.app/</a>
- API Docs (Swagger): <a href="https://ticketing-portal-api.vercel.app/api/docs/" target="_blank" rel="noopener noreferrer">https://ticketing-portal-api.vercel.app/api/docs/</a>
- OpenAPI Schema: <a href="https://ticketing-portal-api.vercel.app/api/schema/" target="_blank" rel="noopener noreferrer">https://ticketing-portal-api.vercel.app/api/schema/</a>
- Repository: <a href="https://github.com/GugaValenca/ticketing-portal" target="_blank" rel="noopener noreferrer">https://github.com/GugaValenca/ticketing-portal</a>

## Features

- **JWT Authentication**: Sign-in flow with access + refresh tokens
- **Username or Email Login**: Flexible login support on the backend
- **Automatic Token Refresh**: Axios interceptors handle token renewal on 401
- **Role-Aware Access Control**: `requester`, `assignee`, and `staff/superuser` visibility rules
- **Ticket CRUD**: Create, list, update, and manage tickets through DRF endpoints
- **Status & Priority Updates**: Inline updates inside the ticket details modal
- **Search and Filters**: Debounced search, status/priority filters, sorting, and pagination
- **Admin Experience**: Branded Django admin with practical list/search/filter setup
- **API Documentation**: Swagger/OpenAPI powered by `drf-spectacular`
- **Docker-Friendly Local Setup**: Backend + PostgreSQL via `docker-compose`

## Screenshots

![Login Screen Placeholder](https://via.placeholder.com/1280x720/f8fafc/0f172a?text=Ticketing+Portal+-+Login+Screen)
![Tickets Dashboard Placeholder](https://via.placeholder.com/1280x720/f1f5f9/0f172a?text=Ticketing+Portal+-+Tickets+Dashboard)
![Ticket Details Placeholder](https://via.placeholder.com/1280x720/e2e8f0/0f172a?text=Ticketing+Portal+-+Ticket+Details+Modal)

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

Install backend dependencies:
```bash
pip install -r requirements.txt
```

3. Frontend setup:
```bash
cd ../frontend
npm install
```

## Usage

### Option A: Run with Docker (Backend + PostgreSQL)

From the repository root:
```bash
docker compose up --build
```

Backend will be available at:
- `http://127.0.0.1:8001`

### Option B: Run Backend/Frontend Separately

Backend:
```bash
cd backend
python manage.py migrate
python manage.py seed
python manage.py runserver
```

Frontend:
```bash
cd frontend
npm run dev
```

Optional frontend env (`frontend/.env`):
```env
VITE_API_BASE_URL=http://127.0.0.1:8001
```

Demo users created by `python manage.py seed`:
- `admin / Admin@12345`
- `LaisLany / Lais@12345`
- `GugaTampa / @Tampa5000`

## Project Structure

```bash
ticketing-portal/
|-- backend/
|   |-- api/
|   |   |-- index.py
|   |-- config/
|   |   |-- settings.py
|   |   |-- urls.py
|   |-- tickets/
|   |   |-- management/commands/seed.py
|   |   |-- models.py
|   |   |-- serializers.py
|   |   |-- permissions.py
|   |   |-- views.py
|   |   |-- auth.py
|   |   |-- me.py
|   |   |-- admin.py
|   |-- requirements.txt
|   |-- vercel.json
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- lib/api.ts
|   |   |-- App.tsx
|   |   |-- main.tsx
|   |-- package.json
|   |-- vercel.json
|-- docker-compose.yml
|-- README.md
```

## Key Technical Highlights

- Built a **full authentication cycle** with JWT + refresh token rotation
- Implemented **permission-aware data access** in DRF for realistic multi-role behavior
- Added **frontend resilience** with request/response interceptors and token queue handling
- Structured backend for deployment with **Vercel Python serverless entrypoint**
- Improved maintainability with practical admin configuration, clear serializers, and explicit permission classes

## Technologies Used

- **Frontend**: React 19, TypeScript, Vite, Axios, Tailwind CSS
- **Backend**: Python 3.12+, Django 6, Django REST Framework, SimpleJWT, drf-spectacular
- **Database**: PostgreSQL (Docker/production), SQLite (local fallback)
- **Testing**: Vitest (frontend)
- **Deployment**: Vercel (frontend + backend)
- **Containerization**: Docker, Docker Compose

## Future Improvements

- Add backend automated tests for auth and permission flows
- Add ticket assignment workflow UI for admin/staff actions
- Add richer audit metadata (who changed status/priority and when)
- Improve observability with structured logging and basic error monitoring
- Add CI checks for linting/tests before deployment

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Contact

**Gustavo Valenca**

<a href="https://github.com/GugaValenca" target="_blank" rel="noopener noreferrer"><img alt="GitHub" src="https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white" /></a>
<a href="https://www.linkedin.com/in/gugavalenca/" target="_blank" rel="noopener noreferrer"><img alt="LinkedIn" src="https://img.shields.io/badge/linkedin-%230077B5.svg?style=for-the-badge&logo=linkedin&logoColor=white" /></a>
<a href="https://www.instagram.com/gugatampa" target="_blank" rel="noopener noreferrer"><img alt="Instagram" src="https://img.shields.io/badge/Instagram-%23E4405F.svg?style=for-the-badge&logo=Instagram&logoColor=white" /></a>
<a href="https://www.twitch.tv/gugatampa" target="_blank" rel="noopener noreferrer"><img alt="Twitch" src="https://img.shields.io/badge/Twitch-%239146FF.svg?style=for-the-badge&logo=Twitch&logoColor=white" /></a>
<a href="https://discord.com/invite/3QQyR5whBZ" target="_blank" rel="noopener noreferrer"><img alt="Discord" src="https://img.shields.io/badge/Discord-%235865F2.svg?style=for-the-badge&logo=discord&logoColor=white" /></a>

---

**If you found this project helpful, please give it a star!**
