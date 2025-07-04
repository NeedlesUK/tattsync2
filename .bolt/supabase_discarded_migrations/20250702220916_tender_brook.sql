/*
  # Profile and Registration Management System

  1. New Tables
    - `profile_requirements` - Event manager defined profile fields and deadlines
    - `profile_submissions` - Attendee profile data and completion status
    - `booking_preferences` - Artist booking availability settings
    - `booth_allocations` - Stand/booth assignments for attendees
    - `social_media_templates` - Event social media posting templates
    - `social_media_accounts` - Connected social accounts for events
    - `attendee_posts` - Track social media posts about attendees

  2. Security
    - Enable RLS on all new tables
    - Add appropriate policies for event managers and attendees

  3. Functions
    - Profile completion checking
    - Social media post generation
    - Booking status management
*/

-- Profile requirements table - Event managers define what profile data is needed
CREATE TABLE IF NOT EXISTS profile_requirements (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  application_type application_type NOT NULL,
  field_name TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'textarea', 'file', 'image', 'url', 'date', 'select', 'checkbox')),
  field_label TEXT NOT NULL,
  field_description TEXT,
  is_required BOOLEAN DEFAULT true,
  field_options JSONB DEFAULT '[]', -- For select/checkbox options
  deadline_days INTEGER DEFAULT 30, -- Days after registration to complete
  reminder_days INTEGER[] DEFAULT ARRAY[7, 3, 1], -- Days before deadline to send reminders
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, application_type, field_name)
);

-- Profile submissions table - Attendee submitted profile data
CREATE TABLE IF NOT EXISTS profile_submissions (
  id SERIAL PRIMARY KEY,
  application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_value TEXT,
  file_url TEXT, -- For file/image uploads
  file_name TEXT,
  file_size INTEGER,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id),
  rejection_reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'needs_revision')),
  UNIQUE(application_id, field_name)
);

-- Booking preferences for artists/piercers
CREATE TABLE IF NOT EXISTS booking_preferences (
  id SERIAL PRIMARY KEY,
  application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  booking_status TEXT NOT NULL DEFAULT 'taking_walkups' CHECK (booking_status IN ('fully_booked', 'advance_bookings', 'taking_walkups')),
  contact_method TEXT, -- How clients should contact them
  contact_details TEXT, -- Contact information
  booking_notes TEXT, -- Additional booking information
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(application_id)
);

-- Booth/stand allocations
CREATE TABLE IF NOT EXISTS booth_allocations (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  booth_number TEXT NOT NULL,
  booth_type TEXT DEFAULT 'standard', -- standard, premium, corner, etc.
  booth_size TEXT, -- e.g., "3x3m", "2x2m"
  location_notes TEXT, -- e.g., "Near entrance", "Food court area"
  allocated_at TIMESTAMPTZ DEFAULT now(),
  allocated_by UUID REFERENCES users(id),
  UNIQUE(event_id, booth_number),
  UNIQUE(application_id)
);

-- Social media account connections for events
CREATE TABLE IF NOT EXISTS social_media_accounts (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'twitter', 'tiktok')),
  account_name TEXT NOT NULL,
  access_token TEXT, -- Encrypted API access token
  account_id TEXT, -- Platform-specific account ID
  is_active BOOLEAN DEFAULT true,
  connected_at TIMESTAMPTZ DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  UNIQUE(event_id, platform, account_name)
);

