import React from 'react';

interface BookingReminderEmailProps {
  clientName: string;
  artistName: string;
  eventName: string;
  bookingDate: string;
  bookingTime: string;
  boothNumber: string;
  consentFormCompleted: boolean;
  consentFormUrl?: string;
  cancellationDeadline: string;
}

export function BookingReminderEmail({
  clientName,
  artistName,
  eventName,
  bookingDate,
  bookingTime,
  boothNumber,
  consentFormCompleted,
  consentFormUrl,
  cancellationDeadline
}: BookingReminderEmailProps) {
  // This component is for reference only - it would be used server-side to generate email content
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px', color: '#333' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#6d28d9', marginBottom: '10px' }}>Booking Reminder</h1>
        <p style={{ fontSize: '18px', color: '#4b5563' }}>Your appointment is coming up soon!</p>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <p style={{ marginBottom: '10px' }}>Hello {clientName},</p>
        <p style={{ marginBottom: '20px' }}>
          This is a friendly reminder about your upcoming appointment with <strong>{artistName}</strong> at <strong>{eventName}</strong>.
        </p>
      </div>

      <div style={{ background: '#f3f4f6', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h2 style={{ color: '#6d28d9', marginBottom: '15px', fontSize: '18px' }}>Appointment Details</h2>
        <p style={{ marginBottom: '10px' }}><strong>Date:</strong> {formatDate(bookingDate)}</p>
        <p style={{ marginBottom: '10px' }}><strong>Time:</strong> {formatTime(bookingTime)}</p>
        <p style={{ marginBottom: '10px' }}><strong>Artist:</strong> {artistName}</p>
        <p style={{ marginBottom: '10px' }}><strong>Location:</strong> Booth {boothNumber}</p>
        <p style={{ marginBottom: '10px' }}><strong>Cancellation Deadline:</strong> {cancellationDeadline}</p>
      </div>

      {!consentFormCompleted && consentFormUrl && (
        <div style={{ background: '#fee2e2', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
          <h2 style={{ color: '#dc2626', marginBottom: '15px', fontSize: '18px' }}>Action Required: Consent Form</h2>
          <p style={{ marginBottom: '15px' }}>
            You still need to complete your consent form before your appointment. This is required for all procedures.
          </p>
          <div style={{ textAlign: 'center' }}>
            <a 
              href={consentFormUrl} 
              style={{ 
                display: 'inline-block', 
                background: '#6d28d9', 
                color: 'white', 
                padding: '10px 20px', 
                borderRadius: '5px', 
                textDecoration: 'none',
                fontWeight: 'bold'
              }}
            >
              Complete Consent Form
            </a>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#6d28d9', marginBottom: '15px', fontSize: '18px' }}>Preparation Tips</h2>
        <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
          <li>Arrive 15 minutes before your appointment time</li>
          <li>Bring a valid photo ID</li>
          <li>Eat a good meal before your appointment</li>
          <li>Stay hydrated</li>
          <li>Wear comfortable clothing that provides easy access to the area being worked on</li>
        </ul>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#6d28d9', marginBottom: '15px', fontSize: '18px' }}>Need to Cancel or Reschedule?</h2>
        <p>
          If you need to cancel or reschedule your appointment, please do so before the cancellation deadline. 
          You can manage your booking by logging into your TattSync account.
        </p>
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