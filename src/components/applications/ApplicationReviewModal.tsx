import React, { useState } from 'react';
import { X, Eye, Check, XCircle, User, Mail, Phone, Calendar, MapPin, Building, ExternalLink, Image, FileText, Award, Coffee, Gift } from 'lucide-react';

interface Application {
  id: number;
  applicant_name: string;
  applicant_email: string;
  date_of_birth: string;
  telephone: string;
  application_type: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  form_data: any;
  event_name: string;
}

interface ApplicationReviewModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onApproveComplimentary?: (id: number) => void;
}

export function ApplicationReviewModal({ 
  application, 
  isOpen, 
  onClose, 
  onApprove, 
  onReject,
  onApproveComplimentary
}: ApplicationReviewModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !application) return null;

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await onApprove(application.id);
      onClose();
    } catch (error) {
      console.error('Error approving application:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      await onReject(application.id);
      onClose();
    } catch (error) {
      console.error('Error rejecting application:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveComplimentary = async () => {
    if (!onApproveComplimentary) return;
    
    setIsProcessing(true);
    try {
      await onApproveComplimentary(application.id);
      onClose();
    } catch (error) {
      console.error('Error approving application as complimentary:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getApplicationTypeInfo = (type: string) => {
    const info = {
      artist: { title: 'Tattoo Artist', icon: '🎨', color: 'purple' },
      piercer: { title: 'Piercer', icon: '💎', color: 'teal' },
      performer: { title: 'Performer', icon: '🎭', color: 'orange' },
      trader: { title: 'Trader', icon: '🛍️', color: 'blue' },
      volunteer: { title: 'Volunteer', icon: '🤝', color: 'green' },
      caterer: { title: 'Caterer', icon: '🍕', color: 'yellow' }
    };
    return info[type as keyof typeof info] || { title: type, icon: '📋', color: 'gray' };
  };

  const typeInfo = getApplicationTypeInfo(application.application_type);

  // Check if complimentary option is available for this application type
  const canApproveComplimentary = ['artist', 'piercer', 'trader', 'caterer'].includes(application.application_type);

  const renderFormData = () => {
    const formData = application.form_data || {};
    
    return (
      <div className="space-y-6">
        {/* Studio/Business Information */}
        {(formData.studio_name || formData.business_name) && (
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3 flex items-center">
              <Building className="w-5 h-5 mr-2" />
              {application.application_type === 'artist' || application.application_type === 'piercer' 
                ? 'Studio Information' 
                : 'Business Information'}
            </h4>
            <div className="space-y-2">
              {formData.studio_name && (
                <div>
                  <span className="text-gray-400 text-sm">Studio Name:</span>
                  <p className="text-white">{formData.studio_name}</p>
                </div>
              )}
              {formData.business_name && (
                <div>
                  <span className="text-gray-400 text-sm">Business Name:</span>
                  <p className="text-white">{formData.business_name}</p>
                </div>
              )}
              {formData.studio_address && (
                <div>
                  <span className="text-gray-400 text-sm">Address:</span>
                  <p className="text-white whitespace-pre-line">{formData.studio_address}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Licensing Information */}
        {formData.uk_licence && (
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3 flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Licensing Information
            </h4>
            <div className="space-y-2">
              <div>
                <span className="text-gray-400 text-sm">
                  UK Local Authority {application.application_type === 'artist' ? 'Tattoo' : 'Piercing'} Licence:
                </span>
                <p className={`font-medium ${formData.uk_licence === 'Yes' ? 'text-green-400' : 'text-yellow-400'}`}>
                  {formData.uk_licence}
                </p>
              </div>
              {formData.uk_licence === 'No' && formData.other_licence_details && (
                <div>
                  <span className="text-gray-400 text-sm">Other Licence/Documents:</span>
                  <p className="text-white whitespace-pre-line">{formData.other_licence_details}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Portfolio/Online Presence */}
        {(formData.portfolio_url || formData.portfolio_images) && (
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3 flex items-center">
              <Image className="w-5 h-5 mr-2" />
              {application.application_type === 'performer' ? 'Audition Material' : 
               application.application_type === 'trader' || application.application_type === 'caterer' ? 'Online Presence' : 
               'Portfolio'}
            </h4>
            <div className="space-y-3">
              {formData.portfolio_url && (
                <div>
                  <span className="text-gray-400 text-sm">Link:</span>
                  <a 
                    href={formData.portfolio_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 flex items-center space-x-1 mt-1"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>{formData.portfolio_url}</span>
                  </a>
                </div>
              )}
              {formData.portfolio_images && formData.portfolio_images.length > 0 && (
                <div>
                  <span className="text-gray-400 text-sm">Uploaded Images:</span>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {formData.portfolio_images.map((image: any, index: number) => (
                      <div key={index} className="bg-white/10 rounded p-2 text-center">
                        <FileText className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                        <p className="text-xs text-gray-400 truncate">{image.name || `Image ${index + 1}`}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Product/Service Description */}
        {formData.product_description && (
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Product/Service Description</h4>
            <p className="text-white whitespace-pre-line">{formData.product_description}</p>
          </div>
        )}

        {/* Menu Description */}
        {formData.menu_description && (
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3 flex items-center">
              <Coffee className="w-5 h-5 mr-2" />
              Menu Description
            </h4>
            <p className="text-white whitespace-pre-line">{formData.menu_description}</p>
          </div>
        )}

        {/* Service Types (Caterer) */}
        {formData.service_types && formData.service_types.length > 0 && (
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Services Offered</h4>
            <div className="flex flex-wrap gap-2">
              {formData.service_types.map((service: string, index: number) => (
                <span key={index} className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm">
                  {service}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Performance Description */}
        {formData.performance_description && (
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Performance Description</h4>
            <p className="text-white whitespace-pre-line">{formData.performance_description}</p>
          </div>
        )}

        {/* Skills & Experience (Volunteer) */}
        {formData.skills_experience && (
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Skills, Experience & Qualifications</h4>
            <p className="text-white whitespace-pre-line">{formData.skills_experience}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-purple-500/20 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">{typeInfo.icon}</div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {typeInfo.title} Application
              </h2>
              <p className="text-gray-300 text-sm">
                {application.event_name} • Submitted {formatDate(application.created_at)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Applicant Information */}
          <div className="bg-white/5 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Applicant Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <span className="text-gray-400 text-sm">Full Name</span>
                    <p className="text-white font-medium">{application.applicant_name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <span className="text-gray-400 text-sm">Email</span>
                    <p className="text-white">{application.applicant_email}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <span className="text-gray-400 text-sm">Telephone</span>
                    <p className="text-white">{application.telephone}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <span className="text-gray-400 text-sm">Date of Birth</span>
                    <p className="text-white">{formatDate(application.date_of_birth)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Application Details */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Application Details</h3>
            {renderFormData()}
          </div>
        </div>

        {/* Actions */}
        {application.status === 'pending' && (
          <div className="flex space-x-3 p-6 border-t border-white/10 bg-white/5">
            <button
              onClick={handleReject}
              disabled={isProcessing}
              className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <XCircle className="w-5 h-5" />
              <span>{isProcessing ? 'Processing...' : 'Reject'}</span>
            </button>
            
            {canApproveComplimentary && onApproveComplimentary && (
              <button
                onClick={handleApproveComplimentary}
                disabled={isProcessing}
                className="flex-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Gift className="w-5 h-5" />
                <span>{isProcessing ? 'Processing...' : 'Approve (Complimentary)'}</span>
              </button>
            )}
            
            <button
              onClick={handleApprove}
              disabled={isProcessing}
              className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Check className="w-5 h-5" />
              <span>{isProcessing ? 'Processing...' : 'Approve'}</span>
            </button>
          </div>
        )}

        {application.status !== 'pending' && (
          <div className="p-6 border-t border-white/10 bg-white/5">
            <div className={`text-center py-3 rounded-lg ${
              application.status === 'approved' 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              <span className="font-medium">
                Application {application.status === 'approved' ? 'Approved' : 'Rejected'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}