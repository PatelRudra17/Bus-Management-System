# Bus Pass Management System - Agent Instructions

## Project Overview
This is a full-stack MERN (MongoDB, Express.js, React, Node.js) Bus Pass Management System with role-based access control for Users and Admins.

## Running the Application

### Development Mode
```bash
# Backend (Port 5000)
cd backend
npm start
# or
npm run dev

# Frontend (Port 3000)
cd frontend
npm start
```

### Database Initialization
```bash
cd backend
npm run init-db
```

### Testing
```bash
# Backend tests (if configured)
cd backend
npm test

# Frontend tests (if configured)
cd frontend
npm test
```

## Linting & Type Checking
This project uses basic JavaScript validation. Run the following to check for issues:
```bash
# Backend
cd backend
node --check server.js
node --check controllers/*.js
node --check models/*.js

# Frontend
cd frontend
npm run lint  # if eslint is configured
```

## Key Commands Summary

| Command | Location | Description |
|---------|----------|-------------|
| `npm install` | backend/ | Install backend dependencies |
| `npm install` | frontend/ | Install frontend dependencies |
| `npm start` | backend/ | Start backend server |
| `npm start` | frontend/ | Start frontend dev server |
| `npm run dev` | backend/ | Start backend with hot reload |
| `npm run init-db` | backend/ | Initialize database with sample data |

## Environment Variables (Backend)

Required in `backend/.env`:
- `PORT` - Server port (default: 5000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRE` - Token expiration time
- `FRONTEND_URL` - Frontend URL for CORS

## Database Collections
- **Users** - User and admin accounts
- **PassApplications** - Bus pass applications
- **Routes** - Bus routes with fare information
- **Payments** - Payment transactions

## API Base URL
- Backend: `http://localhost:5000/api`
- Frontend: `http://localhost:3000`

## Default Credentials
- Admin: admin@buspass.com / admin123
