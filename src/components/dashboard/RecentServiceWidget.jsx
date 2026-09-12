import React, { useEffect, useState } from 'react';
import { fetchServiceRecords } from '../../services/serviceRecordService';
import { formatDisplayDate } from '../../utils/warrantyUtils';
import { EmptyState } from '../common/EmptyState';
import { Wrench, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RecentServiceWidget = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getRecords = async () => {
      setLoading(true);
      const { data } = await fetchServiceRecords();
      setRecords((data || []).slice(0, 5));
      setLoading(false);
    };

    getRecords();
  }, []);

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden flex flex-col">
      <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Wrench className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-semibold text-slate-900">Recent Service Records</h3>
        </div>
        <Link
          to="/service-records"
          className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center space-x-1"
        >
          <span>View All Logs</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 text-xs flex items-center justify-center space-x-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span>Loading recent service logs...</span>
        </div>
      ) : records.length > 0 ? (
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 text-slate-500 font-medium">
              <tr>
                <th className="px-4 py-3">Service Date</th>
                <th className="px-4 py-3">Transformer</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Oil Specification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3 font-mono font-medium text-slate-900">
                    {formatDisplayDate(record.service_date)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900 font-mono">{record.serialNumber}</td>
                  <td className="px-4 py-3">{record.companyName}</td>
                  <td className="px-4 py-3 font-medium">
                    {record.oil_type || 'Transformer Oil Service'} {record.quantity_liters ? `(${record.quantity_liters} L)` : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-4 flex-1 flex items-center justify-center">
          <EmptyState
            icon={Wrench}
            title="No service records available."
            description="Recorded oil change service events will appear here."
          />
        </div>
      )}
    </div>
  );
};
