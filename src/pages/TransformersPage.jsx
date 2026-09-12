import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { fetchTransformers, deleteTransformer } from '../services/transformerService';
import { TransformerFormModal } from '../components/transformers/TransformerFormModal';
import { DeleteTransformerModal } from '../components/transformers/DeleteTransformerModal';
import { EmptyState } from '../components/common/EmptyState';
import { 
  Zap, 
  Search, 
  Plus, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  RefreshCw, 
  Calendar, 
  MapPin, 
  Building2 
} from 'lucide-react';

export const TransformersPage = () => {
  const navigate = useNavigate();

  const [transformers, setTransformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTransformer, setEditingTransformer] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingTransformer, setDeletingTransformer] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Success toast message
  const [toastMessage, setToastMessage] = useState('');

  const loadTransformersList = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: err } = await fetchTransformers();

      if (err) {
        setError(err.message || 'Failed to fetch transformer records from database.');
      } else {
        setTransformers(data || []);
      }
    } catch (e) {
      setError('An unexpected error occurred while fetching transformer records.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransformersList();
  }, [loadTransformersList]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Create / Edit Modal handlers
  const handleOpenAddModal = () => {
    setEditingTransformer(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingTransformer(item);
    setIsFormModalOpen(true);
  };

  const handleFormSuccess = (updatedItem, actionType) => {
    loadTransformersList();
    showToast(
      actionType === 'created'
        ? `Transformer "${updatedItem.serial_number}" registered successfully.`
        : `Transformer "${updatedItem.serial_number}" updated successfully.`
    );
  };

  // Delete Modal handlers
  const handleOpenDeleteModal = (item) => {
    setDeletingTransformer(item);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTransformer) return;

    try {
      setIsDeleting(true);
      const { error: err } = await deleteTransformer(deletingTransformer.id);

      if (err) {
        alert(`Deletion failed: ${err.message}`);
      } else {
        showToast(`Transformer "${deletingTransformer.serial_number}" deleted successfully.`);
        loadTransformersList();
        setIsDeleteModalOpen(false);
        setDeletingTransformer(null);
      }
    } catch (e) {
      alert('An error occurred while deleting the transformer record.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Search Filter
  const filteredTransformers = transformers.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.serial_number?.toLowerCase().includes(term) ||
      item.model_number?.toLowerCase().includes(term) ||
      item.companyName?.toLowerCase().includes(term) ||
      item.location?.toLowerCase().includes(term)
    );
  });

  return (
    <AppLayout pageTitle="Transformer Fleet Management">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="text-emerald-700 hover:text-emerald-900">
            Dismiss
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Transformer Records</h2>
          <p className="text-xs text-slate-500">Track individual transformer assets, capacity, and owner company binding.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-md transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Register Transformer</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search serial number, model, company, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900"
          />
        </div>
        <div className="flex items-center justify-between md:justify-end space-x-4">
          <span className="text-xs text-slate-500 font-medium">
            Total Transformers: <span className="text-slate-900 font-semibold">{transformers.length}</span>
          </span>
          <button
            onClick={loadTransformersList}
            title="Refresh Transformers List"
            className="p-2 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-12 bg-white rounded-lg border border-slate-200 shadow-xs flex items-center justify-center">
          <div className="flex items-center space-x-3 text-slate-600">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-xs font-medium">Fetching Transformers from Database...</span>
          </div>
        </div>
      ) : error ? (
        <div className="p-8 bg-white rounded-lg border border-red-200 text-center space-y-3">
          <div className="p-2.5 bg-red-50 text-red-600 rounded-full w-fit mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Database Connection Error</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">{error}</p>
          <button
            onClick={loadTransformersList}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-md inline-flex items-center space-x-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      ) : filteredTransformers.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6">
          <EmptyState
            icon={Zap}
            title={searchTerm ? 'No transformers matched search query.' : 'No transformers registered yet.'}
            description={
              searchTerm
                ? 'Try adjusting your search terms.'
                : 'Click "Register Transformer" to add your first transformer asset.'
            }
            actionText={searchTerm ? 'Clear Search' : 'Register Transformer'}
            onAction={searchTerm ? () => setSearchTerm('') : handleOpenAddModal}
          />
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <tr>
                    <th className="px-5 py-3">Serial & Model</th>
                    <th className="px-5 py-3">Owner Company</th>
                    <th className="px-5 py-3">Capacity</th>
                    <th className="px-5 py-3">Location</th>
                    <th className="px-5 py-3">Installation Date</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredTransformers.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-md bg-blue-50 text-blue-600 shrink-0">
                            <Zap className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block font-mono">{item.serial_number}</span>
                            <span className="text-[11px] text-slate-400">{item.model_number || 'Standard Model'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-900">{item.companyName}</td>
                      <td className="px-5 py-3.5 font-mono text-slate-700">
                        {item.capacity_kva ? `${item.capacity_kva} kVA` : <span className="text-slate-400 italic">Unspecified</span>}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {item.location ? (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[160px]">{item.location}</span>
                          </div>
                        ) : (
                          <span className="italic text-slate-400">No location set</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-600">
                        {item.installation_date ? (
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{item.installation_date}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Not set</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => navigate(`/transformers/${item.id}`)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="View Transformer Specs"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                            title="Edit Transformer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(item)}
                            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete Transformer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards View */}
          <div className="md:hidden grid grid-cols-1 gap-4">
            {filteredTransformers.map((item) => (
              <div key={item.id} className="bg-white rounded-lg border border-slate-200 p-4 space-y-3 shadow-xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-md bg-blue-50 text-blue-600 shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm font-mono">{item.serial_number}</h3>
                      <p className="text-[11px] text-slate-500">{item.model_number || 'Standard Model'}</p>
                    </div>
                  </div>
                  {item.capacity_kva && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800 font-mono shrink-0">
                      {item.capacity_kva} kVA
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-xs text-slate-600 pt-1 border-t border-slate-100">
                  <p className="flex items-center space-x-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-900">{item.companyName}</span>
                  </p>
                  {item.location && (
                    <p className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{item.location}</span>
                    </p>
                  )}
                  {item.installation_date && (
                    <p className="flex items-center space-x-1 text-slate-500 font-mono text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Installed: {item.installation_date}</span>
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2 text-xs">
                  <button
                    onClick={() => navigate(`/transformers/${item.id}`)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded flex items-center space-x-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 font-medium rounded flex items-center space-x-1 border border-amber-200"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleOpenDeleteModal(item)}
                    className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 font-medium rounded flex items-center space-x-1 border border-red-200"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Form Modal */}
      <TransformerFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={handleFormSuccess}
        initialData={editingTransformer}
      />

      {/* Delete Confirmation Modal */}
      <DeleteTransformerModal
        isOpen={isDeleteModalOpen}
        transformer={deletingTransformer}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </AppLayout>
  );
};
