/*
  # Add Event Images

  1. New Fields
    - `logo_url` (text) - URL to the event logo image
    - `banner_image_url` (text) - URL to the event banner image
  
  2. Changes
    - Add these fields to the events table
    - Both fields are nullable
*/

-- Add logo_url and banner_image_url columns to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS banner_image_url text;

-- Add comment to explain the purpose of these fields
COMMENT ON COLUMN events.logo_url IS 'URL to the event logo image';
COMMENT ON COLUMN events.banner_image_url IS 'URL to the event banner image';