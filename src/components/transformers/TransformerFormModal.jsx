import React, { useState, useEffect } from 'react';
import { X, Loader2, Zap, AlertCircle, Building2, AlertTriangle } from 'lucide-react';
import { validateTransformerInput } from '../../utils/transformerValidation';
import { createTransformer, updateTransformer } from '../../services/transformerService';
import { fetchCompanies } from '../../services/companyService';
import { Link } from 'react-router-dom';

export const TransformerFormModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
  const isEditing = Boolean(initialData?.id);

  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  const [formData, setFormData] = useState({
    company_id: '',
    serial_number: '',
    model_number: '',
    capacity_kva: '',
    location: '',
    installation_date: '',
    notes: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // 1. Fetch Companies for Dropdown
      const getCompanies = async () => {
        setLoadingCompanies(true);
        const { data } = await fetchCompanies();
        setCompanies(data || []);
        setLoadingCompanies(false);
      };

      getCompanies();

      // 2. Set Form Data
      if (initialData) {
        setFormData({
          company_id: initialData.company_id || '',
          serial_number: initialData.serial_number || '',
          model_number: initialData.model_number || '',
          capacity_kva: initialData.capacity_kva !== null && initialData.capacity_kva !== undefined ? String(initialData.capacity_kva) : '',
          location: initialData.location || '',
          installation_date: initialData.installation_date || '',
          notes: initialData.notes || '',
        });
      } else {
        setFormData({
          company_id: '',
          serial_number: '',
          model_number: '',
          capacity_kva: '',
          location: '',
          installation_date: '',
          notes: '',
        });
      }

      setFieldErrors({});
      setServerError('');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    // Client-side Validation
    const { isValid, errors, sanitizedData } = validateTransformerInput(formData);
    if (!isValid) {
      setFieldErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      let result;

      if (isEditing) {
        result = await updateTransformer(initialData.id, sanitizedData);
      } else {
        result = await createTransformer(sanitizedData);
      }

      if (result.error) {
        setServerError(result.error.message || 'Failed to save transformer record.');
      } else {
        onSuccess(result.data, isEditing ? 'updated' : 'created');
        onClose();
      }
    } catch (err) {
      setServerError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-md">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isEditing ? 'Edit Transformer Specs' : 'Register New Transformer'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isEditing ? 'Update transformer technical details' : 'Add a new transformer asset under a client company'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {serverError && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          {/* No Companies Warning State */}
          {!loadingCompanies && companies.length === 0 && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-md text-amber-900 space-y-2">
              <div className="flex items-center space-x-2 font-semibold text-amber-950">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>No Companies Available</span>
              </div>
              <p className="text-[11px]">
                No companies available. Add a company before registering a transformer.
              </p>
              <Link
                to="/companies"
                onClick={onClose}
                className="inline-flex items-center space-x-1 font-semibold text-blue-700 hover:underline text-[11px]"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Go to Companies Page</span>
              </Link>
            </div>
          )}

          {/* Company Selection */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Client Company <span className="text-red-500">*</span>
            </label>
            {loadingCompanies ? (
              <div className="flex items-center space-x-2 text-slate-500 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Loading company list...</span>
              </div>
            ) : (
              <select
                name="company_id"
                value={formData.company_id}
                onChange={handleChange}
                disabled={companies.length === 0}
                className={`w-full px-3 py-2 border rounded-md bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 transition-colors ${
                  fieldErrors.company_id ? 'border-red-400 bg-red-50/50' : 'border-slate-200'
                }`}
              >
                <option value="">-- Select Owner Company --</option>
                {companies.map((comp) => (
                  <option key={comp.id} value={comp.id}>
                    {comp.name}
                  </option>
                ))}
              </select>
            )}
            {fieldErrors.company_id && (
              <p className="text-red-500 text-[11px] mt-1 font-medium">{fieldErrors.company_id}</p>
            )}
          </div>

          {/* Serial Number & Model Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Serial Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="serial_number"
                value={formData.serial_number}
                onChange={handleChange}
                placeholder="e.g. TRF-2024-8890"
                className={`w-full px-3 py-2 border rounded-md bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-mono transition-colors ${
                  fieldErrors.serial_number ? 'border-red-400 bg-red-50/50' : 'border-slate-200'
                }`}
              />
              {fieldErrors.serial_number && (
                <p className="text-red-500 text-[11px] mt-1 font-medium">{fieldErrors.serial_number}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Model Number</label>
              <input
                type="text"
                name="model_number"
                value={formData.model_number}
                onChange={handleChange}
                placeholder="e.g. XFMR-500KVA-3P"
                className="w-full px-3 py-2 border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 transition-colors"
              />
            </div>
          </div>

          {/* Capacity kVA & Installation Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Capacity (kVA)</label>
              <input
                type="number"
                step="any"
                min="0"
                name="capacity_kva"
                value={formData.capacity_kva}
                onChange={handleChange}
                placeholder="e.g. 500"
                className={`w-full px-3 py-2 border rounded-md bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-mono transition-colors ${
                  fieldErrors.capacity_kva ? 'border-red-400 bg-red-50/50' : 'border-slate-200'
                }`}
              />
              {fieldErrors.capacity_kva && (
                <p className="text-red-500 text-[11px] mt-1 font-medium">{fieldErrors.capacity_kva}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Installation Date</label>
              <input
                type="date"
                name="installation_date"
                value={formData.installation_date}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-mono transition-colors ${
                  fieldErrors.installation_date ? 'border-red-400 bg-red-50/50' : 'border-slate-200'
                }`}
              />
              {fieldErrors.installation_date && (
                <p className="text-red-500 text-[11px] mt-1 font-medium">{fieldErrors.installation_date}</p>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Substation Location / Bay</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Substation B - Yard 4"
              className="w-full px-3 py-2 border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 transition-colors"
            />
          </div>

          {/* Technical Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Technical Notes</label>
            <textarea
              name="notes"
              rows="2"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Optional specs or asset notes..."
              className="w-full px-3 py-2 border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 transition-colors resize-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-slate-200 rounded-md font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || companies.length === 0}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors inline-flex items-center space-x-1.5 shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? 'Save Specs' : 'Register Transformer'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
