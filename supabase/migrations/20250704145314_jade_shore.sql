/*
  # Add User Profiles Table
  
  1. New Tables
    - `user_profiles` - Stores extended user profile information
    
  2. Security
    - Enable RLS on the table
    - Add policies for users to manage their own profiles
    - Add policies for admins to manage all profiles
    
  3. Changes
    - Add fields for social media links
    - Add fields for profile visibility settings
    - Add fields for profile picture URL
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  phone TEXT,
  location TEXT,
  bio TEXT,
  website TEXT,
  instagram TEXT,
  facebook TEXT,
  tiktok TEXT,
  experience TEXT,
  specialties TEXT[],
  profile_picture TEXT,
  show_instagram BOOLEAN DEFAULT true,
  show_facebook BOOLEAN DEFAULT true,
  show_tiktok BOOLEAN DEFAULT true,
  show_website BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can manage their own profiles"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all profiles"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- Create a profile for the admin user
INSERT INTO user_profiles (
  user_id,
  phone,
  location,
  bio,
  website,
  instagram,
  facebook,
  tiktok,
  experience,
  specialties,
  profile_picture,
  show_instagram,
  show_facebook,
  show_tiktok,
  show_website
)
SELECT 
  id,
  '+44 7700 900000',
  'London, UK',
  'TattSync Master Administrator',
  'https://tattsync.com',
  'tattsync',
  'tattsync',
  'tattsync',
  '10 years',
  ARRAY['Administration', 'Event Management', 'System Design'],
  'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&dpr=2',
  true,
  true,
  true,
  true
FROM users
WHERE email = 'gary@tattscore.com'
ON CONFLICT (user_id) DO UPDATE SET
  phone = EXCLUDED.phone,
  location = EXCLUDED.location,
  bio = EXCLUDED.bio,
  website = EXCLUDED.website,
  instagram = EXCLUDED.instagram,
  facebook = EXCLUDED.facebook,
  tiktok = EXCLUDED.tiktok,
  experience = EXCLUDED.experience,
  specialties = EXCLUDED.specialties,
  profile_picture = EXCLUDED.profile_picture,
  updated_at = now();

-- Verify the admin profile was created
DO $$
DECLARE
  profile_exists boolean;
  admin_id uuid;
BEGIN
  -- Get admin user ID
  SELECT id INTO admin_id FROM users WHERE email = 'gary@tattscore.com';
  
  -- Check if profile exists
  SELECT EXISTS (
    SELECT 1 FROM user_profiles WHERE user_id = admin_id
  ) INTO profile_exists;
  
  -- Output results
  IF profile_exists THEN
    RAISE NOTICE 'Admin user profile created successfully';
  ELSE
    RAISE WARNING 'Failed to create admin user profile';
  END IF;
END
$$;