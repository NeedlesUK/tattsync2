/*
# TattSync Studio and TattScore Schema

1. New Tables
   - Studio management tables (studios, members, clients, appointments, etc.)
   - TattScore competition system tables (categories, entries, judges, scores, results)

2. Security
   - Enable RLS on all tables
   - Add policies for proper access control
   
3. Enums and Types
   - Create tattscore_entry_type enum
   - Add new roles to user_role enum
*/

-- First, add new values to user_role enum in a separate transaction
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'judge';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'studio_manager';

-- Create tables for TattSync Studio
CREATE TABLE IF NOT EXISTS studios (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Studio staff/members
CREATE TABLE IF NOT EXISTS studio_members (
  id SERIAL PRIMARY KEY,
  studio_id INTEGER NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('studio_manager', 'artist', 'piercer', 'receptionist', 'apprentice')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(studio_id, user_id)
);

-- Studio clients
CREATE TABLE IF NOT EXISTS studio_clients (
  id SERIAL PRIMARY KEY,
  studio_id INTEGER NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(studio_id, client_id)
);

-- Studio appointments
CREATE TABLE IF NOT EXISTS studio_appointments (
  id SERIAL PRIMARY KEY,
  studio_id INTEGER NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'completed', 'cancelled', 'no_show')),
  appointment_type TEXT NOT NULL CHECK (appointment_type IN ('tattoo', 'piercing', 'consultation', 'touch_up')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Studio consent forms
CREATE TABLE IF NOT EXISTS studio_consent_forms (
  id SERIAL PRIMARY KEY,
  studio_id INTEGER NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  form_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  requires_medical_history BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Studio consent form submissions
CREATE TABLE IF NOT EXISTS studio_form_submissions (
  id SERIAL PRIMARY KEY,
  form_id INTEGER NOT NULL REFERENCES studio_consent_forms(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  submission_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(form_id, client_id, artist_id)
);

-- Studio services
CREATE TABLE IF NOT EXISTS studio_services (
  id SERIAL PRIMARY KEY,
  studio_id INTEGER NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_from DECIMAL(10,2),
  price_to DECIMAL(10,2),
  duration_minutes INTEGER,
  service_type TEXT NOT NULL CHECK (service_type IN ('tattoo', 'piercing', 'other')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Studio business hours
CREATE TABLE IF NOT EXISTS studio_business_hours (
  id SERIAL PRIMARY KEY,
  studio_id INTEGER NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday, 6 = Saturday
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(studio_id, day_of_week)
);

-- Studio artist availability
CREATE TABLE IF NOT EXISTS studio_artist_availability (
  id SERIAL PRIMARY KEY,
  studio_id INTEGER NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME,
  end_time TIME,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(studio_id, artist_id, day_of_week)
);

-- Studio artist time off
CREATE TABLE IF NOT EXISTS studio_artist_time_off (
  id SERIAL PRIMARY KEY,
  studio_id INTEGER NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create tables for TattScore judging system
CREATE TABLE IF NOT EXISTS tattscore_categories (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  max_score INTEGER NOT NULL DEFAULT 10,
  weight DECIMAL(3,2) DEFAULT 1.0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create enum for entry types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tattscore_entry_type') THEN
    CREATE TYPE tattscore_entry_type AS ENUM ('tattoo', 'piercing', 'performance', 'other');
  END IF;
END$$;

-- Create table for competition entries
CREATE TABLE IF NOT EXISTS tattscore_entries (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entry_type tattscore_entry_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_urls TEXT[],
  category_ids INTEGER[],
  entry_number TEXT,
  is_disqualified BOOLEAN DEFAULT false,
  disqualification_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create table for judges
CREATE TABLE IF NOT EXISTS tattscore_judges (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Create table for scores
CREATE TABLE IF NOT EXISTS tattscore_scores (
  id SERIAL PRIMARY KEY,
  entry_id INTEGER NOT NULL REFERENCES tattscore_entries(id) ON DELETE CASCADE,
  judge_id INTEGER NOT NULL REFERENCES tattscore_judges(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES tattscore_categories(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(entry_id, judge_id, category_id)
);

-- Create table for competition results
CREATE TABLE IF NOT EXISTS tattscore_results (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES tattscore_categories(id) ON DELETE SET NULL,
  entry_id INTEGER NOT NULL REFERENCES tattscore_entries(id) ON DELETE CASCADE,
  placement INTEGER NOT NULL, -- 1 = 1st place, 2 = 2nd place, etc.
  total_score DECIMAL(10,2),
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, category_id, placement)
);

-- Create indexes for better performance
-- Studio indexes
CREATE INDEX IF NOT EXISTS idx_studio_members_studio_id ON studio_members(studio_id);
CREATE INDEX IF NOT EXISTS idx_studio_members_user_id ON studio_members(user_id);
CREATE INDEX IF NOT EXISTS idx_studio_clients_studio_id ON studio_clients(studio_id);
CREATE INDEX IF NOT EXISTS idx_studio_clients_client_id ON studio_clients(client_id);
CREATE INDEX IF NOT EXISTS idx_studio_appointments_studio_id ON studio_appointments(studio_id);
CREATE INDEX IF NOT EXISTS idx_studio_appointments_artist_id ON studio_appointments(artist_id);
CREATE INDEX IF NOT EXISTS idx_studio_appointments_client_id ON studio_appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_studio_appointments_start_time ON studio_appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_studio_appointments_status ON studio_appointments(status);
CREATE INDEX IF NOT EXISTS idx_studio_consent_forms_studio_id ON studio_consent_forms(studio_id);
CREATE INDEX IF NOT EXISTS idx_studio_form_submissions_form_id ON studio_form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_studio_form_submissions_client_id ON studio_form_submissions(client_id);
CREATE INDEX IF NOT EXISTS idx_studio_services_studio_id ON studio_services(studio_id);
CREATE INDEX IF NOT EXISTS idx_studio_business_hours_studio_id ON studio_business_hours(studio_id);
CREATE INDEX IF NOT EXISTS idx_studio_artist_availability_studio_id ON studio_artist_availability(studio_id);
CREATE INDEX IF NOT EXISTS idx_studio_artist_availability_artist_id ON studio_artist_availability(artist_id);
CREATE INDEX IF NOT EXISTS idx_studio_artist_time_off_studio_id ON studio_artist_time_off(studio_id);
CREATE INDEX IF NOT EXISTS idx_studio_artist_time_off_artist_id ON studio_artist_time_off(artist_id);

-- TattScore indexes
CREATE INDEX IF NOT EXISTS idx_tattscore_categories_event_id ON tattscore_categories(event_id);
CREATE INDEX IF NOT EXISTS idx_tattscore_entries_event_id ON tattscore_entries(event_id);
CREATE INDEX IF NOT EXISTS idx_tattscore_entries_artist_id ON tattscore_entries(artist_id);
CREATE INDEX IF NOT EXISTS idx_tattscore_judges_event_id ON tattscore_judges(event_id);
CREATE INDEX IF NOT EXISTS idx_tattscore_judges_user_id ON tattscore_judges(user_id);
CREATE INDEX IF NOT EXISTS idx_tattscore_scores_entry_id ON tattscore_scores(entry_id);
CREATE INDEX IF NOT EXISTS idx_tattscore_scores_judge_id ON tattscore_scores(judge_id);
CREATE INDEX IF NOT EXISTS idx_tattscore_scores_category_id ON tattscore_scores(category_id);
CREATE INDEX IF NOT EXISTS idx_tattscore_results_event_id ON tattscore_results(event_id);
CREATE INDEX IF NOT EXISTS idx_tattscore_results_entry_id ON tattscore_results(entry_id);
CREATE INDEX IF NOT EXISTS idx_tattscore_results_category_id ON tattscore_results(category_id);

-- Enable RLS
ALTER TABLE studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_consent_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_artist_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_artist_time_off ENABLE ROW LEVEL SECURITY;
ALTER TABLE tattscore_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tattscore_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE tattscore_judges ENABLE ROW LEVEL SECURITY;
ALTER TABLE tattscore_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE tattscore_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for studios
CREATE POLICY "Studio managers can manage their studios"
  ON studios
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM studio_members sm
      WHERE sm.studio_id = studios.id
      AND sm.user_id = auth.uid()
      AND sm.role = 'studio_manager'
      AND sm.is_active = true
    )
  );

CREATE POLICY "Studio members can view their studios"
  ON studios
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM studio_members sm
      WHERE sm.studio_id = studios.id
      AND sm.user_id = auth.uid()
      AND sm.is_active = true
    )
  );

CREATE POLICY "Admins can manage all studios"
  ON studios
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id
      FROM users u
      WHERE u.role = 'admin'
    )
  );

-- RLS Policies for studio_members
CREATE POLICY "Studio managers can manage studio members"
  ON studio_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM studio_members sm
      WHERE sm.studio_id = studio_members.studio_id
      AND sm.user_id = auth.uid()
      AND sm.role = 'studio_manager'
      AND sm.is_active = true
    )
  );

CREATE POLICY "Studio members can view other members"
  ON studio_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM studio_members sm
      WHERE sm.studio_id = studio_members.studio_id
      AND sm.user_id = auth.uid()
      AND sm.is_active = true
    )
  );

