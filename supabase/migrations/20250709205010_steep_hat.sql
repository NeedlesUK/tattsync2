/*
  # Add media support to event information

  1. New Tables
    - `event_information_media` - Stores media attachments for event information items
  
  2. Changes
    - Add `category` column to `event_information` table
    - Add `ticket_holders` column to `event_information` table
  
  3. Security
    - Enable RLS on new tables
    - Add appropriate policies
*/

-- Add category column to event_information
ALTER TABLE event_information ADD COLUMN IF NOT EXISTS category text DEFAULT 'General';

-- Add ticket_holders column to event_information
ALTER TABLE event_information ADD COLUMN IF NOT EXISTS ticket_holders boolean DEFAULT false;

-- Create event_information_media table
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

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_event_information_media_information_id ON event_information_media(information_id);

-- Enable RLS
ALTER TABLE event_information_media ENABLE ROW LEVEL SECURITY;

-- Add policies for event_information_media
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

-- Update event_information policies to include ticket holders
DROP POLICY IF EXISTS "Attendees can read event information for their event" ON event_information;

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

-- Create policy for public access to event_information_media
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