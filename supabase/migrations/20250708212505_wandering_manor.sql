/*
  # Fix Function Search Path Security Warnings
  
  1. Updates
    - Add SET search_path = public to all functions
    - Add SECURITY DEFINER to functions that need elevated privileges
    - Fix schema references to use fully qualified names
    
  2. Security
    - Prevent search_path manipulation attacks
    - Ensure functions run with proper permissions
*/

-- Update get_user_roles function with search_path
CREATE OR REPLACE FUNCTION get_user_roles(user_uuid UUID)
RETURNS TABLE (role user_role, is_primary BOOLEAN) 
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT ur.role, ur.is_primary
  FROM public.user_roles ur
  WHERE ur.user_id = user_uuid;
END;
$$;

-- Update set_primary_role function with search_path
CREATE OR REPLACE FUNCTION set_primary_role(user_uuid UUID, primary_role user_role)
RETURNS BOOLEAN 
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  role_exists BOOLEAN;
BEGIN
  -- Check if user has this role
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_uuid AND role = primary_role
  ) INTO role_exists;
  
  -- If role doesn't exist, add it
  IF NOT role_exists THEN
    INSERT INTO public.user_roles (user_id, role, is_primary)
    VALUES (user_uuid, primary_role, true);
  END IF;
  
  -- Reset all roles to non-primary
  UPDATE public.user_roles
  SET is_primary = false
  WHERE user_id = user_uuid;
  
  -- Set the specified role as primary
  UPDATE public.user_roles
  SET is_primary = true
  WHERE user_id = user_uuid AND role = primary_role;
  
  -- Update the main role in users table
  UPDATE public.users
  SET role = primary_role
  WHERE id = user_uuid;
  
  RETURN true;
END;
$$;

-- Update add_user_role function with search_path
CREATE OR REPLACE FUNCTION add_user_role(user_uuid UUID, new_role user_role)
RETURNS BOOLEAN 
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role, is_primary)
  VALUES (user_uuid, new_role, false)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN true;
END;
$$;

-- Update remove_user_role function with search_path
CREATE OR REPLACE FUNCTION remove_user_role(user_uuid UUID, role_to_remove user_role)
RETURNS BOOLEAN 
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_primary BOOLEAN;
  role_count INTEGER;
BEGIN
  -- Check if this is the primary role
  SELECT ur.is_primary INTO is_primary
  FROM public.user_roles ur
  WHERE ur.user_id = user_uuid AND ur.role = role_to_remove;
  
  -- Count how many roles the user has
  SELECT COUNT(*) INTO role_count
  FROM public.user_roles
  WHERE user_id = user_uuid;
  
  -- Don't allow removing the only role
  IF role_count <= 1 THEN
    RETURN false;
  END IF;
  
  -- Don't allow removing primary role
  IF is_primary THEN
    RETURN false;
  END IF;
  
  -- Remove the role
  DELETE FROM public.user_roles
  WHERE user_id = user_uuid AND role = role_to_remove;
  
  RETURN true;
END;
$$;

-- Update check_profile_visibility function with search_path
CREATE OR REPLACE FUNCTION check_profile_visibility(profile_owner_id UUID, viewer_id UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_visible BOOLEAN;
  is_event_manager BOOLEAN;
  is_studio_member BOOLEAN;
  has_booking BOOLEAN;
  is_admin BOOLEAN;
BEGIN
  -- Check if profile is set to public
  SELECT show_profile INTO is_visible
  FROM public.user_profiles
  WHERE user_id = profile_owner_id;
  
  -- If profile is public or viewer is the owner, return true
  IF is_visible IS NULL OR is_visible OR profile_owner_id = viewer_id THEN
    RETURN true;
  END IF;
  
  -- Check if viewer is admin
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = viewer_id AND role = 'admin'
  ) INTO is_admin;
  
  IF is_admin THEN
    RETURN true;
  END IF;
  
  -- Check if viewer is event manager for an event where profile owner has applied
  SELECT EXISTS (
    SELECT 1 
    FROM public.events e
    JOIN public.applications a ON a.event_id = e.id
    WHERE a.user_id = profile_owner_id AND e.event_manager_id = viewer_id
  ) INTO is_event_manager;
  
  IF is_event_manager THEN
    RETURN true;
  END IF;
  
  -- Check if viewer is in same studio as profile owner
  SELECT EXISTS (
    SELECT 1
    FROM public.studio_members sm1
    JOIN public.studio_members sm2 ON sm1.studio_id = sm2.studio_id
    WHERE sm1.user_id = profile_owner_id AND sm2.user_id = viewer_id
  ) INTO is_studio_member;
  
  IF is_studio_member THEN
    RETURN true;
  END IF;
  
  -- Check if viewer has a booking with profile owner
  SELECT EXISTS (
    SELECT 1
    FROM public.bookings b
    WHERE (b.artist_id = profile_owner_id AND b.client_id = viewer_id)
       OR (b.artist_id = viewer_id AND b.client_id = profile_owner_id)
  ) INTO has_booking;
  
  IF has_booking THEN
    RETURN true;
  END IF;
  
  -- If none of the above conditions are met, return false
  RETURN false;