-- Social media post templates
CREATE TABLE IF NOT EXISTS social_media_templates (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('individual_announcement', 'bulk_announcement', 'artist_spotlight', 'trader_feature')),
  application_types application_type[] DEFAULT ARRAY[]::application_type[], -- Which types this template applies to
  platforms TEXT[] DEFAULT ARRAY[]::TEXT[], -- Which platforms to post to
  post_text TEXT NOT NULL, -- Template with variables like {name}, {type}, {bio}
  include_image BOOLEAN DEFAULT true,
  hashtags TEXT[], -- Array of hashtags
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Track social media posts about attendees
CREATE TABLE IF NOT EXISTS attendee_posts (
  id SERIAL PRIMARY KEY,
  application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  template_id INTEGER REFERENCES social_media_templates(id),
  platform TEXT NOT NULL,
  post_id TEXT, -- Platform-specific post ID
  post_url TEXT,
  post_content TEXT,
  posted_at TIMESTAMPTZ DEFAULT now(),
  posted_by UUID REFERENCES users(id),
  engagement_stats JSONB DEFAULT '{}' -- likes, shares, comments, etc.
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profile_requirements_event_type ON profile_requirements(event_id, application_type);
CREATE INDEX IF NOT EXISTS idx_profile_submissions_application ON profile_submissions(application_id);
CREATE INDEX IF NOT EXISTS idx_profile_submissions_status ON profile_submissions(status);
CREATE INDEX IF NOT EXISTS idx_booking_preferences_application ON booking_preferences(application_id);
CREATE INDEX IF NOT EXISTS idx_booth_allocations_event ON booth_allocations(event_id);
CREATE INDEX IF NOT EXISTS idx_booth_allocations_application ON booth_allocations(application_id);
CREATE INDEX IF NOT EXISTS idx_social_media_accounts_event ON social_media_accounts(event_id);
CREATE INDEX IF NOT EXISTS idx_social_media_templates_event ON social_media_templates(event_id);
CREATE INDEX IF NOT EXISTS idx_attendee_posts_application ON attendee_posts(application_id);

-- Enable RLS
ALTER TABLE profile_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE booth_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendee_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profile_requirements
CREATE POLICY "Event managers can manage profile requirements"
  ON profile_requirements
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT e.event_manager_id
      FROM events e
      WHERE e.id = profile_requirements.event_id
      AND e.event_manager_id IS NOT NULL
    )
  );

CREATE POLICY "Anyone can read profile requirements for published events"
  ON profile_requirements
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = profile_requirements.event_id
      AND e.status = 'published'
    )
  );

-- RLS Policies for profile_submissions
CREATE POLICY "Event managers can view all profile submissions for their events"
  ON profile_submissions
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT e.event_manager_id
      FROM events e
      JOIN applications a ON a.event_id = e.id
      WHERE a.id = profile_submissions.application_id
      AND e.event_manager_id IS NOT NULL
    )
  );

CREATE POLICY "Event managers can approve/reject profile submissions"
  ON profile_submissions
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT e.event_manager_id
      FROM events e
      JOIN applications a ON a.event_id = e.id
      WHERE a.id = profile_submissions.application_id
      AND e.event_manager_id IS NOT NULL
    )
  );

CREATE POLICY "Users can manage their own profile submissions"
  ON profile_submissions
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT a.user_id
      FROM applications a
      WHERE a.id = profile_submissions.application_id
    )
  );

-- RLS Policies for booking_preferences
CREATE POLICY "Event managers can view booking preferences for their events"
  ON booking_preferences
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT e.event_manager_id
      FROM events e
      JOIN applications a ON a.event_id = e.id
      WHERE a.id = booking_preferences.application_id
      AND e.event_manager_id IS NOT NULL
    )
  );

CREATE POLICY "Users can manage their own booking preferences"
  ON booking_preferences
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT a.user_id
      FROM applications a
      WHERE a.id = booking_preferences.application_id
    )
  );

CREATE POLICY "Public can view booking preferences for published events"
  ON booking_preferences
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events e
      JOIN applications a ON a.event_id = e.id
      WHERE a.id = booking_preferences.application_id
      AND e.status = 'published'
      AND a.status = 'approved'
    )
  );

-- RLS Policies for booth_allocations
CREATE POLICY "Event managers can manage booth allocations"
  ON booth_allocations
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT e.event_manager_id
      FROM events e
      WHERE e.id = booth_allocations.event_id
      AND e.event_manager_id IS NOT NULL
    )
  );

CREATE POLICY "Users can view their own booth allocation"
  ON booth_allocations
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT a.user_id
      FROM applications a
      WHERE a.id = booth_allocations.application_id
    )
  );

