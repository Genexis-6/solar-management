# Solar Installation Maintenance Reminder System

`backend/` Node, Express, MongoDB, JWT, RBAC, rate limiting. `frontend/` React (Vite).

## Run
Backend:  `cd backend && npm install && cp .env.example .env` (set MONGODB_URI, JWT_SECRET) then `npm run seed && npm run dev` (port 4000)
Frontend: `cd frontend && npm install && npm run dev` then open http://localhost:5173 (proxies /api to the backend)

Logins (password `Password123!`): admin@solar.test, tech1@solar.test, tech2@solar.test, viewer@solar.test

Production build: `cd frontend && npm run build`; the backend then serves `frontend/dist` itself on port 4000.
