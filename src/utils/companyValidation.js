// Input validation and sanitization helper for Companies

export const validateCompanyInput = (data) => {
  const errors = {};
  
  const sanitizedData = {
    name: data.name?.trim() || '',
    contact_person: data.contact_person?.trim() || '',
    email: data.email?.trim() || '',
    phone: data.phone?.trim() || '',
    address: data.address?.trim() || '',
  };

  // Required Field: Company Name
  if (!sanitizedData.name) {
    errors.name = 'Company Name is required.';
  } else if (sanitizedData.name.length < 2) {
    errors.name = 'Company Name must be at least 2 characters.';
  }

  // Format Check: Email (if provided)
  if (sanitizedData.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedData.email)) {
      errors.email = 'Please enter a valid email address.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData,
  };
};
