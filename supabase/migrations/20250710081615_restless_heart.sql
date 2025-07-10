/*
  # Add Caterer Application Type

  1. New Application Type
    - Adds 'caterer' to the application_type enum if it doesn't exist
    - Updates existing application_settings to include caterer configuration
    - Ensures all application settings have the caterer type with default form fields
  
  2. Security
    - No changes to security policies
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
UPDATE application_settings
SET application_types = application_types || 
  jsonb_build_object(
    'type', 'caterer',
    'label', 'Caterer',
    'description', 'Food and beverage providers for the event',
    'enabled', true,
    'max_applications', 20,
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
WHERE 
  NOT EXISTS (
    SELECT 1 FROM jsonb_array_elements(application_types) as app_type
    WHERE app_type->>'type' = 'caterer'
  );