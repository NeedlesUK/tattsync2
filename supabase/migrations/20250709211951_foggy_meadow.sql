/*
  # Add social media fields to events table
  
  1. New Fields
    - `website` (text) - URL to the event website
    - `instagram` (text) - Instagram handle
    - `facebook` (text) - Facebook page name or URL
    - `tiktok` (text) - TikTok username
    
  2. Changes
    - Adds new columns to the events table for social media links
*/

-- Add social media columns to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS instagram text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS facebook text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS tiktok text;