-- RLS Policies for social_media_accounts
CREATE POLICY "Event managers can manage social media accounts"
  ON social_media_accounts
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT e.event_manager_id
      FROM events e
      WHERE e.id = social_media_accounts.event_id
      AND e.event_manager_id IS NOT NULL
    )
  );

-- RLS Policies for social_media_templates
CREATE POLICY "Event managers can manage social media templates"
  ON social_media_templates
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT e.event_manager_id
      FROM events e
      WHERE e.id = social_media_templates.event_id
      AND e.event_manager_id IS NOT NULL
    )
  );

-- RLS Policies for attendee_posts
CREATE POLICY "Event managers can manage attendee posts"
  ON attendee_posts
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT e.event_manager_id
      FROM events e
      JOIN applications a ON a.event_id = e.id
      WHERE a.id = attendee_posts.application_id
      AND e.event_manager_id IS NOT NULL
    )
  );

-- Insert default profile requirements for artists
INSERT INTO profile_requirements (event_id, application_type, field_name, field_type, field_label, field_description, is_required, deadline_days, display_order)
SELECT 
  e.id,
  'artist'::application_type,
  field_data.field_name,
  field_data.field_type,
  field_data.field_label,
  field_data.field_description,
  field_data.is_required,
  field_data.deadline_days,
  field_data.display_order
FROM events e
CROSS JOIN (
  VALUES 
    ('profile_photo', 'image', 'Profile Photo', 'Professional headshot or photo of yourself', true, 30, 1),
    ('portfolio_images', 'image', 'Portfolio Images', 'Upload 5-10 images of your best work', true, 30, 2),
    ('bio', 'textarea', 'Artist Bio', 'Tell potential clients about your style and experience', true, 30, 3),
    ('specialties', 'text', 'Specialties', 'List your tattoo specialties (e.g., Traditional, Realism, etc.)', true, 30, 4),
    ('instagram_handle', 'text', 'Instagram Handle', 'Your Instagram username for promotion', false, 30, 5),
    ('website_url', 'url', 'Website/Portfolio URL', 'Link to your professional website or online portfolio', false, 30, 6),
    ('years_experience', 'text', 'Years of Experience', 'How many years have you been tattooing professionally?', true, 30, 7),
    ('certifications', 'file', 'Certifications/Licenses', 'Upload copies of relevant certifications or licenses', true, 30, 8)
) AS field_data(field_name, field_type, field_label, field_description, is_required, deadline_days, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM profile_requirements pr 
  WHERE pr.event_id = e.id 
  AND pr.application_type = 'artist'::application_type
  AND pr.field_name = field_data.field_name
);

-- Insert default profile requirements for piercers
INSERT INTO profile_requirements (event_id, application_type, field_name, field_type, field_label, field_description, is_required, deadline_days, display_order)
SELECT 
  e.id,
  'piercer'::application_type,
  field_data.field_name,
  field_data.field_type,
  field_data.field_label,
  field_data.field_description,
  field_data.is_required,
  field_data.deadline_days,
  field_data.display_order
FROM events e
CROSS JOIN (
  VALUES 
    ('profile_photo', 'image', 'Profile Photo', 'Professional headshot or photo of yourself', true, 30, 1),
    ('portfolio_images', 'image', 'Portfolio Images', 'Upload 5-10 images of your piercing work', true, 30, 2),
    ('bio', 'textarea', 'Piercer Bio', 'Tell potential clients about your experience and approach', true, 30, 3),
    ('specialties', 'text', 'Piercing Specialties', 'List your piercing specialties (e.g., Ear, Facial, Body, etc.)', true, 30, 4),
    ('instagram_handle', 'text', 'Instagram Handle', 'Your Instagram username for promotion', false, 30, 5),
    ('years_experience', 'text', 'Years of Experience', 'How many years have you been piercing professionally?', true, 30, 6),
    ('certifications', 'file', 'Certifications/Licenses', 'Upload copies of relevant certifications or licenses', true, 30, 7)
) AS field_data(field_name, field_type, field_label, field_description, is_required, deadline_days, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM profile_requirements pr 
  WHERE pr.event_id = e.id 
  AND pr.application_type = 'piercer'::application_type
  AND pr.field_name = field_data.field_name
);

