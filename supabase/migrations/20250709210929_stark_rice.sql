/*
  # Update Event Information and Media Tables

  1. New Tables
    - `event_information_media` - Stores media attachments for event information items

  2. Changes
    - Add `category` column to `event_information` table
    - Add `ticket_holders` column to `event_information` table
    - Update RLS policies for event information visibility

  3. Security
    - Enable RLS on new tables
    - Add policies for event managers to manage media
    - Add policies for public access to media based on information visibility
*/

-- Add category column to event_information if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'event_information' AND column_name = 'category'
  ) THEN
    ALTER TABLE event_information ADD COLUMN category text DEFAULT 'General';
  END IF;
END $$;

-- Add ticket_holders column to event_information if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'event_information' AND column_name = 'ticket_holders'
  ) THEN
    ALTER TABLE event_information ADD COLUMN ticket_holders boolean DEFAULT false;
  END IF;
END $$;

-- Create event_information_media table if it doesn't exist
CREATE TABLE IF NOT EXISTS event_information_media (
  id SERIAL PRIMARY KEY,
  information_id INTEGER NOT NULL REFERENCES event_information(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'pdf')),
  media_url TEXT NOT NULL,
  media_name TEXT NOT NULL,
  media_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster lookups if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_event_information_media_information_id'
  ) THEN
    CREATE INDEX idx_event_information_media_information_id ON event_information_media(information_id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE event_information_media ENABLE ROW LEVEL SECURITY;

-- Add policies for event_information_media if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'event_information_media' AND policyname = 'Event managers can manage media'
  ) THEN
    CREATE POLICY "Event managers can manage media"
    ON event_information_media
    FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM event_information ei
        JOIN events e ON e.id = ei.event_id
        WHERE ei.id = event_information_media.information_id
        AND e.event_manager_id = auth.uid()
      )
    );
  END IF;
END $$;

-- Update event_information policies to include ticket holders
DO $$ 
BEGIN
  -- Drop the old policy if it exists
  DROP POLICY IF EXISTS "Attendees can read event information for their event" ON event_information;
  
  -- Create the updated policy
  CREATE POLICY "Attendees can read event information for their event"
  ON event_information
  FOR SELECT
  TO authenticated
  USING (
    (
      -- Existing policy for application types
      (
        EXISTS (
          SELECT 1 FROM applications a
          WHERE a.event_id = event_information.event_id
          AND a.user_id = auth.uid()
          AND a.status = 'approved'
        )
        AND (
          array_length(application_types, 1) IS NULL
          OR EXISTS (
            SELECT 1 FROM applications a
            WHERE a.event_id = event_information.event_id
            AND a.user_id = auth.uid()
            AND a.application_type = ANY(event_information.application_types)
          )
        )
      )
      -- OR ticket holders can view if ticket_holders is true
      OR (
        ticket_holders = true
        AND EXISTS (
          SELECT 1 FROM tickets t
          WHERE t.event_id = event_information.event_id
          AND t.client_id = auth.uid()
        )
      )
      -- OR everyone can view if both application_types is empty and ticket_holders is false
      OR (
        array_length(application_types, 1) IS NULL
        AND ticket_holders = false
      )
    )
    -- AND the event is published
    AND (
      EXISTS (
        SELECT 1 FROM events e
        WHERE e.id = event_information.event_id
        AND e.status = 'published'
      )
    )
  );
END $$;

-- Create policy for public access to event_information_media if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'event_information_media' AND policyname = 'Public can view media for visible information'
  ) THEN
    CREATE POLICY "Public can view media for visible information"
    ON event_information_media
    FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM event_information ei
        JOIN events e ON e.id = ei.event_id
        WHERE ei.id = event_information_media.information_id
        AND (
          -- Event managers can always view
          e.event_manager_id = auth.uid()
          -- OR the information is visible to the user based on the event_information policy
          OR (
            (
              -- Application types match
              (
                EXISTS (
                  SELECT 1 FROM applications a
                  WHERE a.event_id = ei.event_id
                  AND a.user_id = auth.uid()
                  AND a.status = 'approved'
                )
                AND (
                  array_length(ei.application_types, 1) IS NULL
                  OR EXISTS (
                    SELECT 1 FROM applications a
                    WHERE a.event_id = ei.event_id
                    AND a.user_id = auth.uid()
                    AND a.application_type = ANY(ei.application_types)
                  )
                )
              )
              -- OR ticket holders can view
              OR (
                ei.ticket_holders = true
                AND EXISTS (
                  SELECT 1 FROM tickets t
                  WHERE t.event_id = ei.event_id
                  AND t.client_id = auth.uid()
                )
              )
              -- OR everyone can view
              OR (
                array_length(ei.application_types, 1) IS NULL
                AND ei.ticket_holders = false
              )
            )
            -- AND the event is published
            AND e.status = 'published'
          )
        )
      )
    );
  END IF;
END $$;