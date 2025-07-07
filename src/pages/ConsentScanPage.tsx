import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QrCode, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { ConsentFormModal } from '../components/consent/ConsentFormModal';
import { ArtistSelector } from '../components/consent/ArtistSelector';

interface QrCodeData {
  code: string;
  event_id: number;
  event_name: string;
  form_id: number;
  form_title: string;
  expires_at: string;
  is_valid: boolean;
}

export function ConsentScanPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [qrData, setQrData] = useState<QrCodeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<any>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (code) {
      fetchQrCodeData(code);
    }
  }, [code]);

  const fetchQrCodeData = async (qrCode: string) => {
    try {
      setIsLoading(true);
      setError(null);
      // TODO: Implement API call to fetch QR code data
      setQrData(null);
      setError('QR code data not available');
    } catch (error) {
      console.error('Error fetching QR code data:', error);
      setError('Failed to load QR code data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleArtistSelect = (artist: any) => {
    setSelectedArtist(artist);
  };

  const handleContinue = () => {
    if (!selectedArtist) {
      alert('Please select an artist to continue.');
      return;
    }
    
    setIsFormModalOpen(true);
  };

  const handleSubmitForm = async (formData: any) => {
    try {
      // In a real implementation, submit to API
      console.log('Submitting form:', formData);
      
      // Mock successful submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsFormModalOpen(false);
      setIsSuccess(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-16">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Invalid QR Code</h1>
            <p className="text-gray-300 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen pt-16">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Form Submitted Successfully!</h1>
            <p className="text-gray-300 mb-6">
              Your consent form has been submitted to {selectedArtist?.name}. A copy has been emailed to you for your records.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-purple-400 hover:text-purple-300 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </button>
        
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-8 h-8 text-purple-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Consent Form</h1>
            <p className="text-gray-300">
              Complete a consent form for <span className="text-purple-400 font-medium">{qrData?.event_name}</span>
            </p>
          </div>
          
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Select Your Artist</h2>
            <p className="text-gray-300 mb-6">
              Please select the artist or piercer who will be performing your procedure.
            </p>
            
            <ArtistSelector
              eventId={qrData?.event_id || 1}
              onSelectArtist={handleArtistSelect}
              selectedArtist={selectedArtist}
            />
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handleContinue}
              disabled={!selectedArtist}
              className="bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Consent Form
            </button>
          </div>
        </div>
      </div>
      
      {/* Consent Form Modal */}
      {isFormModalOpen && qrData && (
        <ConsentFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          formId={qrData.form_id}
          eventId={qrData.event_id}
          onSubmit={handleSubmitForm}
        />
      )}
    </div>
  );
}