END;
$$;

-- Update update_application_count function with search_path
CREATE OR REPLACE FUNCTION update_application_count()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment count for new application
    INSERT INTO public.application_limits (event_id, application_type, current_applications)
    VALUES (NEW.event_id, NEW.application_type, 1)
    ON CONFLICT (event_id, application_type)
    DO UPDATE SET current_applications = public.application_limits.current_applications + 1;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement count for deleted application
    UPDATE public.application_limits 
    SET current_applications = GREATEST(0, current_applications - 1)
    WHERE event_id = OLD.event_id AND application_type = OLD.application_type;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Update generate_ticket_qr_code function with search_path
CREATE OR REPLACE FUNCTION generate_ticket_qr_code()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- In a real implementation, this would generate a unique QR code
  -- For now, we'll just create a placeholder
  NEW.qr_code = 'TICKET-' || NEW.event_id || '-' || NEW.client_id || '-' || NEW.ticket_type || '-' || FLOOR(RANDOM() * 1000000)::TEXT;
  RETURN NEW;
END;
$$;

-- Update update_ticket_allocations function with search_path
CREATE OR REPLACE FUNCTION update_ticket_allocations()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  event_start_date DATE;
  event_end_date DATE;
  curr_date DATE; -- Renamed from current_date to avoid reserved keyword conflict
BEGIN
  -- Get event dates
  SELECT start_date, end_date INTO event_start_date, event_end_date
  FROM public.events
  WHERE id = NEW.event_id;
  
  -- For each day of the event, create an allocation
  curr_date := event_start_date;
  WHILE curr_date <= event_end_date LOOP
    INSERT INTO public.ticket_allocations (ticket_id, event_day)
    VALUES (NEW.id, curr_date);
    
    curr_date := curr_date + INTERVAL '1 day';
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Update create_consent_notification function with search_path
CREATE OR REPLACE FUNCTION create_consent_notification()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  artist_id UUID;
BEGIN
  -- Find the artist associated with this submission
  SELECT acc.artist_id INTO artist_id
  FROM public.artist_client_consents acc
  WHERE acc.submission_id = NEW.id;
  
  -- Create notification for the artist
  IF artist_id IS NOT NULL THEN
    INSERT INTO public.consent_notifications (submission_id, recipient_id)
    VALUES (NEW.id, artist_id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update generate_consent_qr_code function with search_path
CREATE OR REPLACE FUNCTION generate_consent_qr_code()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Generate a unique code if not provided
  IF NEW.code IS NULL THEN
    NEW.code = 'CONSENT-' || NEW.event_id || '-' || NEW.form_id || '-' || FLOOR(RANDOM() * 1000000)::TEXT;
  END IF;
  
  -- Set default expiration if not provided
  IF NEW.expires_at IS NULL THEN
    NEW.expires_at = NOW() + INTERVAL '30 days';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update update_booking_status function with search_path
CREATE OR REPLACE FUNCTION update_booking_status()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- If status is changing to completed, set completed_at
  IF NEW.status = 'completed' AND (OLD.status != 'completed' OR OLD.status IS NULL) THEN
    NEW.completed_at = NOW();
  END IF;
  
  -- If status is changing to cancelled, set cancelled_at
  IF NEW.status = 'cancelled' AND (OLD.status != 'cancelled' OR OLD.status IS NULL) THEN
    NEW.cancelled_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update check_booking_conflicts function with search_path
CREATE OR REPLACE FUNCTION check_booking_conflicts()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  -- Check for conflicts with existing bookings
  SELECT COUNT(*) INTO conflict_count
  FROM public.bookings b
  WHERE b.artist_id = NEW.artist_id
    AND b.status != 'cancelled'
    AND b.id != NEW.id
    AND (
      (NEW.start_time, NEW.end_time) OVERLAPS (b.start_time, b.end_time)
    );
  
  IF conflict_count > 0 THEN
    RAISE EXCEPTION 'Booking conflicts with existing appointment';
  END IF;
  
  RETURN NEW;
END;
$$;