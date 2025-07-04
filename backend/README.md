# TattSync Backend API

This is the backend API for the TattSync Event Management System.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   - Copy `.env.example` to `.env`
   - Update the database credentials and other settings

3. **Database Setup**
   - Create a MySQL database
   - Run the database schema creation scripts
   - Update the `.env` file with your database details

4. **Start the Server**
   ```bash
   # Development mode (with auto-restart)
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:slug` - Get event by slug
- `POST /api/events` - Create new event (authenticated)

### Health Check
- `GET /api/health` - Server health status

## Environment Variables

- `DB_HOST` - Database host
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name
- `PORT` - Server port (default: 3003)
- `JWT_SECRET` - JWT signing secret
- `CORS_ORIGIN` - Frontend URL for CORS