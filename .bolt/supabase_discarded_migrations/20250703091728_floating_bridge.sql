/*
  # Booking Module Schema

  1. New Tables
    - `booking_settings` - Stores artist booking calendar settings
    - `booking_preferences` - Stores artist booking status and contact preferences
    - `bookings` - Stores actual booking appointments
    - `booking_reminders` - Tracks reminder emails sent for bookings

  2. Security
    - Enable RLS on all tables
    - Add policies for artists to manage their own bookings
    - Add policies for clients to view and manage their bookings

  3. Functions
    - Create function to send booking reminders
    - Create function to update booking status
*/

-- Create booking_settings table
CREATE TABLE IF NOT EXISTS booking_settings (
  id SERIAL PRIMARY KEY,
  application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT true,
  default_slot_duration INTEGER NOT NULL DEFAULT 30, -- minutes
  booking_hours JSONB NOT NULL DEFAULT '{"start": "10:00", "end": "18:00"}'::jsonb,
  available_dates DATE[] DEFAULT ARRAY[]::DATE[],
  buffer_time INTEGER DEFAULT 15, -- minutes between bookings
  max_bookings_per_day INTEGER,
  allow_client_cancellation BOOLEAN DEFAULT true,
  cancellation_deadline_hours INTEGER DEFAULT 24,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create booking_preferences table
CREATE TABLE IF NOT EXISTS booking_preferences (
  id SERIAL PRIMARY KEY,
  application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  booking_status TEXT NOT NULL DEFAULT 'taking_walkups' CHECK (booking_status IN ('fully_booked', 'advance_bookings', 'taking_walkups')),
  contact_method TEXT,
  contact_details TEXT,
  booking_notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  consent_form_id INTEGER REFERENCES form_submissions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create booking_reminders table
CREATE TABLE IF NOT EXISTS booking_reminders (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('30min', '10min', 'day_before', 'confirmation', 'cancellation', 'aftercare')),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  recipient_email TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT true
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_booking_settings_application_id ON booking_settings(application_id);
CREATE INDEX IF NOT EXISTS idx_booking_preferences_application_id ON booking_preferences(application_id);
CREATE INDEX IF NOT EXISTS idx_bookings_application_id ON bookings(application_id);
CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event_id ON bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_booking_reminders_booking_id ON booking_reminders(booking_id);

-- Enable RLS
ALTER TABLE booking_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for booking_settings
CREATE POLICY "Artists can manage their own booking settings"
  ON booking_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM applications a
      WHERE a.id = booking_settings.application_id
      AND a.user_id = auth.uid()
    )
  );

-- RLS Policies for booking_preferences
CREATE POLICY "Artists can manage their own booking preferences"
  ON booking_preferences
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM applications a
      WHERE a.id = booking_preferences.application_id
      AND a.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can read booking preferences for approved applications"
  ON booking_preferences
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM applications a
      WHERE a.id = booking_preferences.application_id
      AND a.status = 'approved'
    )
  );

-- RLS Policies for bookings
CREATE POLICY "Artists can manage bookings for their applications"
  ON bookings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM applications a
      WHERE a.id = bookings.application_id
      AND a.user_id = auth.uid()
    )
  );

CREATE POLICY "Clients can view and manage their own bookings"
  ON bookings
  FOR ALL
  TO authenticated
  USING (
    client_id = auth.uid()
  );

CREATE POLICY "Event managers can view all bookings for their events"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM events e
      WHERE e.id = bookings.event_id
      AND e.event_manager_id = auth.uid()
    )
  );

-- RLS Policies for booking_reminders
CREATE POLICY "Artists can view reminders for their bookings"
  ON booking_reminders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM bookings b
      JOIN applications a ON a.id = b.application_id
      WHERE b.id = booking_reminders.booking_id
      AND a.user_id = auth.uid()
    )
  );

CREATE POLICY "Clients can view reminders for their bookings"
  ON booking_reminders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM bookings b
      WHERE b.id = booking_reminders.booking_id
      AND b.client_id = auth.uid()
    )
  );

-- Function to update booking status based on time
CREATE OR REPLACE FUNCTION update_booking_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If a booking is marked as cancelled, don't change it
  IF OLD.status = 'cancelled' THEN
    RETURN OLD;
  END IF;
  
  -- If the booking end time has passed, mark it as completed
  IF NEW.end_time < NOW() AND NEW.status = 'confirmed' THEN
    NEW.status := 'completed';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update booking status
CREATE TRIGGER trigger_update_booking_status
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_booking_status();

-- Function to check for booking conflicts
CREATE OR REPLACE FUNCTION check_booking_conflicts()
RETURNS TRIGGER AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  -- Check for overlapping bookings for the same artist
  SELECT COUNT(*) INTO conflict_count
  FROM bookings b
  WHERE b.application_id = NEW.application_id
    AND b.id != NEW.id
    AND b.status IN ('pending', 'confirmed')
    AND (
      (NEW.start_time >= b.start_time AND NEW.start_time < b.end_time) OR
      (NEW.end_time > b.start_time AND NEW.end_time <= b.end_time) OR
      (NEW.start_time <= b.start_time AND NEW.end_time >= b.end_time)
    );
  
  IF conflict_count > 0 THEN
    RAISE EXCEPTION 'Booking conflict detected. The artist already has a booking during this time.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check for booking conflicts
CREATE TRIGGER trigger_check_booking_conflicts
BEFORE INSERT OR UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION check_booking_conflicts();

-- Update event_modules table to include booking_enabled if needed
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'event_modules' 
    AND column_name = 'booking_enabled'
  ) THEN
    ALTER TABLE event_modules ADD COLUMN booking_enabled BOOLEAN DEFAULT false;
  END IF;
END $$;