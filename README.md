# Bus Pass Management System

A comprehensive full-stack Bus Pass Management System built with the MERN Stack (MongoDB, Express.js, React, Node.js).

## Features

### User Features
- User registration and login with JWT authentication
- Secure password hashing
- Apply for bus pass with route, duration, and type selection
- Upload required documents (ID proof, photo)
- View application status (Pending, Approved, Rejected)
- Download approved bus pass as PDF with QR code
- View pass history and renewal option
- In-app notifications

### Admin Features
- Admin dashboard with analytics
- Approve or reject pass applications with remarks
- Manage routes and fare pricing
- View and manage users
- Generate reports (daily/monthly/yearly)
- Search and filter applications
- Export data to CSV/PDF

### Technical Features
- QR code generation for each pass
- Real-time notifications using Socket.io
- Email notifications (NodeMailer)
- File upload system using Multer
- RESTful API with proper error handling
- Role-based authentication and protected routes
- MVC architecture
- Responsive UI design

## Tech Stack

- **Frontend**: React.js, Bootstrap, Chart.js, Socket.io Client
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Uploads**: Multer
- **PDF Generation**: PDFKit
- **QR Codes**: QRCode
- **Real-time**: Socket.io

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/buspassdb
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FRONTEND_URL=http://localhost:3000
```

4. Start the backend server:
```bash
npm start
# or for development with hot reload:
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the React application:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Default Admin Account

On first run, create an admin account using the registration endpoint or through the API:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@buspass.com",
    "password": "admin123",
    "phone": "1234567890",
    "role": "admin"
  }'
```

Or update an existing user's role to 'admin' directly in the database.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### User Routes
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/applications` - Get user's applications
- `GET /api/users/passes` - Get user's approved passes

### Admin Routes
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/applications` - Get all applications
- `POST /api/admin/applications/:id/approve` - Approve application
- `POST /api/admin/applications/:id/reject` - Reject application
- `GET /api/admin/routes` - Manage routes
- `GET /api/admin/reports` - Generate reports

### Application Routes
- `POST /api/applications` - Create new application
- `GET /api/applications/:id` - Get application details
- `GET /api/applications/:id/download` - Download pass PDF

### Route Management
- `GET /api/routes` - Get all routes
- `POST /api/routes` - Create new route (admin)
- `PUT /api/routes/:id` - Update route (admin)

### Payments
- `POST /api/payments` - Process payment
- `GET /api/payments` - Get all payments (admin)

## Project Structure

```
bus-pass-management/
├── backend/
│   ├── controllers/       # Route controllers
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── middleware/       # Auth & error handling
│   ├── utils/            # Helper functions
│   ├── uploads/          # Uploaded files
│   ├── server.js         # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── context/      # React contexts
│   │   ├── utils/        # Helper functions
│   │   ├── App.js        # Main app component
│   │   └── index.js      # Entry point
│   ├── public/
│   └── package.json
└── README.md
```

## Usage

1. **Register** as a new user
2. **Login** with your credentials
3. **Browse routes** and select your preferred route
4. **Apply for a pass** by filling the form and uploading documents
5. **Track application status** in your dashboard
6. **Download pass** once approved

### For Admins:
1. **Login** with admin credentials
2. **View dashboard** for analytics
3. **Review applications** and approve/reject
4. **Manage routes** and update fares
5. **Generate reports** for insights

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Role-based access control
- Input validation and sanitization
- Protected API routes
- Secure file uploads

## Future Enhancements

- Payment gateway integration (Stripe/Razorpay)
- Mobile app version
- Real-time chat support
- Advanced analytics
- Multi-language support
- Dark mode UI

## License

MIT License

## Support

For support, email support@buspass.com or create an issue in the repository.
