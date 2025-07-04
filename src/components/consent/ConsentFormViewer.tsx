import React, { useState } from 'react';
import { FileText, Download, Printer, Mail, CheckCircle, Calendar, User, Phone, MapPin } from 'lucide-react';

interface ConsentFormViewerProps {
  submission: {
    id: number;
    form_id: number;
    client_id: string;
    submission_data: any;
    submitted_at: string;
  };
  formStructure: {
    id: number;
    title: string;
    description: string;
    sections: any[];
  };
  clientData?: {
    name: string;
    email: string;
    phone?: string;
  };
  artistData?: {
    name: string;
    email: string;
    booth_number?: string;
  };
  onClose?: () => void;
  isPrintable?: boolean;
}

export function ConsentFormViewer({ 
  submission, 
  formStructure, 
  clientData, 
  artistData,
  onClose,
  isPrintable = false
}: ConsentFormViewerProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    // In a real implementation, generate PDF and download
    setTimeout(() => {
      setIsDownloading(false);
      // Mock download success
      alert('Form downloaded successfully');
    }, 1500);
  };

  const handlePrint = () => {
    setIsPrinting(true);
    // In a real implementation, open print dialog
    setTimeout(() => {
      setIsPrinting(false);
      window.print();
    }, 500);
  };

  const handleEmail = () => {
    setIsEmailing(true);
    // In a real implementation, send email
    setTimeout(() => {
      setIsEmailing(false);
      // Mock email success
      alert('Form emailed successfully');
    }, 1500);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderFieldValue = (field: any, value: any) => {
    if (value === undefined || value === null) {
      return <span className="text-gray-400 italic">Not provided</span>;
    }
    
    switch (field.field_type) {
      case 'checkbox':
        if (field.field_options && field.field_options.length > 0) {
          // Multiple checkboxes (checkbox group)
          const selectedOptions = Array.isArray(value) ? value : [];
          if (selectedOptions.length === 0) {
            return <span className="text-gray-400 italic">None selected</span>;
          }
          return (
            <ul className="list-disc list-inside">
              {selectedOptions.map((option: string, index: number) => (
                <li key={index} className="text-gray-300">{option}</li>
              ))}
            </ul>
          );
        } else {
          // Single checkbox
          return value ? (
            <span className="text-green-400 flex items-center">
              <CheckCircle className="w-4 h-4 mr-1" /> Confirmed
            </span>
          ) : (
            <span className="text-gray-400">Not confirmed</span>
          );
        }
        
      case 'radio':
        return <span className="text-gray-300">{value}</span>;
        
      case 'file':
      case 'image':
        return value ? (
          <span className="text-purple-400">{value}</span>
        ) : (
          <span className="text-gray-400 italic">No file uploaded</span>
        );
        
      case 'date':
        return value ? (
          <span className="text-gray-300">{new Date(value).toLocaleDateString('en-GB')}</span>
        ) : (
          <span className="text-gray-400 italic">No date provided</span>
        );
        
      default:
        return <span className="text-gray-300">{value}</span>;
    }
  };

  return (
    <div className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl ${isPrintable ? 'p-8' : 'p-6'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FileText className="w-6 h-6 text-purple-400" />
          <div>
            <h2 className="text-xl font-bold text-white">{formStructure.title}</h2>
            <p className="text-gray-300 text-sm">Submitted: {formatDate(submission.submitted_at)}</p>
          </div>
        </div>
        
        {!isPrintable && (
          <div className="flex space-x-2">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={handleEmail}
              disabled={isEmailing}
              className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mail className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Client and Artist Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Client Information */}
        <div className="bg-white/5 rounded-lg p-4">
          <h3 className="text-white font-medium mb-3 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Client Information
          </h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300">{clientData?.name || submission.submission_data.clientName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300">{clientData?.email || submission.submission_data.clientEmail}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300">{clientData?.phone || submission.submission_data.Phone}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300">
                DOB: {submission.submission_data.DOB ? new Date(submission.submission_data.DOB).toLocaleDateString('en-GB') : 'Not provided'}
              </span>
            </div>
            {submission.submission_data.FullAddress && (
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                <span className="text-gray-300">{submission.submission_data.FullAddress}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Artist Information */}
        {artistData && (
          <div className="bg-white/5 rounded-lg p-4">
            <h3 className="text-white font-medium mb-3 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Artist Information
            </h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">{artistData.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">{artistData.email}</span>
              </div>
              {artistData.booth_number && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">Booth: {artistData.booth_number}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Form Sections */}
      <div className="space-y-6">
        {formStructure.sections.map((section: any) => (
          <div key={section.id} className="bg-white/5 rounded-lg p-4">
            <h3 className="text-white font-medium mb-3">{section.title}</h3>
            {section.description && (
              <p className="text-gray-400 text-sm mb-4">{section.description}</p>
            )}
            
            <div className="space-y-4">
              {section.fields.map((field: any) => (
                <div key={field.id}>
                  <div className="flex justify-between mb-1">
                    <label className="text-gray-300 text-sm font-medium">
                      {field.field_label}
                      {field.is_required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                  </div>
                  <div className="bg-white/5 p-3 rounded">
                    {renderFieldValue(field, submission.submission_data[field.field_name])}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Signature and Date */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-400 text-sm mb-2">Client Signature</p>
            <div className="bg-white/5 p-3 rounded h-16 flex items-center justify-center">
              <span className="text-green-400 flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" /> Electronically Signed
              </span>
            </div>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-2">Submission Date</p>
            <div className="bg-white/5 p-3 rounded">
              <span className="text-gray-300">{formatDate(submission.submitted_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Close Button (if not printable) */}
      {!isPrintable && onClose && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}