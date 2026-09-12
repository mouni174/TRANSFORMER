import { supabase } from './supabaseClient';

// Fetch all companies with transformer count
export const fetchCompanies = async () => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*, transformers(count)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform count payload for component consumption
    const formatted = (data || []).map((company) => ({
      ...company,
      transformerCount: company.transformers?.[0]?.count || 0,
    }));

    return { data: formatted, error: null };
  } catch (error) {
    console.error('Database Error [fetchCompanies]:', error.message);
    return { data: null, error };
  }
};

// Fetch single company by UUID
export const fetchCompanyById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*, transformers(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Database Error [fetchCompanyById - ${id}]:`, error.message);
    return { data: null, error };
  }
};

// Insert a new company record
export const createCompany = async (companyData) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .insert([companyData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Database Error [createCompany]:', error.message);
    return { data: null, error };
  }
};

// Update an existing company record
export const updateCompany = async (id, companyData) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .update(companyData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Database Error [updateCompany - ${id}]:`, error.message);
    return { data: null, error };
  }
};

// Delete a company record
export const deleteCompany = async (id) => {
  try {
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error(`Database Error [deleteCompany - ${id}]:`, error.message);
    return { error };
  }
};