-- Insert default profile requirements for traders
INSERT INTO profile_requirements (event_id, application_type, field_name, field_type, field_label, field_description, is_required, deadline_days, display_order)
SELECT 
  e.id,
  'trader'::application_type,
  field_data.field_name,
  field_data.field_type,
  field_data.field_label,
  field_data.field_description,
  field_data.is_required,
  field_data.deadline_days,
  field_data.display_order
FROM events e
CROSS JOIN (
  VALUES 
    ('business_logo', 'image', 'Business Logo', 'Your business logo for promotional materials', true, 30, 1),
    ('product_images', 'image', 'Product Images', 'Upload 5-10 images of your products', true, 30, 2),
    ('business_description', 'textarea', 'Business Description', 'Describe your business and what you sell', true, 30, 3),
    ('product_categories', 'text', 'Product Categories', 'List the types of products you sell', true, 30, 4),
    ('website_url', 'url', 'Website URL', 'Link to your business website or online store', false, 30, 5),
    ('social_media', 'text', 'Social Media Handles', 'Your business social media accounts', false, 30, 6)
) AS field_data(field_name, field_type, field_label, field_description, is_required, deadline_days, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM profile_requirements pr 
  WHERE pr.event_id = e.id 
  AND pr.application_type = 'trader'::application_type
  AND pr.field_name = field_data.field_name
);

-- Insert default profile requirements for caterers
INSERT INTO profile_requirements (event_id, application_type, field_name, field_type, field_label, field_description, is_required, deadline_days, display_order)
SELECT 
  e.id,
  'caterer'::application_type,
  field_data.field_name,
  field_data.field_type,
  field_data.field_label,
  field_data.field_description,
  field_data.is_required,
  field_data.deadline_days,
  field_data.display_order
FROM events e
CROSS JOIN (
  VALUES 
    ('business_logo', 'image', 'Business Logo', 'Your catering business logo', true, 30, 1),
    ('food_images', 'image', 'Food Images', 'Upload 5-10 images of your food and setup', true, 30, 2),
    ('menu_description', 'textarea', 'Menu Description', 'Detailed description of your menu offerings', true, 30, 3),
    ('dietary_options', 'text', 'Dietary Options', 'Vegetarian, vegan, gluten-free options available', false, 30, 4),
    ('hygiene_certificates', 'file', 'Food Hygiene Certificates', 'Upload current food hygiene certificates', true, 30, 5),
    ('website_url', 'url', 'Website URL', 'Link to your catering business website', false, 30, 6)
) AS field_data(field_name, field_type, field_label, field_description, is_required, deadline_days, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM profile_requirements pr 
  WHERE pr.event_id = e.id 
  AND pr.application_type = 'caterer'::application_type
  AND pr.field_name = field_data.field_name
);

-- Insert default profile requirements for performers
INSERT INTO profile_requirements (event_id, application_type, field_name, field_type, field_label, field_description, is_required, deadline_days, display_order)
SELECT 
  e.id,
  'performer'::application_type,
  field_data.field_name,
  field_data.field_type,
  field_data.field_label,
  field_data.field_description,
  field_data.is_required,
  field_data.deadline_days,
  field_data.display_order
FROM events e
CROSS JOIN (
  VALUES 
    ('profile_photo', 'image', 'Profile Photo', 'Professional photo for promotional materials', true, 30, 1),
    ('performance_videos', 'file', 'Performance Videos', 'Upload videos of your performances', true, 30, 2),
    ('bio', 'textarea', 'Performer Bio', 'Tell the audience about your performance style and background', true, 30, 3),
    ('performance_type', 'text', 'Performance Type', 'Type of performance (e.g., Fire, Acrobatics, Music, etc.)', true, 30, 4),
    ('technical_requirements', 'textarea', 'Technical Requirements', 'List any equipment, space, or technical needs', false, 30, 5),
    ('social_media', 'text', 'Social Media Handles', 'Your performance social media accounts', false, 30, 6)
) AS field_data(field_name, field_type, field_label, field_description, is_required, deadline_days, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM profile_requirements pr 
  WHERE pr.event_id = e.id 
  AND pr.application_type = 'performer'::application_type
  AND pr.field_name = field_data.field_name
);

