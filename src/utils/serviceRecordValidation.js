import { calculateWarrantyExpiry } from './warrantyUtils';

// Input validation and sanitization helper for Service Records
export const validateServiceRecordInput = (data, currentUserId = null) => {
  const errors = {};

  const serviceDate = data.service_date?.trim() || '';
  const calculatedExpiry = serviceDate ? calculateWarrantyExpiry(serviceDate) : '';

  const sanitizedData = {
    transformer_id: data.transformer_id?.trim() || '',
    service_date: serviceDate,
    warranty_expiry_date: calculatedExpiry,
    oil_type: data.oil_type?.trim() || '',
    quantity_liters: data.quantity_liters !== '' && data.quantity_liters !== null && data.quantity_liters !== undefined
      ? parseFloat(data.quantity_liters)
      : null,
    technician_notes: data.technician_notes?.trim() || '',
    serviced_by: currentUserId || data.serviced_by || null,
  };

  // Required Field: Transformer Selection
  if (!sanitizedData.transformer_id) {
    errors.transformer_id = 'Please select a transformer.';
  }

  // Required Field: Service Date
  if (!sanitizedData.service_date) {
    errors.service_date = 'Service Date is required.';
  } else {
    const parts = sanitizedData.service_date.split('-');
    if (parts.length !== 3) {
      errors.service_date = 'Please enter a valid date in YYYY-MM-DD format.';
    }
  }

  // Validation: Quantity Liters (If entered, must be positive)
  if (sanitizedData.quantity_liters !== null) {
    if (isNaN(sanitizedData.quantity_liters) || sanitizedData.quantity_liters <= 0) {
      errors.quantity_liters = 'Quantity must be a valid positive number.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData,
  };
};
