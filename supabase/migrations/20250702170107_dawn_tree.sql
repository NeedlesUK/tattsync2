/*
  # TattSync Database Schema Migration

  1. New Tables
    - `users` - User profiles linked to Supabase auth
    - `events` - Event management with status tracking
    - `applications` - User applications for events

  2. Security
    - Enable RLS on all tables
    - Add policies for user data access
    - Admin-only access for event management
    - Users can only access their own applications

  3. Performance
    - Add indexes for frequently queried columns
    - Unique constraints for data integrity
*/

-- Create custom types (with IF NOT EXISTS to prevent conflicts)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'artist', 'piercer', 'performer', 'trader', 'volunteer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE event_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE application_type AS ENUM ('artist', 'piercer', 'performer', 'trader', 'volunteer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'artist',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id serial PRIMARY KEY,
  name text NOT NULL,
  description text,
  event_slug text UNIQUE NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  location text NOT NULL,
  venue text,
  max_attendees integer DEFAULT 500,
  status event_status DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id serial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id integer NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  application_type application_type NOT NULL,
  status application_status DEFAULT 'pending',
  experience_years integer,
  portfolio_url text,
  additional_info text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Users policies
DO $$ BEGIN
    CREATE POLICY "Users can read own data"
      ON users
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update own data"
      ON users
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can insert own data"
      ON users
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Events policies
DO $$ BEGIN
    CREATE POLICY "Anyone can read published events"
      ON events
      FOR SELECT
      TO authenticated
      USING (status = 'published' OR auth.uid() IN (
        SELECT id FROM users WHERE role = 'admin'
      ));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admins can manage events"
      ON events
      FOR ALL
      TO authenticated
      USING (auth.uid() IN (
        SELECT id FROM users WHERE role = 'admin'
      ));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Applications policies
DO $$ BEGIN
    CREATE POLICY "Users can read own applications"
      ON applications
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid() OR auth.uid() IN (
        SELECT id FROM users WHERE role = 'admin'
      ));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can create own applications"
      ON applications
      FOR INSERT
      TO authenticated
      WITH CHECK (user_id = auth.uid());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update own applications"
      ON applications
      FOR UPDATE
      TO authenticated
      USING (user_id = auth.uid() OR auth.uid() IN (
        SELECT id FROM users WHERE role = 'admin'
      ));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(event_slug);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_event_id ON applications(event_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

-- Insert sample data
INSERT INTO events (name, description, event_slug, start_date, end_date, location, venue, max_attendees, status) VALUES
('Ink Fest 2024', 'The premier tattoo convention on the West Coast', 'ink-fest-2024', '2024-03-15', '2024-03-17', 'Los Angeles, CA', 'LA Convention Center', 500, 'published'),
('Body Art Expo', 'Celebrating all forms of body art and modification', 'body-art-expo-2024', '2024-03-22', '2024-03-24', 'New York, NY', 'Javits Center', 400, 'published'),
('Tattoo Convention', 'Traditional and modern tattoo showcase', 'tattoo-convention-2024', '2024-04-05', '2024-04-07', 'Miami, FL', 'Miami Beach Convention Center', 350, 'draft')
ON CONFLICT (event_slug) DO NOTHING;