-- Insert default social media templates
INSERT INTO social_media_templates (event_id, template_name, template_type, application_types, platforms, post_text, hashtags)
SELECT 
  e.id,
  template_data.template_name,
  template_data.template_type,
  template_data.application_types,
  template_data.platforms,
  template_data.post_text,
  template_data.hashtags
FROM events e
CROSS JOIN (
  VALUES 
    (
      'Artist Announcement',
      'individual_announcement',
      ARRAY['artist']::application_type[],
      ARRAY['instagram', 'facebook']::TEXT[],
      'We''re excited to announce {name} will be joining us at {event_name}! 🎨✨

{bio}

Specializing in: {specialties}
Experience: {years_experience}

Book your appointment now! 

#tattoo #tattooartist #tattooevent #bodyart #ink',
      ARRAY['tattoo', 'tattooartist', 'tattooevent', 'bodyart', 'ink']::TEXT[]
    ),
    (
      'Piercer Announcement',
      'individual_announcement',
      ARRAY['piercer']::application_type[],
      ARRAY['instagram', 'facebook']::TEXT[],
      'Introducing {name} - Professional Piercer at {event_name}! 💎

{bio}

Specialties: {specialties}
Experience: {years_experience}

Book your piercing appointment today!

#piercing #bodypiercing #professionalpiercer #bodyart',
      ARRAY['piercing', 'bodypiercing', 'professionalpiercer', 'bodyart']::TEXT[]
    ),
    (
      'Trader Feature',
      'individual_announcement',
      ARRAY['trader']::application_type[],
      ARRAY['instagram', 'facebook']::TEXT[],
      'Check out {business_name} at {event_name}! 🛍️

{business_description}

Products: {product_categories}

Don''t miss their amazing selection!

#tattooconvention #shopping #bodyartproducts #tattoocare',
      ARRAY['tattooconvention', 'shopping', 'bodyartproducts', 'tattoocare']::TEXT[]
    ),
    (
      'All Attendees Announcement',
      'bulk_announcement',
      ARRAY['artist', 'piercer', 'trader', 'caterer', 'performer']::application_type[],
      ARRAY['instagram', 'facebook', 'twitter']::TEXT[],
      'Meet all the amazing {application_type}s joining us at {event_name}! 

Swipe to see everyone who will be there ➡️

Get your tickets now: {event_website}

#{event_hashtag} #tattooconvention #bodyart',
      ARRAY['tattooconvention', 'bodyart', 'tattooevent']::TEXT[]
    )
) AS template_data(template_name, template_type, application_types, platforms, post_text, hashtags)
WHERE NOT EXISTS (
  SELECT 1 FROM social_media_templates smt 
  WHERE smt.event_id = e.id 
  AND smt.template_name = template_data.template_name
);

-- Function to check profile completion status
CREATE OR REPLACE FUNCTION get_profile_completion_status(app_id INTEGER)
RETURNS TABLE (
  total_required INTEGER,
  completed INTEGER,
  pending INTEGER,
  approved INTEGER,
  rejected INTEGER,
  completion_percentage DECIMAL(5,2),
  is_complete BOOLEAN,
  missing_fields TEXT[]
) AS $$
DECLARE
  event_id_val INTEGER;
  app_type application_type;
