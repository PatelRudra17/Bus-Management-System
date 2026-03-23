# Quick Start Guide

## Prerequisites
1. **Node.js** (v14 or higher) - Download from https://nodejs.org/
2. **MongoDB** - Install locally or use MongoDB Atlas (cloud)
3. **Git** - For version control (optional)

## Step 1: Setup MongoDB

### Option A: Local MongoDB
1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Install and start MongoDB service
3. Default connection: `mongodb://localhost:27017/buspassdb`

### Option B: MongoDB Atlas (Cloud)
1. Create free account at https://www.mongodb.com/atlas
2. Create a cluster and get connection string
3. Update MONGO_URI in backend/.env

## Step 2: Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## Step 3: Configure Environment

Edit `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/buspassdb
JWT_SECRET=mysecretkey123changeit
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

## Step 4: Initialize Database

```bash
cd backend
npm run init-db
```

This will:
- Create sample routes
- Create admin account (admin@buspass.com / admin123)

## Step 5: Start the Application

### Terminal 1 - Backend
```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

### Terminal 2 - Frontend
```bash
cd frontend
npm start
# App runs on http://localhost:3000
```

## Step 6: Access the Application

Open your browser and go to: http://localhost:3000

### Login Credentials

**Admin Account:**
- Email: admin@buspass.com
- Password: admin123

**Regular User:**
- Register a new account through the registration form

## Project Structure Overview

```
bus 2/
├── backend/              # Express.js API
│   ├── controllers/     # Business logic
│   ├── models/         # Database schemas
│   ├── routes/         # API endpoints
│   ├── middleware/     # Auth & validation
│   ├── utils/          # Helpers (email, logger)
│   ├── server.js       # Entry point
│   └── .env            # Configuration
├── frontend/           # React.js App
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── context/     # State management
│   │   ├── utils/      # API helpers
│   │   ├── App.js      # Main app
│   │   └── index.js    # Entry point
│   └── package.json
└── README.md           # Documentation
```

## Key Features to Try

### As a User:
1. Register and login
2. Browse available routes
3. Apply for a bus pass
4. Upload documents
5. Track application status
6. Download approved pass as PDF

### As an Admin:
1. View dashboard with analytics
2. Review pending applications
3. Approve/reject applications
4. Manage bus routes and fares
5. View payment history
6. Generate reports

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `net start MongoDB` (Windows) or `sudo systemctl start mongod` (Linux)
- Check MONGO_URI in .env file
- For Atlas: Whitelist your IP address

### Port Already in Use
- Change port in backend/.env (e.g., PORT=5001)
- Update frontend API URL in src/utils/api.js

### React App Not Loading
- Check if frontend dependencies installed correctly
- Try clearing cache: `rm -rf node_modules && npm install`
- Check browser console for errors

## API Testing

Use Postman or curl to test API endpoints:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","phone":"1234567890"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@buspass.com","password":"admin123"}'

# Get routes
curl http://localhost:5000/api/routes
```

## Next Steps

1. Configure email settings in .env for email notifications
2. Set up Stripe/Razorpay for payment integration
3. Deploy to production (Heroku, Vercel, AWS, etc.)
4. Add more routes and customize fares
5. Set up CI/CD pipeline

## Support

For issues or questions:
- Check the main README.md
- Review API documentation in routes files
- Check backend logs for errors