-- RLS Policies for studio_appointments
CREATE POLICY "Studio members can view appointments"
  ON studio_appointments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM studio_members sm
      WHERE sm.studio_id = studio_appointments.studio_id
      AND sm.user_id = auth.uid()
      AND sm.is_active = true
    )
  );

CREATE POLICY "Artists can manage their own appointments"
  ON studio_appointments
  FOR ALL
  TO authenticated
  USING (
    artist_id = auth.uid()
  );

CREATE POLICY "Clients can view their own appointments"
  ON studio_appointments
  FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid()
  );

-- RLS Policies for TattScore
CREATE POLICY "Event managers can manage TattScore categories"
  ON tattscore_categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM events e
      WHERE e.id = tattscore_categories.event_id
      AND e.event_manager_id = auth.uid()
    )
  );

CREATE POLICY "Judges can view TattScore categories"
  ON tattscore_categories
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM tattscore_judges j
      WHERE j.event_id = tattscore_categories.event_id
      AND j.user_id = auth.uid()
      AND j.is_active = true
    )
  );

CREATE POLICY "Artists can submit entries"
  ON tattscore_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (
    artist_id = auth.uid()
  );

-- Fixed the syntax error by splitting into separate policies
CREATE POLICY "Artists can view their own entries"
  ON tattscore_entries
  FOR SELECT
  TO authenticated
  USING (
    artist_id = auth.uid()
  );

