import React from 'react';

export function Footer() {
  return (
    <footer className="bg-black/20 backdrop-blur-md border-t border-purple-500/20 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-white font-semibold text-lg">
              © TattSync
            </p>
            <p className="text-gray-300 text-sm">
              Professional Event Management Platform
            </p>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-gray-300 text-sm mb-1">
              Default Currency: GBP (£)
            </p>
            <p className="text-gray-400 text-xs">
              Secure • Professional • Reliable
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}