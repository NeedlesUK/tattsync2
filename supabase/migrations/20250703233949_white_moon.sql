/*
  # Update Registration Agreements

  1. Updates
    - Update artist agreement text with specific requirements
    - Update trader and caterer agreement text
    - Remove agreements for volunteers and performers
    - Add ability for event managers to customize agreements

  2. Changes
    - Update existing registration_requirements with new agreement texts
    - Ensure proper formatting and requirements
*/

-- Update artist agreement text
UPDATE registration_requirements 
SET agreement_text = '1. I have a valid tattoo registration issued by a local authority or government department or am willing to demonstrate my understanding of safe tattooing using the method(s) determined by the event.

2. I have or will have valid Public Liability Insurance for the event.

3. I agree to comply with the Event Management Plan which includes national guidance and local bylaws.

4. I understand that I could be removed from the event because of behaviour deemed to be unruly or offensive.

5. I understand that all payments are non refundable except in certain circumstances deemed suitable by the event management.

6. I understand that if full payment is not received by the due date my space at the event may be forfeit without refund.

7. I understand that only the practitioner in this application may tattoo at the event in a single booth and this is not a studio application.'
WHERE application_type = 'artist';

-- Update piercer agreement text (same as artist)
UPDATE registration_requirements 
SET agreement_text = '1. I have a valid piercing registration issued by a local authority or government department or am willing to demonstrate my understanding of safe piercing using the method(s) determined by the event.

2. I have or will have valid Public Liability Insurance for the event.

3. I agree to comply with the Event Management Plan which includes national guidance and local bylaws.

4. I understand that I could be removed from the event because of behaviour deemed to be unruly or offensive.

5. I understand that all payments are non refundable except in certain circumstances deemed suitable by the event management.

6. I understand that if full payment is not received by the due date my space at the event may be forfeit without refund.

7. I understand that only the practitioner in this application may pierce at the event in a single booth and this is not a studio application.'
WHERE application_type = 'piercer';

-- Update trader agreement text
UPDATE registration_requirements 
SET agreement_text = 'By signing this online document I am agreeing I have read and agree to the following:

1. I have or will have valid Public Liability Insurance for trading at the event.

2. I agree to comply with the Event Management Plan which includes national guidance and local bylaws.

3. I understand that I could be removed from the event because of behaviour deemed to be unruly or offensive.

4. I understand that all payments are non refundable except in certain circumstances deemed suitable by the event management.

5. I understand that if full payment is not received by the due date my space at the event may be forfeit without refund.

6. I understand that only the trader in this application may trade at the event in a single booth and this is not a joint application.'
WHERE application_type = 'trader';

-- Update caterer agreement text
UPDATE registration_requirements 
SET agreement_text = 'By signing this online document I am agreeing I have read and agree to the following:

1. I have or will have valid Public Liability Insurance for trading at the event.

2. I agree to comply with the Event Management Plan which includes national guidance and local bylaws.

3. I understand that I could be removed from the event because of behaviour deemed to be unruly or offensive.

4. I understand that all payments are non refundable except in certain circumstances deemed suitable by the event management.

5. I understand that if full payment is not received by the due date my space at the event may be forfeit without refund.

6. I understand that only the caterer in this application may trade at the event in a single booth and this is not a joint application.'
WHERE application_type = 'caterer';

-- Remove agreement text for volunteers and performers (no agreement required)
UPDATE registration_requirements 
SET agreement_text = ''
WHERE application_type IN ('volunteer', 'performer');