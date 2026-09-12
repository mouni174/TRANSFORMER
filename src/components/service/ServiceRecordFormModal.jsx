import React, { useState, useEffect } from 'react';
import { X, Loader2, Wrench, AlertCircle, ShieldCheck, AlertTriangle } from 'lucide-react';
import { validateServiceRecordInput } from '../../utils/serviceRecordValidation';
import { calculateWarrantyExpiry, formatDisplayDate } from '../../utils/warrantyUtils';
import { createServiceRecord, updateServiceRecord } from '../../services/serviceRecordService';
import { fetchTransformers } from '../../services/transformerService';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export const ServiceRecordFormModal = ({
  isOpen,
  onClose,
  onSuccess,
  initialData = null,
  preselectedTransformerId = null,
}) => {
  const { user } = useAuth();
  const isEditing = Boolean(initialData?.id);

  const [transformers, setTransformers] = useState([]);
  const [loadingTransformers, setLoadingTransformers] = useState(false);

  // Default service date to today's YYYY-MM-DD
  const getTodayStr = () => new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    transformer_id: preselectedTransformerId || '',
    service_date: getTodayStr(),
    oil_type: '',
    quantity_liters: '',
    technician_notes: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // 1. Fetch Transformers List for Dropdown
      const getTransformersList = async () => {
        setLoadingTransformers(true);
        const { data } = await fetchTransformers();
        setTransformers(data || []);
        setLoadingTransformers(false);
      };

      getTransformersList();

      // 2. Pre-populate Form Data
      if (initialData) {
        setFormData({
          transformer_id: initialData.transformer_id || preselectedTransformerId || '',
          service_date: initialData.service_date || getTodayStr(),
          oil_type: initialData.oil_type || '',
          quantity_liters:
            initialData.quantity_liters !== null && initialData.quantity_liters !== undefined
              ? String(initialData.quantity_liters)
              : '',
          technician_notes: initialData.technician_notes || '',
        });
      } else {
        setFormData({
          transformer_id: preselectedTransformerId || '',
          service_date: getTodayStr(),
          oil_type: '',
          quantity_liters: '',
          technician_notes: '',
        });
      }

      setFieldErrors({});
      setServerError('');
    }
  }, [isOpen, initialData, preselectedTransformerId]);

  if (!isOpen) return null;

  // Calculate live preview date
  const calculatedExpiryDate = formData.service_date
    ? calculateWarrantyExpiry(formData.service_date)
    : '';

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

    // Client-side Validation & Auto Warranty Expiry Calculation
    const { isValid, errors, sanitizedData } = validateServiceRecordInput(formData, user?.id);
    if (!isValid) {
      setFieldErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      let result;

      if (isEditing) {
        result = await updateServiceRecord(initialData.id, sanitizedData);
      } else {
        result = await createServiceRecord(sanitizedData);
      }

      if (result.error) {
        setServerError(result.error.message || 'Failed to save service record.');
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
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isEditing ? 'Edit Service Record' : 'Log Transformer Oil Service'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isEditing
                  ? 'Update service record and auto-recalculate warranty'
                  : 'Record completed oil change service & issue 1-year warranty'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {serverError && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          {/* No Transformers Warning State */}
          {!loadingTransformers && transformers.length === 0 && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-md text-amber-900 space-y-2">
              <div className="flex items-center space-x-2 font-semibold text-amber-950">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>No Transformers Available</span>
              </div>
              <p className="text-[11px]">
                No transformers available. Register a transformer before logging an oil service.
              </p>
              <Link
                to="/transformers"
                onClick={onClose}
                className="inline-flex items-center space-x-1 font-semibold text-blue-700 hover:underline text-[11px]"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Go to Transformers Page</span>
              </Link>
            </div>
          )}

          {/* Transformer Selection */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select Transformer <span className="text-red-500">*</span>
            </label>
            {loadingTransformers ? (
              <div className="flex items-center space-x-2 text-slate-500 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Loading transformer fleet...</span>
              </div>
            ) : (
              <select
                name="transformer_id"
                value={formData.transformer_id}
                onChange={handleChange}
                disabled={transformers.length === 0}
                className={`w-full px-3 py-2 border rounded-md bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 transition-colors ${
                  fieldErrors.transformer_id ? 'border-red-400 bg-red-50/50' : 'border-slate-200'
                }`}
              >
                <option value="">-- Select Company & Transformer --</option>
                {transformers.map((tf) => (
                  <option key={tf.id} value={tf.id}>
                    {tf.companyName} — {tf.serial_number} {tf.model_number ? `(${tf.model_number})` : ''}
                  </option>
                ))}
              </select>
            )}
            {fieldErrors.transformer_id && (
              <p className="text-red-500 text-[11px] mt-1 font-medium">{fieldErrors.transformer_id}</p>
            )}
          </div>

          {/* Service Date */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Service Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="service_date"
              value={formData.service_date}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-mono transition-colors ${
                fieldErrors.service_date ? 'border-red-400 bg-red-50/50' : 'border-slate-200'
              }`}
            />
            {fieldErrors.service_date && (
              <p className="text-red-500 text-[11px] mt-1 font-medium">{fieldErrors.service_date}</p>
            )}
          </div>

          {/* Read-Only Automatic 1-Year Warranty Preview */}
          <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-md flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-950 block text-[11px]">
                Automatic 1-Year Warranty Coverage
              </span>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Warranty Expiry:{' '}
                <span className="font-bold font-mono text-emerald-900">
                  {calculatedExpiryDate ? formatDisplayDate(calculatedExpiryDate) : 'Select service date'}
                </span>{' '}
                <span className="text-[10px] text-emerald-700 font-medium">
                  ({calculatedExpiryDate || 'YYYY-MM-DD'})
                </span>
              </p>
            </div>
          </div>

          {/* Oil Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Oil Type Specification</label>
              <input
                type="text"
                name="oil_type"
                value={formData.oil_type}
                onChange={handleChange}
                placeholder="e.g. Mineral Oil (IEC 60296)"
                className="w-full px-3 py-2 border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 transition-colors"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Quantity (Liters)</label>
              <input
                type="number"
                step="any"
                min="0"
                name="quantity_liters"
                value={formData.quantity_liters}
                onChange={handleChange}
                placeholder="e.g. 1200"
                className={`w-full px-3 py-2 border rounded-md bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-mono transition-colors ${
                  fieldErrors.quantity_liters ? 'border-red-400 bg-red-50/50' : 'border-slate-200'
                }`}
              />
              {fieldErrors.quantity_liters && (
                <p className="text-red-500 text-[11px] mt-1 font-medium">{fieldErrors.quantity_liters}</p>
              )}
            </div>
          </div>

          {/* Technician Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Technician / Service Notes</label>
            <textarea
              name="technician_notes"
              rows="3"
              value={formData.technician_notes}
              onChange={handleChange}
              placeholder="Record oil change details or observations..."
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
              disabled={isSubmitting || transformers.length === 0}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors inline-flex items-center space-x-1.5 shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Record...</span>
                </>
              ) : (
                <span>{isEditing ? 'Save Changes' : 'Record Oil Service'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
