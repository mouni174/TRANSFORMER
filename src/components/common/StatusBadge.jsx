import React from 'react';

export const StatusBadge = ({ status }) => {
  const getBadgeStyle = () => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'EXPIRING_SOON':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'EXPIRED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getLabel = () => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'Active Warranty';
      case 'EXPIRING_SOON':
        return 'Expiring Soon';
      case 'EXPIRED':
        return 'Expired Warranty';
      default:
        return status || 'No Status';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeStyle()}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75" />
      {getLabel()}
    </span>
  );
};
