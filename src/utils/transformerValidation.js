// Input validation and sanitization helper for Transformers

export const validateTransformerInput = (data) => {
  const errors = {};

  const sanitizedData = {
    company_id: data.company_id?.trim() || '',
    serial_number: data.serial_number?.trim() || '',
    model_number: data.model_number?.trim() || '',
    capacity_kva: data.capacity_kva !== '' && data.capacity_kva !== null && data.capacity_kva !== undefined
      ? parseFloat(data.capacity_kva)
      : null,
    location: data.location?.trim() || '',
    installation_date: data.installation_date || null,
    notes: data.notes?.trim() || '',
  };

  // Required Field: Company Selection
  if (!sanitizedData.company_id) {
    errors.company_id = 'Please select a company.';
  }

  // Required Field: Serial Number
  if (!sanitizedData.serial_number) {
    errors.serial_number = 'Serial Number is required.';
  } else if (sanitizedData.serial_number.length < 2) {
    errors.serial_number = 'Serial Number must be at least 2 characters.';
  }

  // Validation: Capacity kVA (If entered, must be positive number)
  if (sanitizedData.capacity_kva !== null) {
    if (isNaN(sanitizedData.capacity_kva) || sanitizedData.capacity_kva <= 0) {
      errors.capacity_kva = 'Capacity must be a valid positive number.';
    }
  }

  // Validation: Installation Date (If entered, must be valid)
  if (sanitizedData.installation_date) {
    const parsedDate = new Date(sanitizedData.installation_date);
    if (isNaN(parsedDate.getTime())) {
      errors.installation_date = 'Please enter a valid installation date.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData,
  };
};