CREATE POLICY "Artists can update their own entries"
  ON tattscore_entries
  FOR UPDATE
  TO authenticated
  USING (
    artist_id = auth.uid()
  );

CREATE POLICY "Artists can delete their own entries"
  ON tattscore_entries
  FOR DELETE
  TO authenticated
  USING (
    artist_id = auth.uid()
  );

CREATE POLICY "Event managers can manage all entries"
  ON tattscore_entries
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM events e
      WHERE e.id = tattscore_entries.event_id
      AND e.event_manager_id = auth.uid()
    )
  );

CREATE POLICY "Judges can view entries"
  ON tattscore_entries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM tattscore_judges j
      WHERE j.event_id = tattscore_entries.event_id
      AND j.user_id = auth.uid()
      AND j.is_active = true
    )
  );

CREATE POLICY "Event managers can manage judges"
  ON tattscore_judges
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM events e
      WHERE e.id = tattscore_judges.event_id
      AND e.event_manager_id = auth.uid()
    )
  );

CREATE POLICY "Judges can submit scores"
  ON tattscore_scores
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM tattscore_judges j
      JOIN tattscore_entries e ON e.event_id = j.event_id
      WHERE j.id = tattscore_scores.judge_id
      AND e.id = tattscore_scores.entry_id
      AND j.user_id = auth.uid()
      AND j.is_active = true
    )
  );

CREATE POLICY "Judges can update their own scores"
  ON tattscore_scores
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM tattscore_judges j
      WHERE j.id = tattscore_scores.judge_id
      AND j.user_id = auth.uid()
      AND j.is_active = true
    )
  );

CREATE POLICY "Judges can view scores"
  ON tattscore_scores
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM tattscore_judges j
      JOIN tattscore_entries e ON e.event_id = j.event_id
      WHERE e.id = tattscore_scores.entry_id
      AND j.user_id = auth.uid()
      AND j.is_active = true
    )
  );

CREATE POLICY "Event managers can manage results"
  ON tattscore_results
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM events e
      WHERE e.id = tattscore_results.event_id
      AND e.event_manager_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view published results"
  ON tattscore_results
  FOR SELECT
  TO authenticated
  USING (
    is_published = true
  );