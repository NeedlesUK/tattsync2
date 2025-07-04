import React from 'react';

interface TattooAftercareEmailProps {
  clientName: string;
  artistName: string;
  eventName: string;
  artistContactDetails?: string;
  bannerUrl?: string;
}

export function TattooAftercareEmail({
  clientName,
  artistName,
  eventName,
  artistContactDetails,
  bannerUrl
}: TattooAftercareEmailProps) {
  // This component is for reference only - it would be used server-side to generate email content
  
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px', color: '#333' }}>
      {bannerUrl && (
        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
          <img src={bannerUrl} alt="Event Banner" style={{ maxWidth: '100%', borderRadius: '8px' }} />
        </div>
      )}

      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#6d28d9', marginBottom: '10px' }}>Your Tattoo Aftercare Guide</h1>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <p style={{ marginBottom: '10px' }}>Thank you for your trust in getting tattooed by <strong>{artistName}</strong> at <strong>{eventName}</strong>. Here's everything you need to know to keep your tattoo healing beautifully:</p>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#6d28d9', marginBottom: '15px', fontSize: '18px' }}>1. How Long To Leave Wrapped?</h2>
        <p style={{ marginBottom: '20px' }}>
          There are numerous different coverings in use in the tattoo industry. Your artist will give you specific instructions.
        </p>

        <h2 style={{ color: '#6d28d9', marginBottom: '15px', fontSize: '18px' }}>2. Cleaning Your Tattoo</h2>
        <p style={{ marginBottom: '20px' }}>
          Clean your tattoo every day with a clean hand, warm water, and a fragrance-free soap. Let it air dry or gently pat it dry with a clean towel. Showers are great but no sitting water.
        </p>

        <h2 style={{ color: '#6d28d9', marginBottom: '15px', fontSize: '18px' }}>3. Aftercare Products</h2>
        <p style={{ marginBottom: '20px' }}>
          Apply a thin layer of recommended aftercare cream using a clean hand 3-4 times a day.
        </p>

        <h2 style={{ color: '#6d28d9', marginBottom: '15px', fontSize: '18px' }}>4. When To Cover Tattoo</h2>
        <p style={{ marginBottom: '20px' }}>
          Cover your new tattoo when in a dirty environment to help avoid infection. Allow skin to breathe as much as possible.
        </p>

        <h2 style={{ color: '#6d28d9', marginBottom: '15px', fontSize: '18px' }}>5. Clean Clothes And Bedding</h2>
        <p style={{ marginBottom: '20px' }}>
          Always use a clean towel whilst your tattoo is healing and allow it to air dry when possible. Keep clothes and bedding clean and fresh!
        </p>

        <h2 style={{ color: '#6d28d9', marginBottom: '15px', fontSize: '18px' }}>6. Avoid Standing Water</h2>
        <p style={{ marginBottom: '20px' }}>
          Avoid soaking your tattoo for at least a week i.e. baths, swimming, dishwater. Running water such as showers are perfect.
        </p>

        <h2 style={{ color: '#6d28d9', marginBottom: '15px', fontSize: '18px' }}>7. Avoid UV Rays</h2>
        <p style={{ marginBottom: '20px' }}>
          Avoid direct sunlight & sun beds for at least 2 weeks. Always use a strong sunblock to keep your tattoo at its best.
        </p>

        <h2 style={{ color: '#6d28d9', marginBottom: '15px', fontSize: '18px' }}>8. Do Not Pick Or Scratch</h2>
        <p style={{ marginBottom: '20px' }}>
          Please do not pick or scratch your tattoo whilst it is healing. This can cause trauma to the skin and lead to scarring and infection.
        </p>

        <h2 style={{ color: '#6d28d9', marginBottom: '15px', fontSize: '18px' }}>9. Concerns or questions?</h2>
        <p style={{ marginBottom: '20px' }}>
          The artist that applied your tattoo is responsible for any touch-ups, concerns, or ongoing advice.
        </p>
      </div>

      <div style={{ background: '#f3f4f6', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <p style={{ marginBottom: '10px' }}><strong>Your artist for this tattoo was {artistName}</strong></p>
        {artistContactDetails && (
          <p style={{ marginBottom: '10px' }}><strong>Contact:</strong> {artistContactDetails}</p>
        )}
        <p>If you have any further questions or concerns, feel free to reply to this email or reach out directly to your artist.</p>
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#6d28d9' }}>Happy healing!</p>
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