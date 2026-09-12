import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { fetchServiceRecordById } from '../services/serviceRecordService';
import { getWarrantyStatus, formatDisplayDate } from '../utils/warrantyUtils';
import { StatusBadge } from '../components/common/StatusBadge';
import { 
  Wrench, 
  ArrowLeft, 
  Building2, 
  Zap, 
  Calendar, 
  Droplet, 
  UserCheck, 
  ShieldCheck, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';

export const ServiceRecordDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRecord = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error: err } = await fetchServiceRecordById(id);

        if (err) {
          setError(err.message || 'Failed to load service record details.');
        } else if (!data) {
          setError('Service record not found.');
        } else {
          setRecord(data);
        }
      } catch (e) {
        setError('An unexpected error occurred while fetching service record details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) loadRecord();
  }, [id]);

  if (loading) {
    return (
      <AppLayout pageTitle="Service Record Details">
        <div className="flex items-center justify-center p-12 bg-white rounded-lg border border-slate-200">
          <div className="flex items-center space-x-3 text-slate-600">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-xs font-medium font-mono">Loading Service Record...</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !record) {
    return (
      <AppLayout pageTitle="Record Not Found">
        <div className="bg-white p-8 rounded-lg border border-slate-200 text-center space-y-4 max-w-lg mx-auto my-8">
          <div className="p-3 bg-red-50 text-red-600 rounded-full w-fit mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Unable to Load Record</h3>
          <p className="text-xs text-slate-500">{error || 'The requested service record does not exist or has been deleted.'}</p>
          <Link
            to="/service-records"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-md text-xs font-medium hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Service Logs</span>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const warrantyInfo = getWarrantyStatus(record.warranty_expiry_date);

  return (
    <AppLayout pageTitle={`Service Record: ${formatDisplayDate(record.service_date)}`}>
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/service-records')}
          className="inline-flex items-center space-x-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Service Logs</span>
        </button>
      </div>

      {/* Record Overview Card */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 bg-blue-600 text-white rounded-xl shadow-xs">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  Transformer Oil Service Record
                </h2>
              </div>
              <p className="text-xs text-slate-500 font-mono">ID: {record.id}</p>
            </div>
          </div>
          <div>
            <StatusBadge status={warrantyInfo.status} />
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center space-x-2 text-slate-400 font-medium">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Service Date</span>
            </div>
            <p className="font-bold text-slate-900 font-mono text-sm">
              {formatDisplayDate(record.service_date)}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center space-x-2 text-slate-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>1-Yr Warranty Expiry</span>
            </div>
            <p className="font-bold text-slate-900 font-mono text-sm">
              {formatDisplayDate(record.warranty_expiry_date)}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center space-x-2 text-slate-400 font-medium">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span>Transformer Serial</span>
            </div>
            <p className="font-bold text-slate-900 font-mono text-sm">
              {record.serialNumber}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center space-x-2 text-slate-400 font-medium">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Company Owner</span>
            </div>
            <p className="font-semibold text-slate-900 truncate">
              {record.companyName}
            </p>
          </div>
        </div>

        {/* Oil Specification & Technician Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center space-x-2 text-slate-500 font-semibold">
              <Droplet className="w-4 h-4 text-amber-500" />
              <span>Oil Details</span>
            </div>
            <div className="space-y-1 text-slate-700">
              <p><span className="font-medium text-slate-900">Oil Type:</span> {record.oil_type || 'Not specified'}</p>
              <p><span className="font-medium text-slate-900">Volume:</span> {record.quantity_liters ? `${record.quantity_liters} Liters` : 'Not recorded'}</p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center space-x-2 text-slate-500 font-semibold">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>Technician Authorization</span>
            </div>
            <div className="space-y-1 text-slate-700 font-mono text-[11px]">
              <p><span className="font-medium text-slate-900 font-sans">Serviced By UUID:</span> {record.serviced_by || 'Authenticated User'}</p>
              <p><span className="font-medium text-slate-900 font-sans">Record Logged:</span> {record.created_at ? new Date(record.created_at).toLocaleString() : 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Technician Notes */}
        {record.technician_notes && (
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
            <span className="font-semibold text-slate-700 block">Technician / Service Notes</span>
            <p className="text-slate-700 leading-relaxed">{record.technician_notes}</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
