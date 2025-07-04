import React from 'react';
import { Filter, Users } from 'lucide-react';

interface ApplicationFiltersProps {
  selectedType: string;
  selectedStatus: string;
  onTypeChange: (type: string) => void;
  onStatusChange: (status: string) => void;
}

export function ApplicationFilters({
  selectedType,
  selectedStatus,
  onTypeChange,
  onStatusChange
}: ApplicationFiltersProps) {
  const applicationTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'artist', label: 'Artist' },
    { value: 'piercer', label: 'Piercer' },
    { value: 'performer', label: 'Performer' },
    { value: 'trader', label: 'Trader' },
    { value: 'volunteer', label: 'Volunteer' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative">
        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <select
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value)}
          className="pl-10 pr-8 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none min-w-[140px]"
        >
          {applicationTypes.map((type) => (
            <option key={type.value} value={type.value} className="bg-gray-800">
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className="relative">
        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="pl-10 pr-8 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none min-w-[130px]"
        >
          {statusOptions.map((status) => (
            <option key={status.value} value={status.value} className="bg-gray-800">
              {status.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}