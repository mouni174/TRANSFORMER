// Initial state structures for database integration (Supabase)
// Default state contains zero records for production readiness.

export const INITIAL_SUMMARY_STATS = {
  totalCompanies: 0,
  totalTransformers: 0,
  activeWarranties: 0,
  expiringSoon: 0,
  expiredWarranties: 0,
};

export const INITIAL_COMPANIES = [];
export const INITIAL_TRANSFORMERS = [];
export const INITIAL_SERVICE_RECORDS = [];

// Backwards compatibility exports
export const MOCK_SUMMARY_STATS = INITIAL_SUMMARY_STATS;
export const MOCK_COMPANIES = INITIAL_COMPANIES;
export const MOCK_TRANSFORMERS = INITIAL_TRANSFORMERS;
export const MOCK_SERVICE_RECORDS = INITIAL_SERVICE_RECORDS;
