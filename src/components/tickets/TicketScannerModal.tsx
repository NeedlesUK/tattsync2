import React, { useState, useEffect } from 'react';
import { X, Camera, CheckCircle, XCircle, AlertCircle, User, Calendar, Clock } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface TicketScannerModalProps {
  eventId: number;
  eventName: string;
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (ticketData: any, notes?: string) => void;
}

export function TicketScannerModal({
  eventId,
  eventName,
  isOpen,
  onClose,
  onScanComplete
}: TicketScannerModalProps) {
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState<null | {
    status: 'success' | 'error' | 'warning';
    message: string;
    ticketData?: any;
  }>(null);
  const [notes, setNotes] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setScanResult(null);
      setManualCode('');
      setNotes('');
      setIsScanning(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleManualScan = async () => {
    if (!manualCode.trim()) return;
    
    setIsScanning(true);
    
    try {
      // Mock scan result - in real implementation, this would validate against the database
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (manualCode === 'INVALID') {
        setScanResult({
          status: 'error',
          message: 'Invalid ticket code. This ticket does not exist.'
        });
      } else if (manualCode === 'USED') {
        setScanResult({
          status: 'warning',
          message: 'This ticket has already been scanned today at 10:23 AM.',
          ticketData: {
            id: '123',
            clientName: 'Sarah Johnson',
            ticketType: 'Weekend Pass',
            purchaseDate: '2024-01-15'
          }
        });
      } else {
        setScanResult({
          status: 'success',
          message: 'Ticket valid! Ready to check in.',
          ticketData: {
            id: '123',
            clientName: 'Sarah Johnson',
            ticketType: 'Weekend Pass',
            purchaseDate: '2024-01-15'
          }
        });
      }
    } catch (error) {
      console.error('Error scanning ticket:', error);
      setScanResult({
        status: 'error',
        message: 'An error occurred while scanning the ticket.'
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleConfirmCheckIn = () => {
    if (scanResult?.ticketData) {
      onScanComplete(scanResult.ticketData, notes);
      setScanResult(null);
      setManualCode('');
      setNotes('');
    }
  };

  const handleCameraScan = async () => {
    // In a real implementation, this would access the device camera
    // and scan a QR code. For now, we'll simulate a successful scan.
    setIsScanning(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setScanResult({
        status: 'success',
        message: 'Ticket valid! Ready to check in.',
        ticketData: {
          id: '456',
          clientName: 'Mike Chen',
          ticketType: 'Day Pass',
          purchaseDate: '2024-01-10'
        }
      });
    } catch (error) {
      console.error('Error scanning ticket:', error);
      setScanResult({
        status: 'error',
        message: 'An error occurred while scanning the ticket.'
      });
    } finally {
      setIsScanning(false);
    }
  };

  const renderScanResult = () => {
    if (!scanResult) return null;
    
    const { status, message, ticketData } = scanResult;
    
    const StatusIcon = status === 'success' ? CheckCircle : 
                      status === 'warning' ? AlertCircle : XCircle;
    
    const statusColors = {
      success: 'bg-green-500/20 border-green-500/30 text-green-400',
      warning: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
      error: 'bg-red-500/20 border-red-500/30 text-red-400'
    };
    
    return (
      <div className={`p-4 border rounded-lg ${statusColors[status]}`}>
        <div className="flex items-center space-x-3 mb-3">
          <StatusIcon className="w-6 h-6" />
          <span className="font-medium">{message}</span>
        </div>
        
        {ticketData && (
          <div className="bg-white/10 rounded-lg p-4 mb-4">
            <h4 className="text-white font-medium mb-3">Ticket Information</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">{ticketData.clientName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Ticket className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">{ticketData.ticketType}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">Purchased: {ticketData.purchaseDate}</span>
              </div>
            </div>
          </div>
        )}
        
        {status !== 'error' && ticketData && (
          <div>
            <label className="block text-sm font-medium mb-2">Check-in Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Add any notes about this check-in"
            />
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleConfirmCheckIn}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Confirm Check-in</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-purple-500/20 rounded-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">Ticket Scanner</h2>
            <p className="text-gray-300 text-sm">{eventName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Scan Mode Tabs */}
          <div className="flex border-b border-white/10 mb-6">
            <button
              onClick={() => setScanMode('camera')}
              className={`flex-1 py-3 font-medium transition-colors ${
                scanMode === 'camera'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Camera Scan
            </button>
            <button
              onClick={() => setScanMode('manual')}
              className={`flex-1 py-3 font-medium transition-colors ${
                scanMode === 'manual'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Manual Entry
            </button>
          </div>

          {/* Camera Scan */}
          {scanMode === 'camera' && !scanResult && (
            <div className="space-y-6">
              <div className="bg-black/50 rounded-lg aspect-square flex items-center justify-center overflow-hidden">
                {isScanning ? (
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white">Scanning...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300">Camera preview will appear here</p>
                    {/* QR code scanner would be implemented here in a real application */}
                  </div>
                )}
              </div>
              
              <button
                onClick={handleCameraScan}
                disabled={isScanning}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <Camera className="w-5 h-5" />
                <span>{isScanning ? 'Scanning...' : 'Start Scanning'}</span>
              </button>
              
              <p className="text-center text-gray-400 text-sm">
                Position the QR code within the camera frame
              </p>
            </div>
          )}

          {/* Manual Entry */}
          {scanMode === 'manual' && !scanResult && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ticket Code
                </label>
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter ticket code"
                />
              </div>
              
              <button
                onClick={handleManualScan}
                disabled={!manualCode.trim() || isScanning}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                {isScanning ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>Verify Ticket</span>
                  </>
                )}
              </button>
              
              <p className="text-center text-gray-400 text-sm">
                Enter the ticket code exactly as it appears
              </p>
            </div>
          )}

          {/* Scan Result */}
          {scanResult && renderScanResult()}
        </div>
      </div>
    </div>
  );
}

// Add this component to make TypeScript happy
function Ticket({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2" />
      <path d="M13 17v2" />
      <path d="M13 11v2" />
    </svg>
  );
}