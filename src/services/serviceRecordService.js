import { supabase } from './supabaseClient';

// Fetch all service records with joined transformer and company information
export const fetchServiceRecords = async () => {
  try {
    const { data, error } = await supabase
      .from('service_records')
      .select('*, transformers(id, serial_number, model_number, capacity_kva, location, company_id, companies(id, name))')
      .order('service_date', { ascending: false });

    if (error) throw error;

    // Flatten joined relations for UI rendering
    const formatted = (data || []).map((item) => ({
      ...item,
      serialNumber: item.transformers?.serial_number || 'Unknown Transformer',
      companyName: item.transformers?.companies?.name || 'Unknown Company',
    }));

    return { data: formatted, error: null };
  } catch (error) {
    console.error('Database Error [fetchServiceRecords]:', error.message);
    return { data: null, error };
  }
};

// Fetch single service record by UUID
export const fetchServiceRecordById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('service_records')
      .select('*, transformers(id, serial_number, model_number, capacity_kva, location, company_id, companies(id, name))')
      .eq('id', id)
      .single();

    if (error) throw error;

    const formatted = data
      ? {
          ...data,
          serialNumber: data.transformers?.serial_number || 'Unknown Transformer',
          companyName: data.transformers?.companies?.name || 'Unknown Company',
        }
      : null;

    return { data: formatted, error: null };
  } catch (error) {
    console.error(`Database Error [fetchServiceRecordById - ${id}]:`, error.message);
    return { data: null, error };
  }
};

// Fetch service history for a specific transformer
export const fetchServiceRecordsByTransformer = async (transformerId) => {
  try {
    const { data, error } = await supabase
      .from('service_records')
      .select('*')
      .eq('transformer_id', transformerId)
      .order('service_date', { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error(`Database Error [fetchServiceRecordsByTransformer - ${transformerId}]:`, error.message);
    return { data: [], error };
  }
};

// Insert a new service record
export const createServiceRecord = async (serviceRecordData) => {
  try {
    const { data, error } = await supabase
      .from('service_records')
      .insert([serviceRecordData])
      .select('*, transformers(id, serial_number, company_id, companies(id, name))')
      .single();

    if (error) throw error;

    const formatted = {
      ...data,
      serialNumber: data.transformers?.serial_number || 'Unknown Transformer',
      companyName: data.transformers?.companies?.name || 'Unknown Company',
    };

    return { data: formatted, error: null };
  } catch (error) {
    console.error('Database Error [createServiceRecord]:', error.message);
    return { data: null, error };
  }
};

// Update an existing service record
export const updateServiceRecord = async (id, serviceRecordData) => {
  try {
    const { data, error } = await supabase
      .from('service_records')
      .update(serviceRecordData)
      .eq('id', id)
      .select('*, transformers(id, serial_number, company_id, companies(id, name))')
      .single();

    if (error) throw error;

    const formatted = {
      ...data,
      serialNumber: data.transformers?.serial_number || 'Unknown Transformer',
      companyName: data.transformers?.companies?.name || 'Unknown Company',
    };

    return { data: formatted, error: null };
  } catch (error) {
    console.error(`Database Error [updateServiceRecord - ${id}]:`, error.message);
    return { data: null, error };
  }
};

// Delete a service record
export const deleteServiceRecord = async (id) => {
  try {
    const { error } = await supabase
      .from('service_records')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error(`Database Error [deleteServiceRecord - ${id}]:`, error.message);
    return { error };
  }
};
