/*
  # Add storage bucket for event images

  1. New Storage Bucket
    - Creates a storage bucket for event images
    - Sets up public access policy for event images
    - Enables RLS on the bucket
*/

-- Create a new storage bucket for event images
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to event images
CREATE POLICY "Event images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-images');

-- Allow event managers to insert and update their own event images
CREATE POLICY "Event managers can upload event images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'event-images' AND
  (storage.foldername(name))[1] = 'events' AND
  EXISTS (
    SELECT 1 FROM events
    WHERE id::text = (storage.foldername(name))[2]
    AND event_manager_id = auth.uid()
  )
);

-- Allow event managers to update their own event images
CREATE POLICY "Event managers can update event images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'event-images' AND
  (storage.foldername(name))[1] = 'events' AND
  EXISTS (
    SELECT 1 FROM events
    WHERE id::text = (storage.foldername(name))[2]
    AND event_manager_id = auth.uid()
  )
);

-- Allow event managers to delete their own event images
CREATE POLICY "Event managers can delete event images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'event-images' AND
  (storage.foldername(name))[1] = 'events' AND
  EXISTS (
    SELECT 1 FROM events
    WHERE id::text = (storage.foldername(name))[2]
    AND event_manager_id = auth.uid()
  )
);