import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { fetchCompanyById } from '../services/companyService';
import { EmptyState } from '../components/common/EmptyState';
import { 
  Building2, 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  User, 
  Calendar, 
  Zap, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';

export const CompanyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCompany = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error: err } = await fetchCompanyById(id);

        if (err) {
          setError(err.message || 'Failed to load company details.');
        } else if (!data) {
          setError('Company record not found.');
        } else {
          setCompany(data);
        }
      } catch (e) {
        setError('An unexpected error occurred while fetching company.');
      } finally {
        setLoading(false);
      }
    };

    if (id) loadCompany();
  }, [id]);

  if (loading) {
    return (
      <AppLayout pageTitle="Company Details">
        <div className="flex items-center justify-center p-12 bg-white rounded-lg border border-slate-200">
          <div className="flex items-center space-x-3 text-slate-600">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-xs font-medium">Loading Company Record...</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !company) {
    return (
      <AppLayout pageTitle="Company Not Found">
        <div className="bg-white p-8 rounded-lg border border-slate-200 text-center space-y-4 max-w-lg mx-auto my-8">
          <div className="p-3 bg-red-50 text-red-600 rounded-full w-fit mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Unable to Load Company</h3>
          <p className="text-xs text-slate-500">{error || 'The requested company ID does not exist or has been removed.'}</p>
          <Link
            to="/companies"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-md text-xs font-medium hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Companies List</span>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle={`Company: ${company.name}`}>
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/companies')}
          className="inline-flex items-center space-x-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Companies List</span>
        </button>
      </div>

      {/* Company Detail Overview Card */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 bg-slate-900 text-white rounded-xl shadow-xs">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">{company.name}</h2>
              <p className="text-xs text-slate-500 font-mono">ID: {company.id}</p>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center space-x-2 text-slate-400 font-medium">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Contact Person</span>
            </div>
            <p className="font-semibold text-slate-900">{company.contact_person || 'Not specified'}</p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center space-x-2 text-slate-400 font-medium">
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              <span>Email Address</span>
            </div>
            <p className="font-semibold text-slate-900">{company.email || 'Not specified'}</p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center space-x-2 text-slate-400 font-medium">
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              <span>Phone Number</span>
            </div>
            <p className="font-semibold text-slate-900">{company.phone || 'Not specified'}</p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center space-x-2 text-slate-400 font-medium">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Registration Date</span>
            </div>
            <p className="font-semibold text-slate-900 font-mono">
              {company.created_at ? new Date(company.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>

        {/* Address */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
          <div className="flex items-center space-x-2 text-slate-400 font-medium">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>Facility / Office Address</span>
          </div>
          <p className="text-slate-800 font-medium">{company.address || 'No address details recorded.'}</p>
        </div>
      </div>

      {/* Transformers Section (Phase 4 Placeholder requirement) */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Transformers</h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {company.transformers?.length || 0} Registered Units
          </span>
        </div>

        {company.transformers && company.transformers.length > 0 ? (
          <div className="divide-y divide-slate-100 text-xs">
            {company.transformers.map((tf) => (
              <div key={tf.id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-semibold font-mono text-slate-900">{tf.serial_number}</span>
                  <span className="text-slate-500 block text-[11px]">{tf.location}</span>
                </div>
                <span className="font-mono text-slate-600">{tf.capacity_kva} kVA</span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Zap}
            title="No transformers registered for this company yet."
            description="Transformer asset registration for this client company will be enabled in Phase 5."
          />
        )}
      </div>
    </AppLayout>
  );
};
