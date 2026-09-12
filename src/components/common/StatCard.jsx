import React from 'react';

export const StatCard = ({ title, value, icon: Icon, description, badgeText, badgeType = 'neutral' }) => {
  const getBadgeColor = () => {
    switch (badgeType) {
      case 'success':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'warning':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'danger':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        {Icon && (
          <div className="p-2 rounded-md bg-slate-100 text-slate-600">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-3xl font-semibold text-slate-900 tracking-tight">{value}</span>
        {badgeText && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded border ${getBadgeColor()}`}>
            {badgeText}
          </span>
        )}
      </div>
      {description && <p className="mt-2 text-xs text-slate-500">{description}</p>}
    </div>
  );
};
