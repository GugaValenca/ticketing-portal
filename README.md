# Ticketing Portal 🎫

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Django](https://img.shields.io/badge/django-%23092E20.svg?style=for-the-badge&logo=django&logoColor=white)
![Django REST Framework](https://img.shields.io/badge/django%20rest%20framework-%23A30000.svg?style=for-the-badge&logo=django&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-%23336791.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/deployed%20on-vercel-black?style=for-the-badge&logo=vercel)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

A full-stack ticket management platform built with Django REST Framework + React (Vite).  
It focuses on practical support-team workflows: authentication, role-aware ticket access, and fast ticket lifecycle management in a clean UI.

## Live Demo 🌐

- **Main Demo (Frontend):** https://ticketing-portal-web.vercel.app/
- **Backend API:** https://ticketing-portal-api.vercel.app/
- **API Docs (Swagger):** https://ticketing-portal-api.vercel.app/api/docs/
- **OpenAPI Schema:** https://ticketing-portal-api.vercel.app/api/schema/
- **Repository:** https://github.com/GugaValenca/ticketing-portal

## Demo Access 🔐

Use these demo accounts in the public frontend login form:

- `admin / Admin@12345`

Administrative tools are reserved for internal management and development use.  
The public demo is focused on the main user workflow through the frontend app.

## Overview 📌

Ticketing Portal is a job-ready portfolio project designed to reflect real full-stack implementation work:
- JWT authentication with refresh flow
- backend permission rules for requester/assignee/staff roles
- practical CRUD operations and ticket updates in the UI
- production deployment for both frontend and backend on Vercel

It demonstrates strong fundamentals in API design, frontend integration, and deployment reliability.

## Features ✨

- JWT login with access/refresh tokens
- Login using username **or** email
- Automatic token refresh with Axios interceptors
- Role-aware ticket visibility (`requester`, `assignee`, `staff/superuser`)
- Ticket CRUD with DRF `ModelViewSet`
- Inline status and priority updates
- Debounced search, filters, sorting, and pagination
- Swagger/OpenAPI documentation with `drf-spectacular`
- Seed command for demo users and sample tickets
- Docker setup for backend + PostgreSQL local development

## Screenshots 📸

![Ticketing Portal - Login](https://via.placeholder.com/1280x720/f8fafc/0f172a?text=Ticketing+Portal+-+Login)
![Ticketing Portal - Dashboard](https://via.placeholder.com/1280x720/f1f5f9/0f172a?text=Ticketing+Portal+-+Dashboard)
![Ticketing Portal - Ticket Details](https://via.placeholder.com/1280x720/e2e8f0/0f172a?text=Ticketing+Portal+-+Ticket+Details)

## Installation 🚀

1. Clone the repository:
```bash
git clone https://github.com/GugaValenca/ticketing-portal.git
cd ticketing-portal
```

2. Backend setup (Python/pip):
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

3. Frontend setup (Node/npm):
```bash
cd ../frontend
npm install
```

## Usage 💡

### Public recruiter flow
1. Open the live demo: `https://ticketing-portal-web.vercel.app/`
2. Sign in with one of the demo credentials above
3. Test the main workflow: list, filter, create, and update tickets

### Local development flow

#### Option A: Docker (backend + PostgreSQL)
From repository root:
```bash
docker compose up --build
```

#### Option B: Run apps separately

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

Optional frontend env:
```env
VITE_API_BASE_URL=http://127.0.0.1:8001
```

## Project Structure 🏗️

```bash
ticketing-portal/
+-- backend/
¦   +-- api/
¦   ¦   +-- index.py
¦   +-- config/
¦   ¦   +-- settings.py
¦   ¦   +-- urls.py
¦   +-- tickets/
¦   ¦   +-- management/commands/seed.py
¦   ¦   +-- auth.py
¦   ¦   +-- models.py
¦   ¦   +-- serializers.py
¦   ¦   +-- permissions.py
¦   ¦   +-- views.py
¦   ¦   +-- me.py
¦   +-- requirements.txt
¦   +-- vercel.json
+-- frontend/
¦   +-- src/
¦   ¦   +-- components/
¦   ¦   +-- lib/api.ts
¦   ¦   +-- App.tsx
¦   ¦   +-- main.tsx
¦   +-- package.json
¦   +-- vercel.json
+-- docker-compose.yml
+-- README.md
```

## Key Technical Highlights / What I Learned 🎯

- Building an end-to-end JWT auth flow with refresh token handling
- Implementing role-based access logic in DRF permissions/querysets
- Integrating frontend state and API error handling for reliable UX
- Structuring a monorepo deployment flow on Vercel (frontend + backend)
- Improving performance and maintainability with practical backend optimizations (`select_related`) and clear app structure

## Technologies Used 🛠️

- **Frontend:** React 19, TypeScript, Vite, Axios, Tailwind CSS
- **Backend:** Python 3.12+, Django 6, Django REST Framework, SimpleJWT, drf-spectacular
- **Database:** PostgreSQL (Docker/production), SQLite (local fallback)
- **Testing:** Vitest (frontend)
- **DevOps/Deploy:** Docker, Docker Compose, Vercel
- **Package Managers:** npm (frontend), pip (backend)

## Future Improvements 🔮

- Add backend automated tests for auth and permission scenarios
- Add better ticket assignment workflow for staff users
- Add audit trails for status/priority changes
- Add CI checks for linting/tests before production deploy
- Add richer observability for API and frontend runtime errors

## Contributing 🤝

1. Fork the project  
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)  
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)  
4. Push to the branch (`git push origin feature/AmazingFeature`)  
5. Open a Pull Request

## License 📄

This project is licensed under the MIT License.

## Contact 📬

**Gustavo Valenca**

[![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)](https://github.com/GugaValenca)
[![LinkedIn](https://img.shields.io/badge/linkedin-%230077B5.svg?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/gugavalenca/)
[![Instagram](https://img.shields.io/badge/Instagram-%23E4405F.svg?style=for-the-badge&logo=Instagram&logoColor=white)](https://www.instagram.com/gugatampa)
[![Twitch](https://img.shields.io/badge/Twitch-%239146FF.svg?style=for-the-badge&logo=Twitch&logoColor=white)](https://www.twitch.tv/gugatampa)
[![Discord](https://img.shields.io/badge/Discord-%235865F2.svg?style=for-the-badge&logo=discord&logoColor=white)](https://discord.com/invite/3QQyR5whBZ)

---

? **If you found this project helpful, please give it a star!**
