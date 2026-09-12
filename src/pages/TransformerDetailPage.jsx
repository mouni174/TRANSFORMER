import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { fetchTransformerById } from '../services/transformerService';
import { fetchServiceRecordsByTransformer } from '../services/serviceRecordService';
import { ServiceRecordFormModal } from '../components/service/ServiceRecordFormModal';
import { getWarrantyStatus, formatDisplayDate } from '../utils/warrantyUtils';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { 
  Zap, 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Calendar, 
  Wrench, 
  Loader2, 
  AlertCircle, 
  Activity, 
  Plus, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';

export const TransformerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [transformer, setTransformer] = useState(null);
  const [serviceRecords, setServiceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState(null);

  // Modal State for Logging Service
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  const loadTransformerAndHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: err } = await fetchTransformerById(id);

      if (err) {
        setError(err.message || 'Failed to load transformer record.');
      } else if (!data) {
        setError('Transformer asset not found.');
      } else {
        setTransformer(data);

        // Fetch Service Records for this Transformer
        setLoadingHistory(true);
        const { data: recordsData } = await fetchServiceRecordsByTransformer(id);
        setServiceRecords(recordsData || []);
        setLoadingHistory(false);
      }
    } catch (e) {
      setError('An unexpected error occurred while fetching transformer specs.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) loadTransformerAndHistory();
  }, [id, loadTransformerAndHistory]);

  const handleServiceSuccess = () => {
    loadTransformerAndHistory();
  };

  if (loading) {
    return (
      <AppLayout pageTitle="Transformer Details">
        <div className="flex items-center justify-center p-12 bg-white rounded-lg border border-slate-200">
          <div className="flex items-center space-x-3 text-slate-600">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-xs font-medium">Loading Transformer Asset Specs...</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !transformer) {
    return (
      <AppLayout pageTitle="Transformer Not Found">
        <div className="bg-white p-8 rounded-lg border border-slate-200 text-center space-y-4 max-w-lg mx-auto my-8">
          <div className="p-3 bg-red-50 text-red-600 rounded-full w-fit mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Unable to Load Transformer</h3>
          <p className="text-xs text-slate-500">{error || 'The requested transformer ID does not exist or has been deleted.'}</p>
          <Link
            to="/transformers"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-md text-xs font-medium hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Transformers List</span>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle={`Transformer: ${transformer.serial_number}`}>
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/transformers')}
          className="inline-flex items-center space-x-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Transformers List</span>
        </button>
      </div>

      {/* Transformer Spec Sheet Card */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 bg-blue-600 text-white rounded-xl shadow-xs">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight font-mono">
                  {transformer.serial_number}
                </h2>
              </div>
              <p className="text-xs text-slate-500 font-medium">{transformer.model_number || 'Standard Transformer Asset'}</p>
            </div>
          </div>
          {transformer.company_id && (
            <Link
              to={`/companies/${transformer.company_id}`}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-md border border-slate-200 transition-colors w-fit"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Owner: {transformer.companyName}</span>
            </Link>
          )}
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center space-x-2 text-slate-400 font-medium">
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              <span>Capacity (kVA)</span>
            </div>
            <p className="font-bold text-slate-900 font-mono text-sm">
              {transformer.capacity_kva ? `${transformer.capacity_kva} kVA` : 'Not specified'}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center space-x-2 text-slate-400 font-medium">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Company Owner</span>
            </div>
            <p className="font-semibold text-slate-900">{transformer.companyName}</p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center space-x-2 text-slate-400 font-medium">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>Location / Bay</span>
            </div>
            <p className="font-semibold text-slate-900">{transformer.location || 'Not specified'}</p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center space-x-2 text-slate-400 font-medium">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Installation Date</span>
            </div>
            <p className="font-semibold text-slate-900 font-mono">
              {transformer.installation_date || 'Not recorded'}
            </p>
          </div>
        </div>

        {/* Technical Notes */}
        {transformer.notes && (
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
            <span className="font-semibold text-slate-700 block">Technical Notes</span>
            <p className="text-slate-700 leading-relaxed">{transformer.notes}</p>
          </div>
        )}
      </div>

      {/* Real Service Records Timeline Section */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Wrench className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Service & Warranty History</h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {serviceRecords.length} Historical Records
            </span>
          </div>

          <button
            onClick={() => setIsServiceModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors shadow-xs w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>Log Oil Service for This Transformer</span>
          </button>
        </div>

        {loadingHistory ? (
          <div className="p-8 text-center text-slate-500 text-xs flex items-center justify-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>Loading service history timeline...</span>
          </div>
        ) : serviceRecords.length > 0 ? (
          <div className="divide-y divide-slate-100 text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">Service Date</th>
                    <th className="px-4 py-2.5">Warranty Expiry</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Oil Details</th>
                    <th className="px-4 py-2.5 text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {serviceRecords.map((rec) => {
                    const statusInfo = getWarrantyStatus(rec.warranty_expiry_date);
                    return (
                      <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3 font-mono font-semibold text-slate-900">
                          {formatDisplayDate(rec.service_date)}
                        </td>
                        <td className="px-4 py-3 font-mono font-medium text-slate-900">
                          <div className="flex items-center space-x-1 text-emerald-700">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{formatDisplayDate(rec.warranty_expiry_date)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={statusInfo.status} />
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {rec.oil_type || rec.quantity_liters ? (
                            <span>
                              {rec.oil_type || 'Oil Service'} {rec.quantity_liters ? `(${rec.quantity_liters} L)` : ''}
                            </span>
                          ) : (
                            <span className="italic text-slate-400">Oil service</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            to={`/service-records/${rec.id}`}
                            className="p-1 text-slate-600 hover:text-blue-600 inline-block"
                            title="View Full Record"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Wrench}
            title="No service records available yet."
            description="Log an oil service for this transformer to issue its first 1-year warranty."
            actionText="Log Oil Service"
            onAction={() => setIsServiceModalOpen(true)}
          />
        )}
      </div>

      {/* Service Record Modal */}
      <ServiceRecordFormModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        onSuccess={handleServiceSuccess}
        preselectedTransformerId={transformer.id}
      />
    </AppLayout>
  );
};
