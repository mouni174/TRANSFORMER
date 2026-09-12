import React, { useState, useEffect } from 'react';
import { X, Loader2, Building2, AlertCircle } from 'lucide-react';
import { validateCompanyInput } from '../../utils/companyValidation';
import { createCompany, updateCompany } from '../../services/companyService';

export const CompanyFormModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
  const isEditing = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name || '',
          contact_person: initialData.contact_person || '',
          email: initialData.email || '',
          phone: initialData.phone || '',
          address: initialData.address || '',
        });
      } else {
        setFormData({
          name: '',
          contact_person: '',
          email: '',
          phone: '',
          address: '',
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

    // 1. Client-side Validation
    const { isValid, errors, sanitizedData } = validateCompanyInput(formData);
    if (!isValid) {
      setFieldErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      let result;

      if (isEditing) {
        result = await updateCompany(initialData.id, sanitizedData);
      } else {
        result = await createCompany(sanitizedData);
      }

      if (result.error) {
        setServerError(result.error.message || 'Failed to save company record.');
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
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-slate-900 text-white rounded-md">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isEditing ? 'Edit Company Record' : 'Add New Company'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isEditing ? 'Update client organization details' : 'Register a new client company entity'}
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

          {/* Company Name */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Apex Industrial Utilities"
              className={`w-full px-3 py-2 border rounded-md bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 transition-colors ${
                fieldErrors.name ? 'border-red-400 bg-red-50/50' : 'border-slate-200'
              }`}
            />
            {fieldErrors.name && <p className="text-red-500 text-[11px] mt-1 font-medium">{fieldErrors.name}</p>}
          </div>

          {/* Contact Person */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Contact Person</label>
            <input
              type="text"
              name="contact_person"
              value={formData.contact_person}
              onChange={handleChange}
              placeholder="e.g. Robert Miller"
              className="w-full px-3 py-2 border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 transition-colors"
            />
          </div>

          {/* Email & Phone Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contact@company.com"
                className={`w-full px-3 py-2 border rounded-md bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 transition-colors ${
                  fieldErrors.email ? 'border-red-400 bg-red-50/50' : 'border-slate-200'
                }`}
              />
              {fieldErrors.email && <p className="text-red-500 text-[11px] mt-1 font-medium">{fieldErrors.email}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 transition-colors"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Office / Substation Address</label>
            <textarea
              name="address"
              rows="3"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter facility address..."
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
              disabled={isSubmitting}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-semibold transition-colors inline-flex items-center space-x-1.5 shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? 'Save Changes' : 'Create Company'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
