import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { fetchServiceRecords, deleteServiceRecord } from '../services/serviceRecordService';
import { ServiceRecordFormModal } from '../components/service/ServiceRecordFormModal';
import { DeleteServiceRecordModal } from '../components/service/DeleteServiceRecordModal';
import { getWarrantyStatus, formatDisplayDate } from '../utils/warrantyUtils';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { 
  Wrench, 
  Search, 
  Plus, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  RefreshCw, 
  Calendar, 
  Droplet, 
  ShieldCheck 
} from 'lucide-react';

export const ServiceRecordsPage = () => {
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Success toast message
  const [toastMessage, setToastMessage] = useState('');

  const loadServiceRecordsList = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: err } = await fetchServiceRecords();

      if (err) {
        setError(err.message || 'Failed to fetch service records from database.');
      } else {
        setRecords(data || []);
      }
    } catch (e) {
      setError('An unexpected error occurred while fetching service logs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServiceRecordsList();
  }, [loadServiceRecordsList]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Create / Edit Modal handlers
  const handleOpenAddModal = () => {
    setEditingRecord(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingRecord(item);
    setIsFormModalOpen(true);
  };

  const handleFormSuccess = (updatedItem, actionType) => {
    loadServiceRecordsList();
    showToast(
      actionType === 'created'
        ? `Oil service record logged successfully.`
        : `Service record updated successfully.`
    );
  };

  // Delete Modal handlers
  const handleOpenDeleteModal = (item) => {
    setDeletingRecord(item);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingRecord) return;

    try {
      setIsDeleting(true);
      const { error: err } = await deleteServiceRecord(deletingRecord.id);

      if (err) {
        setIsDeleteModalOpen(false);
        showToast(`Deletion failed: ${err.message}`);
      } else {
        showToast('Service record deleted successfully.');
        loadServiceRecordsList();
        setIsDeleteModalOpen(false);
        setDeletingRecord(null);
      }
    } catch (e) {
      setIsDeleteModalOpen(false);
      showToast('An error occurred while deleting the service record.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Search Filter
  const filteredRecords = records.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.serialNumber?.toLowerCase().includes(term) ||
      item.companyName?.toLowerCase().includes(term) ||
      item.oil_type?.toLowerCase().includes(term) ||
      item.service_date?.toLowerCase().includes(term)
    );
  });

  return (
    <AppLayout pageTitle="Oil Service Logs & History">
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
          <h2 className="text-base font-semibold text-slate-900">Historical Service Logs</h2>
          <p className="text-xs text-slate-500">Record of transformer oil service work and associated 1-year warranties.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Log Oil Service</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search serial number, company, oil type, date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900"
          />
        </div>
        <div className="flex items-center justify-between md:justify-end space-x-4">
          <span className="text-xs text-slate-500 font-medium">
            Total Service Records: <span className="text-slate-900 font-semibold">{records.length}</span>
          </span>
          <button
            onClick={loadServiceRecordsList}
            title="Refresh Service Logs"
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
            <span className="text-xs font-medium">Fetching Service Records from Database...</span>
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
            onClick={loadServiceRecordsList}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-md inline-flex items-center space-x-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6">
          <EmptyState
            icon={Wrench}
            title={searchTerm ? 'No service records matched search query.' : 'No service records available.'}
            description={
              searchTerm
                ? 'Try adjusting your search terms.'
                : 'Click "Log Oil Service" to record your first completed transformer oil change.'
            }
            actionText={searchTerm ? 'Clear Search' : 'Log Oil Service'}
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
                    <th className="px-5 py-3">Service Date</th>
                    <th className="px-5 py-3">Transformer</th>
                    <th className="px-5 py-3">Company</th>
                    <th className="px-5 py-3">Oil Specification</th>
                    <th className="px-5 py-3">1-Yr Warranty Expiry</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredRecords.map((record) => {
                    const warrantyInfo = getWarrantyStatus(record.warranty_expiry_date);
                    return (
                      <tr key={record.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3.5 font-mono font-semibold text-slate-900">
                          <div className="flex items-center space-x-1.5">
                            <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>{formatDisplayDate(record.service_date)}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-slate-900 font-mono">
                          {record.serialNumber}
                        </td>
                        <td className="px-5 py-3.5 font-medium text-slate-800">
                          {record.companyName}
                        </td>
                        <td className="px-5 py-3.5">
                          {record.oil_type || record.quantity_liters ? (
                            <div className="flex items-center space-x-1.5">
                              <Droplet className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <div>
                                <span className="font-medium text-slate-900 block">
                                  {record.oil_type || 'Standard Oil Service'}
                                </span>
                                {record.quantity_liters && (
                                  <span className="text-[11px] text-slate-400 font-mono">
                                    {record.quantity_liters} Liters
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="italic text-slate-400">Oil change service</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 font-mono font-medium text-slate-900">
                          <div className="flex items-center space-x-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded w-fit">
                            <ShieldCheck className="w-3 h-3 shrink-0" />
                            <span>{formatDisplayDate(record.warranty_expiry_date)}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={warrantyInfo.status} />
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => navigate(`/service-records/${record.id}`)}
                              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="View Record Details"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(record)}
                              className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                              title="Edit Record"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenDeleteModal(record)}
                              className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards View */}
          <div className="md:hidden grid grid-cols-1 gap-4">
            {filteredRecords.map((record) => {
              const warrantyInfo = getWarrantyStatus(record.warranty_expiry_date);
              return (
                <div key={record.id} className="bg-white rounded-lg border border-slate-200 p-4 space-y-3 shadow-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-900 text-sm font-mono block">
                        {record.serialNumber}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">{record.companyName}</span>
                    </div>
                    <StatusBadge status={warrantyInfo.status} />
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-100 font-mono">
                    <p className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0 font-sans" />
                      <span>Service Date: {formatDisplayDate(record.service_date)}</span>
                    </p>
                    <p className="flex items-center space-x-1 text-emerald-700">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 font-sans" />
                      <span>Warranty Expiry: {formatDisplayDate(record.warranty_expiry_date)}</span>
                    </p>
                    {record.oil_type && (
                      <p className="text-slate-500 font-sans text-[11px] pt-1">
                        Oil Spec: {record.oil_type} {record.quantity_liters ? `(${record.quantity_liters} L)` : ''}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2 text-xs">
                    <button
                      onClick={() => navigate(`/service-records/${record.id}`)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded flex items-center space-x-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(record)}
                      className="px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 font-medium rounded flex items-center space-x-1 border border-amber-200"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleOpenDeleteModal(record)}
                      className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 font-medium rounded flex items-center space-x-1 border border-red-200"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Form Modal */}
      <ServiceRecordFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={handleFormSuccess}
        initialData={editingRecord}
      />

      {/* Delete Confirmation Modal */}
      <DeleteServiceRecordModal
        isOpen={isDeleteModalOpen}
        record={deletingRecord}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </AppLayout>
  );
};
