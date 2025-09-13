# PM Internship Portal Clone

A complete clone of the PM Internship Portal with backend integration, featuring user registration, login, insurance process completion, and dashboard functionality.

## Features

### Frontend
- **Exact Design Replication**: Matches the original government portal design with blue/orange color scheme
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Interactive Modals**: Login, registration, and insurance completion forms
- **User Dashboard**: Personal dashboard showing insurance and bank account status
- **Modern UI**: Clean, professional interface with smooth animations

### Backend
- **User Authentication**: Secure registration and login with JWT tokens
- **Database Integration**: MongoDB for storing user data and insurance records
- **API Endpoints**: RESTful API for all frontend operations
- **Security**: Password hashing with bcrypt, input validation
- **Insurance Management**: Complete insurance process workflow

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs for password hashing
- **Styling**: Custom CSS with responsive design

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pm-internship-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/pm-internship-portal
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

4. **Start MongoDB**
   - If using local MongoDB: `mongod`
   - If using MongoDB Atlas: Update the connection string in `.env`

5. **Run the application**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login

### User Management
- `GET /api/dashboard/:userId` - Get user dashboard data

### Insurance
- `POST /api/complete-insurance` - Complete insurance process
- `POST /api/verify-bank-account` - Verify bank account status

## Usage Guide

### For Users
1. **Registration**: Click "Youth Registration" to create a new account
2. **Login**: Use your credentials to access the portal
3. **Complete Insurance**: Fill in your policy number to complete the insurance process
4. **Dashboard**: View your status and manage your account

### For Developers
- The frontend is served from the `public` directory
- Backend API is in `server.js`
- Database models are defined using Mongoose schemas
- All API responses follow RESTful conventions

## Project Structure

```
pm-internship-portal/
├── public/
│   ├── index.html          # Main HTML file
│   ├── styles.css          # CSS styling
│   └── script.js           # Frontend JavaScript
├── server.js               # Backend server
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## Features Implemented

### ✅ Completed Features
- [x] Exact visual replication of the original website
- [x] User registration and authentication
- [x] Login/logout functionality
- [x] Insurance process completion
- [x] Bank account verification
- [x] User dashboard
- [x] Responsive design
- [x] Database integration
- [x] Security measures (password hashing, JWT)
- [x] Modal-based UI interactions
- [x] Notification system

### 🔄 Future Enhancements
- [ ] Email notifications
- [ ] File upload for documents
- [ ] Admin panel
- [ ] Advanced user management
- [ ] Payment integration
- [ ] Multi-language support

## Security Features

- **Password Hashing**: All passwords are hashed using bcryptjs
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured CORS for security
- **Environment Variables**: Sensitive data stored in environment variables

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository.

---

**Note**: This is a clone/educational project. Make sure to comply with all applicable laws and regulations when using government-related designs or content.
