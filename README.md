# TattSync - Event Management Platform

TattSync is a comprehensive platform for managing tattoo conventions, studios, and competitions.

## Getting Started

### Prerequisites

- Node.js 16+
- npm 7+
- Supabase account

### Environment Setup

1. Copy the example environment files:
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   ```

2. Update the `.env` and `backend/.env` files with your Supabase credentials:
   - `VITE_SUPABASE_URL` / `SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` / `SUPABASE_ANON_KEY`: Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (backend only)

### Installation

1. Install frontend dependencies:
   ```bash
   npm install
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   cd ..
   ```

### Running the Application

1. Start the frontend development server:
   ```bash
   npm run dev
   ```

2. Start the backend server (in a separate terminal):
   ```bash
   # On Linux/Mac
   ./start-backend.sh
   
   # On Windows
   start-backend.bat
   ```

## Authentication

To use the application, you need to create an admin user in your Supabase project:

1. Go to your Supabase dashboard
2. Navigate to Authentication > Users
3. Click "Add User"
4. Create a user with email and password
5. In the SQL Editor, run:
   ```sql
   INSERT INTO users (id, name, email, role, created_at, updated_at)
   VALUES ('USER_ID_FROM_AUTH', 'Admin Name', 'admin@example.com', 'admin', now(), now());
   ```

## Default Admin Account

After running the migrations, a default admin account is created:

- Email: admin@tattsync.com
- Password: Admin123!

**Important**: This is only for development purposes. In production, you should create your own admin account and delete this default one.

## Features

- Event Management
- Application System
- Payment Processing
- Communication
- Deals & Offers
- Consent Management
- TattScore Competition System
- Studio Management

## License

This project is proprietary and confidential.