/*
  # Update Application Settings

  1. Changes
     - Reorder application types to move caterer above volunteer
     - Remove maximum applications field as they are unlimited
     - Applications will be automatically disabled when the number of successful registrations reaches the limit
     - Or when the event manager manually disables applications
*/

-- First check if the application_type enum already has 'caterer'
DO $$
BEGIN
  -- Check if 'caterer' already exists in the enum
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
    WHERE pg_type.typname = 'application_type'
    AND pg_enum.enumlabel = 'caterer'
  ) THEN
    -- Add 'caterer' to the enum if it doesn't exist
    ALTER TYPE application_type ADD VALUE 'caterer';
  END IF;
END
$$;

-- Update existing application_settings to include caterer if not already present
-- and ensure it appears before volunteer in the application_types array
DO $$
DECLARE
  app_settings RECORD;
  updated_types JSONB;
  caterer_exists BOOLEAN;
  caterer_index INTEGER;
  volunteer_index INTEGER;
  caterer_obj JSONB;
  volunteer_obj JSONB;
BEGIN
  FOR app_settings IN SELECT id, application_types FROM application_settings
  LOOP
    -- Check if caterer already exists
    caterer_exists := EXISTS (
      SELECT 1 FROM jsonb_array_elements(app_settings.application_types) as app_type
      WHERE app_type->>'type' = 'caterer'
    );
    
    -- If caterer doesn't exist, add it
    IF NOT caterer_exists THEN
      -- Add caterer to application_types
      UPDATE application_settings
      SET application_types = application_types || 
        jsonb_build_object(
          'type', 'caterer',
          'label', 'Caterer',
          'description', 'Food and beverage providers for the event',
          'enabled', true,
          'form_fields', jsonb_build_array(
            jsonb_build_object(
              'id', 'caterer_1',
              'name', 'business_name',
              'label', 'Business Name',
              'type', 'text',
              'required', true,
              'placeholder', 'Enter your catering business name'
            ),
            jsonb_build_object(
              'id', 'caterer_2',
              'name', 'menu_description',
              'label', 'Menu Description',
              'type', 'textarea',
              'required', true,
              'placeholder', 'Describe your menu offerings in detail'
            ),
            jsonb_build_object(
              'id', 'caterer_3',
              'name', 'service_types',
              'label', 'What would you like to serve?',
              'type', 'checkbox',
              'required', true,
              'options', jsonb_build_array('Food (menu in description)', 'Hot drinks', 'Soft drinks', 'Sweets', 'Alcohol')
            ),
            jsonb_build_object(
              'id', 'caterer_4',
              'name', 'additional_info',
              'label', 'Additional Information',
              'type', 'textarea',
              'required', false,
              'placeholder', 'Any additional information you would like to provide'
            )
          )
        )::jsonb
      WHERE id = app_settings.id;
    ELSE
      -- Find the indices of caterer and volunteer
      SELECT ordinality - 1 INTO caterer_index
      FROM jsonb_array_elements(app_settings.application_types) WITH ORDINALITY
      WHERE value->>'type' = 'caterer';
      
      SELECT ordinality - 1 INTO volunteer_index
      FROM jsonb_array_elements(app_settings.application_types) WITH ORDINALITY
      WHERE value->>'type' = 'volunteer';
      
      -- Only reorder if caterer comes after volunteer
      IF caterer_index > volunteer_index THEN
        -- Extract the objects
        SELECT value INTO caterer_obj
        FROM jsonb_array_elements(app_settings.application_types)
        WHERE value->>'type' = 'caterer';
        
        SELECT value INTO volunteer_obj
        FROM jsonb_array_elements(app_settings.application_types)
        WHERE value->>'type' = 'volunteer';
        
        -- Create a new array with the correct order
        updated_types := app_settings.application_types;
        
        -- Remove both objects
        updated_types := updated_types - caterer_index;
        
        -- If volunteer index was after caterer, it's now one less
        IF volunteer_index > caterer_index THEN
          volunteer_index := volunteer_index - 1;
        END IF;
        
        updated_types := updated_types - volunteer_index;
        
        -- Insert volunteer after caterer
        IF caterer_index < volunteer_index THEN
          -- Insert caterer at its original position
          updated_types := jsonb_insert(updated_types, ARRAY[caterer_index::text], caterer_obj);
          -- Insert volunteer after it
          updated_types := jsonb_insert(updated_types, ARRAY[(caterer_index + 1)::text], volunteer_obj);
        ELSE
          -- Insert volunteer at caterer's position
          updated_types := jsonb_insert(updated_types, ARRAY[volunteer_index::text], caterer_obj);
          -- Insert caterer after it
          updated_types := jsonb_insert(updated_types, ARRAY[(volunteer_index + 1)::text], volunteer_obj);
        END IF;
        
        -- Update the application_settings
        UPDATE application_settings
        SET application_types = updated_types
        WHERE id = app_settings.id;
      END IF;
    END IF;
    
    -- Remove max_applications field from all application types
    UPDATE application_settings
    SET application_types = (
      SELECT jsonb_agg(
        jsonb_strip_nulls(
          jsonb_set(
            app_type - 'max_applications',
            '{max_registrations}',
            COALESCE(app_type->'max_applications', '0')::jsonb
          )
        )
      )
      FROM jsonb_array_elements(application_types) as app_type
    )
    WHERE id = app_settings.id;
  END LOOP;
END
$$;