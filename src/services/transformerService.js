import { supabase } from './supabaseClient';

// Fetch all transformers with associated company details
export const fetchTransformers = async () => {
  try {
    const { data, error } = await supabase
      .from('transformers')
      .select('*, companies(id, name)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Flatten company name for component convenience
    const formatted = (data || []).map((item) => ({
      ...item,
      companyName: item.companies?.name || 'Unknown Company',
    }));

    return { data: formatted, error: null };
  } catch (error) {
    console.error('Database Error [fetchTransformers]:', error.message);
    return { data: null, error };
  }
};

// Fetch single transformer by UUID with company details
export const fetchTransformerById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('transformers')
      .select('*, companies(id, name, contact_person, email, phone, address)')
      .eq('id', id)
      .single();

    if (error) throw error;

    const formatted = data
      ? {
          ...data,
          companyName: data.companies?.name || 'Unknown Company',
        }
      : null;

    return { data: formatted, error: null };
  } catch (error) {
    console.error(`Database Error [fetchTransformerById - ${id}]:`, error.message);
    return { data: null, error };
  }
};

// Insert a new transformer record
export const createTransformer = async (transformerData) => {
  try {
    const { data, error } = await supabase
      .from('transformers')
      .insert([transformerData])
      .select('*, companies(id, name)')
      .single();

    if (error) {
      if (error.code === '23505') {
        return {
          data: null,
          error: { message: `A transformer with Serial Number "${transformerData.serial_number}" already exists.` },
        };
      }
      throw error;
    }

    const formatted = {
      ...data,
      companyName: data.companies?.name || 'Unknown Company',
    };

    return { data: formatted, error: null };
  } catch (error) {
    console.error('Database Error [createTransformer]:', error.message);
    return { data: null, error };
  }
};

// Update an existing transformer record
export const updateTransformer = async (id, transformerData) => {
  try {
    const { data, error } = await supabase
      .from('transformers')
      .update(transformerData)
      .eq('id', id)
      .select('*, companies(id, name)')
      .single();

    if (error) {
      if (error.code === '23505') {
        return {
          data: null,
          error: { message: `Serial Number "${transformerData.serial_number}" is already used by another transformer.` },
        };
      }
      throw error;
    }

    const formatted = {
      ...data,
      companyName: data.companies?.name || 'Unknown Company',
    };

    return { data: formatted, error: null };
  } catch (error) {
    console.error(`Database Error [updateTransformer - ${id}]:`, error.message);
    return { data: null, error };
  }
};

// Delete a transformer record
export const deleteTransformer = async (id) => {
  try {
    const { error } = await supabase
      .from('transformers')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error(`Database Error [deleteTransformer - ${id}]:`, error.message);
    return { error };
  }
};