BEGIN
  -- Get event and application type
  SELECT a.event_id, a.application_type INTO event_id_val, app_type
  FROM applications a WHERE a.id = app_id;
  
  RETURN QUERY
  WITH requirements AS (
    SELECT pr.field_name, pr.is_required
    FROM profile_requirements pr
    WHERE pr.event_id = event_id_val 
    AND pr.application_type = app_type
  ),
  submissions AS (
    SELECT ps.field_name, ps.status
    FROM profile_submissions ps
    WHERE ps.application_id = app_id
  ),
  stats AS (
    SELECT 
      COUNT(*) FILTER (WHERE r.is_required) as total_req,
      COUNT(*) FILTER (WHERE r.is_required AND s.field_name IS NOT NULL) as completed_count,
      COUNT(*) FILTER (WHERE r.is_required AND s.status = 'pending') as pending_count,
      COUNT(*) FILTER (WHERE r.is_required AND s.status = 'approved') as approved_count,
      COUNT(*) FILTER (WHERE r.is_required AND s.status = 'rejected') as rejected_count,
      ARRAY_AGG(r.field_name) FILTER (WHERE r.is_required AND s.field_name IS NULL) as missing
    FROM requirements r
    LEFT JOIN submissions s ON r.field_name = s.field_name
  )
  SELECT 
    s.total_req,
    s.completed_count,
    s.pending_count,
    s.approved_count,
    s.rejected_count,
    CASE 
      WHEN s.total_req = 0 THEN 100.00
      ELSE ROUND((s.completed_count::DECIMAL / s.total_req::DECIMAL) * 100, 2)
    END,
    s.total_req > 0 AND s.completed_count = s.total_req,
    COALESCE(s.missing, ARRAY[]::TEXT[])
  FROM stats s;
END;
$$ LANGUAGE plpgsql;

-- Function to generate social media post content
CREATE OR REPLACE FUNCTION generate_social_post(
  template_id_val INTEGER,
  app_id INTEGER
)
RETURNS TABLE (
  post_content TEXT,
  hashtags_text TEXT,
  platforms TEXT[]
) AS $$
DECLARE
  template_record RECORD;
  app_record RECORD;
  profile_data RECORD;
  final_content TEXT;
  hashtags_str TEXT;
BEGIN
  -- Get template
  SELECT * INTO template_record
  FROM social_media_templates
  WHERE id = template_id_val;
  
  -- Get application data
  SELECT a.*, e.name as event_name
  INTO app_record
  FROM applications a
  JOIN events e ON e.id = a.event_id
  WHERE a.id = app_id;
  
  -- Get profile data
  SELECT 
    string_agg(
      CASE ps.field_name
        WHEN 'bio' THEN ps.field_value
        WHEN 'business_description' THEN ps.field_value
        ELSE NULL
      END, ''
    ) as bio,
    string_agg(
      CASE ps.field_name
        WHEN 'specialties' THEN ps.field_value
        WHEN 'product_categories' THEN ps.field_value
        ELSE NULL
      END, ''
    ) as specialties,
    string_agg(
      CASE ps.field_name
        WHEN 'years_experience' THEN ps.field_value
        ELSE NULL
      END, ''
    ) as years_experience,
    string_agg(
      CASE ps.field_name
        WHEN 'business_name' THEN ps.field_value
        ELSE NULL
      END, ''
    ) as business_name
  INTO profile_data
  FROM profile_submissions ps
  WHERE ps.application_id = app_id
  AND ps.status = 'approved';
  
  -- Replace variables in template
  final_content := template_record.post_text;
  final_content := replace(final_content, '{name}', COALESCE(app_record.applicant_name, ''));
  final_content := replace(final_content, '{event_name}', COALESCE(app_record.event_name, ''));
  final_content := replace(final_content, '{application_type}', COALESCE(app_record.application_type::TEXT, ''));
  final_content := replace(final_content, '{bio}', COALESCE(profile_data.bio, ''));
  final_content := replace(final_content, '{specialties}', COALESCE(profile_data.specialties, ''));
  final_content := replace(final_content, '{years_experience}', COALESCE(profile_data.years_experience, ''));
  final_content := replace(final_content, '{business_name}', COALESCE(profile_data.business_name, ''));
  final_content := replace(final_content, '{business_description}', COALESCE(profile_data.bio, ''));
  final_content := replace(final_content, '{product_categories}', COALESCE(profile_data.specialties, ''));
  
  -- Format hashtags
  hashtags_str := array_to_string(template_record.hashtags, ' #');
  IF hashtags_str IS NOT NULL AND hashtags_str != '' THEN
    hashtags_str := '#' || hashtags_str;
  END IF;
  
  RETURN QUERY
  SELECT 
    final_content,
    hashtags_str,
    template_record.platforms;
END;
$$ LANGUAGE plpgsql;