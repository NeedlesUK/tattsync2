import React from 'react';

interface PiercingAftercareEmailProps {
  clientName: string;
  piercerName: string;
  eventName: string;
  piercingType: string;
  piercerContactDetails?: string;
  bannerUrl?: string;
}

export function PiercingAftercareEmail({
  clientName,
  piercerName,
  eventName,
  piercingType,
  piercerContactDetails,
  bannerUrl
}: PiercingAftercareEmailProps) {
  // This component is for reference only - it would be used server-side to generate email content
  
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px', color: '#333' }}>
      {bannerUrl && (
        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
          <img src={bannerUrl} alt="Event Banner" style={{ maxWidth: '100%', borderRadius: '8px' }} />
        </div>
      )}

      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#0d9488', marginBottom: '10px' }}>Your Piercing Aftercare Guide</h1>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <p style={{ marginBottom: '10px' }}>Thank you for your trust in getting pierced by <strong>{piercerName}</strong> at <strong>{eventName}</strong>. Here's everything you need to know to ensure your new <strong>{piercingType}</strong> piercing heals properly:</p>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#0d9488', marginBottom: '15px', fontSize: '18px' }}>1. Cleaning Your Piercing</h2>
        <p style={{ marginBottom: '20px' }}>
          Clean your piercing twice daily with a sterile saline solution. Avoid using alcohol, hydrogen peroxide, or harsh soaps as these can irritate the piercing and delay healing.
        </p>

        <h2 style={{ color: '#0d9488', marginBottom: '15px', fontSize: '18px' }}>2. Hands Off</h2>
        <p style={{ marginBottom: '20px' }}>
          Avoid touching your piercing except when cleaning it, and always wash your hands thoroughly before contact. Twisting, turning, or playing with your jewelry can introduce bacteria and cause irritation.
        </p>

        <h2 style={{ color: '#0d9488', marginBottom: '15px', fontSize: '18px' }}>3. Avoid Contamination</h2>
        <p style={{ marginBottom: '20px' }}>
          Keep cosmetics, lotions, sprays, and other products away from your piercing. These can contain irritants that may cause infection or allergic reactions.
        </p>

        <h2 style={{ color: '#0d9488', marginBottom: '15px', fontSize: '18px' }}>4. Be Careful with Clothing</h2>
        <p style={{ marginBottom: '20px' }}>
          Wear clean, loose-fitting clothing around the piercing area. Avoid clothing that might catch on your jewelry or put pressure on your piercing.
        </p>

        <h2 style={{ color: '#0d9488', marginBottom: '15px', fontSize: '18px' }}>5. Avoid Swimming</h2>
        <p style={{ marginBottom: '20px' }}>
          Stay out of pools, hot tubs, lakes, and oceans while your piercing is healing. These bodies of water contain bacteria that can cause infection.
        </p>

        <h2 style={{ color: '#0d9488', marginBottom: '15px', fontSize: '18px' }}>6. Don't Remove Your Jewelry</h2>
        <p style={{ marginBottom: '20px' }}>
          Leave your jewelry in place during the entire healing period. Removing it too soon can cause the piercing to close or become irritated.
        </p>

        <h2 style={{ color: '#0d9488', marginBottom: '15px', fontSize: '18px' }}>7. Watch for Signs of Infection</h2>
        <p style={{ marginBottom: '20px' }}>
          Some redness, swelling, and tenderness are normal during the first week. However, if you experience increasing pain, excessive swelling, thick yellow or green discharge, or fever, seek medical attention as these may be signs of infection.
        </p>

        <h2 style={{ color: '#0d9488', marginBottom: '15px', fontSize: '18px' }}>8. Healing Time</h2>
        <p style={{ marginBottom: '20px' }}>
          Remember that each piercing has a different healing time. Your {piercingType} piercing typically takes [healing time] to fully heal. Be patient and continue aftercare for the entire healing period.
        </p>
      </div>

      <div style={{ background: '#f3f4f6', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <p style={{ marginBottom: '10px' }}><strong>Your piercer for this procedure was {piercerName}</strong></p>
        {piercerContactDetails && (
          <p style={{ marginBottom: '10px' }}><strong>Contact:</strong> {piercerContactDetails}</p>
        )}
        <p>If you have any questions or concerns about your piercing, please don't hesitate to contact your piercer directly.</p>
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#0d9488' }}>Happy healing!</p>
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          This email was sent by TattSync on behalf of {eventName}.<br />
          © 2024 TattSync. All rights reserved.
        </p>
      </div>
    </div>
  );
}