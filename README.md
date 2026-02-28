# NexaLink Telecom Service Desk

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Django](https://img.shields.io/badge/django-%23092E20.svg?style=for-the-badge&logo=django&logoColor=white)
![Django REST Framework](https://img.shields.io/badge/django%20rest%20framework-%23A30000.svg?style=for-the-badge&logo=django&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-%23336791.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/deployed%20on-vercel-black?style=for-the-badge&logo=vercel)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

A full-stack service desk platform for an internet provider workflow, built with Django REST Framework and React (Vite).
It combines authentication, role-aware ticket access, and a practical UI for tracking internet service incidents.

## Live Demo

- **Main Demo:** https://ticketing-portal-web.vercel.app/
- **API:** https://ticketing-portal-api.vercel.app/
- **API Docs (Swagger):** https://ticketing-portal-api.vercel.app/api/docs/
- **OpenAPI Schema:** https://ticketing-portal-api.vercel.app/api/schema/
- **Repository:** https://github.com/GugaValenca/ticketing-portal

## Overview

NexaLink Telecom Service Desk is a job-ready portfolio project designed to simulate real ISP support operations:

- A React + TypeScript frontend with filtering, sorting, and pagination UX
- A Django REST API with JWT authentication and permission-aware access rules
- Production deployment on Vercel for frontend and backend
- Docker-based local setup for backend and PostgreSQL

The public demo is focused on the main user workflow. Administrative tools are reserved for internal management and development use.

## Features

- JWT authentication with refresh token flow
- Login support using username or email
- Automatic token refresh using Axios interceptors
- Role-aware ticket access for requester, assignee, and staff/superuser rules
- Ticket CRUD via DRF ModelViewSet
- Status updates in the ticket details flow
- Priority managed by administrators via Django admin
- Debounced search, status/priority filters, sorting, and pagination
- API documentation with drf-spectacular (Swagger/OpenAPI)
- Seed command for development/demo dataset creation

## Screenshots

![NexaLink Service Desk - Login](https://via.placeholder.com/1280x720/f8fafc/0f172a?text=NexaLink+Service+Desk+-+Login)
![NexaLink Service Desk - Ticket Dashboard](https://via.placeholder.com/1280x720/f1f5f9/0f172a?text=NexaLink+Service+Desk+-+Ticket+Dashboard)
![NexaLink Service Desk - Ticket Details](https://via.placeholder.com/1280x720/e2e8f0/0f172a?text=NexaLink+Service+Desk+-+Ticket+Details)

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

macOS/Linux:

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

### Public Demo Flow

1. Open the main demo URL
2. Sign in with safe public demo credentials when available
3. Create, filter, and update tickets to evaluate the full workflow

### Demo Access

If demo access is required and no public credentials are documented, use placeholders:

- Username or Email: `[DEMO_EMAIL_OR_USERNAME]`
- Password: `[DEMO_PASSWORD]`

### Local Development

Option A: Docker backend + PostgreSQL

```bash
docker compose up --build
```

Option B: run backend and frontend separately

Backend:

```bash
cd backend
python manage.py migrate
python manage.py runserver
```

Frontend:

```bash
cd frontend
npm run dev
```

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
|   |   |-- auth.py
|   |   |-- models.py
|   |   |-- serializers.py
|   |   |-- permissions.py
|   |   |-- views.py
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

## Key Technical Highlights / What I Learned

- Implementing end-to-end JWT auth with automatic refresh handling
- Building practical permission logic for role-aware access in DRF
- Connecting frontend UX state to secure backend flows with resilient API handling
- Structuring Vercel deployment for a monorepo with separate frontend/backend apps
- Improving backend performance with query optimization (`select_related`)

## Technologies Used

- **Frontend:** React 19, TypeScript, Vite, Axios, Tailwind CSS
- **Backend:** Python 3.12+, Django 6, Django REST Framework, SimpleJWT, drf-spectacular
- **Database:** PostgreSQL (production/Docker), SQLite (local fallback)
- **Testing:** Vitest
- **Deployment:** Vercel
- **Containerization:** Docker, Docker Compose
- **Package Managers:** npm (frontend), pip (backend)

## Future Improvements

- Add backend automated tests for auth and permission behavior
- Expand ticket assignment and workflow controls in the UI
- Add richer audit history for key ticket updates
- Add CI checks for linting/tests on pull requests
- Improve observability for API and frontend runtime errors

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m "Add some AmazingFeature"`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

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
