import React, { useEffect, useState } from 'react';
import { StatusBadge } from '../common/StatusBadge';
import { fetchServiceRecords } from '../../services/serviceRecordService';
import { getWarrantyStatus, formatDisplayDate } from '../../utils/warrantyUtils';
import { EmptyState } from '../common/EmptyState';
import { ShieldAlert, ArrowRight, Calendar, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ExpiringWarrantiesWidget = () => {
  const [urgentRecords, setUrgentRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getRecords = async () => {
      setLoading(true);
      const { data } = await fetchServiceRecords();

      const itemsWithStatus = (data || []).map((item) => ({
        ...item,
        warrantyInfo: getWarrantyStatus(item.warranty_expiry_date),
      }));

      // Filter for urgent warranties (Expiring soon or Expired)
      const filtered = itemsWithStatus.filter(
        (item) => item.warrantyInfo.status === 'EXPIRING_SOON' || item.warrantyInfo.status === 'EXPIRED'
      );

      // Priority sort: Expiring Soon (1) -> Expired (2)
      filtered.sort((a, b) => {
        const priorityOrder = { EXPIRING_SOON: 1, EXPIRED: 2 };
        const prioA = priorityOrder[a.warrantyInfo.status] || 99;
        const prioB = priorityOrder[b.warrantyInfo.status] || 99;
        if (prioA !== prioB) return prioA - prioB;
        return (a.warranty_expiry_date || '').localeCompare(b.warranty_expiry_date || '');
      });

      setUrgentRecords(filtered.slice(0, 5));
      setLoading(false);
    };

    getRecords();
  }, []);

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden flex flex-col">
      <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-semibold text-slate-900">Warranty Alerts</h3>
        </div>
        <Link
          to="/warranties"
          className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center space-x-1"
        >
          <span>View All Alerts</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 text-xs flex items-center justify-center space-x-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span>Evaluating warranty alert priority...</span>
        </div>
      ) : urgentRecords.length > 0 ? (
        <div className="divide-y divide-slate-100 overflow-x-auto flex-1">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 text-slate-500 font-medium">
              <tr>
                <th className="px-4 py-3">Transformer</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Warranty Expiry</th>
                <th className="px-4 py-3">Days Indicator</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {urgentRecords.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900 font-mono">
                    <Link to={`/service-records/${item.id}`} className="hover:text-blue-600 hover:underline">
                      {item.serialNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{item.companyName}</td>
                  <td className="px-4 py-3 font-mono text-slate-600">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDisplayDate(item.warranty_expiry_date)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    <span
                      className={`text-xs ${
                        item.warrantyInfo.status === 'EXPIRED' ? 'text-red-600 font-semibold' : 'text-amber-600 font-semibold'
                      }`}
                    >
                      {item.warrantyInfo.daysText}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.warrantyInfo.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-4 flex-1 flex items-center justify-center">
          <EmptyState
            icon={ShieldAlert}
            title="No warranty alerts at this time."
            description="All active transformer warranties are in good standing."
          />
        </div>
      )}
    </div>
  );
};
