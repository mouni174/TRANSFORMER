import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { fetchCompanies, deleteCompany } from '../services/companyService';
import { CompanyFormModal } from '../components/companies/CompanyFormModal';
import { DeleteCompanyModal } from '../components/companies/DeleteCompanyModal';
import { EmptyState } from '../components/common/EmptyState';
import { 
  Building2, 
  Search, 
  Plus, 
  ExternalLink, 
  Mail, 
  Phone, 
  Edit3, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  RefreshCw 
} from 'lucide-react';

export const CompaniesPage = () => {
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingCompany, setDeletingCompany] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Success toast message banner
  const [toastMessage, setToastMessage] = useState('');

  const loadCompaniesList = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: err } = await fetchCompanies();

      if (err) {
        setError(err.message || 'Failed to fetch companies from database.');
      } else {
        setCompanies(data || []);
      }
    } catch (e) {
      setError('An unexpected error occurred while fetching company records.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCompaniesList();
  }, [loadCompaniesList]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Handle Create / Edit Open
  const handleOpenAddModal = () => {
    setEditingCompany(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (company) => {
    setEditingCompany(company);
    setIsFormModalOpen(true);
  };

  const handleFormSuccess = (updatedItem, actionType) => {
    loadCompaniesList();
    showToast(
      actionType === 'created'
        ? `Company "${updatedItem.name}" registered successfully.`
        : `Company "${updatedItem.name}" updated successfully.`
    );
  };

  // Handle Delete
  const handleOpenDeleteModal = (company) => {
    setDeletingCompany(company);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCompany) return;

    try {
      setIsDeleting(true);
      const { error: err } = await deleteCompany(deletingCompany.id);

      if (err) {
        alert(`Deletion failed: ${err.message}`);
      } else {
        showToast(`Company "${deletingCompany.name}" deleted successfully.`);
        loadCompaniesList();
        setIsDeleteModalOpen(false);
        setDeletingCompany(null);
      }
    } catch (e) {
      alert('An error occurred while deleting the company record.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Search Filter
  const filteredCompanies = companies.filter((company) => {
    const term = searchTerm.toLowerCase();
    return (
      company.name?.toLowerCase().includes(term) ||
      company.contact_person?.toLowerCase().includes(term) ||
      company.email?.toLowerCase().includes(term) ||
      company.address?.toLowerCase().includes(term)
    );
  });

  return (
    <AppLayout pageTitle="Company Management">
      {/* Success Notification Banner */}
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
          <h2 className="text-base font-semibold text-slate-900">Client Companies</h2>
          <p className="text-xs text-slate-500">Manage client organizations and view associated transformer assets.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-md transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Company</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search company name, contact, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900"
          />
        </div>
        <div className="flex items-center justify-between md:justify-end space-x-4">
          <span className="text-xs text-slate-500 font-medium">
            Total Companies: <span className="text-slate-900 font-semibold">{companies.length}</span>
          </span>
          <button
            onClick={loadCompaniesList}
            title="Refresh Companies List"
            className="p-2 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Companies Container */}
      {loading ? (
        <div className="p-12 bg-white rounded-lg border border-slate-200 shadow-xs flex items-center justify-center">
          <div className="flex items-center space-x-3 text-slate-600">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-xs font-medium">Fetching Companies from Database...</span>
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
            onClick={loadCompaniesList}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-md inline-flex items-center space-x-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6">
          <EmptyState
            icon={Building2}
            title={searchTerm ? 'No companies matched search query.' : 'No companies added yet.'}
            description={
              searchTerm
                ? 'Try adjusting your search criteria.'
                : 'Click "Add New Company" to register your first client organization.'
            }
            actionText={searchTerm ? 'Clear Search' : 'Add New Company'}
            onAction={searchTerm ? () => setSearchTerm('') : handleOpenAddModal}
          />
        </div>
      ) : (
        <>
          {/* Desktop Table View (Hidden on mobile) */}
          <div className="hidden md:block bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <tr>
                    <th className="px-5 py-3">Company Name</th>
                    <th className="px-5 py-3">Contact Person</th>
                    <th className="px-5 py-3">Contact Details</th>
                    <th className="px-5 py-3 text-center">Transformers</th>
                    <th className="px-5 py-3">Address</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredCompanies.map((company) => (
                    <tr key={company.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-md bg-slate-100 text-slate-600 shrink-0">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block">{company.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono truncate max-w-[120px] block">
                              {company.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-900">
                        {company.contact_person || <span className="text-slate-400 italic">Not set</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="space-y-0.5 text-slate-600">
                          {company.email ? (
                            <div className="flex items-center space-x-1.5">
                              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[160px]">{company.email}</span>
                            </div>
                          ) : null}
                          {company.phone ? (
                            <div className="flex items-center space-x-1.5 text-slate-500">
                              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{company.phone}</span>
                            </div>
                          ) : null}
                          {!company.email && !company.phone && (
                            <span className="text-slate-400 italic">No contact details</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                          {company.transformerCount || 0} Units
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 max-w-xs truncate">
                        {company.address || <span className="italic text-slate-400">No address details</span>}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => navigate(`/companies/${company.id}`)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="View Company Details"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(company)}
                            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                            title="Edit Company"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(company)}
                            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete Company"
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

          {/* Mobile / Tablet Responsive Cards View (Shown on small screens) */}
          <div className="md:hidden grid grid-cols-1 gap-4">
            {filteredCompanies.map((company) => (
              <div key={company.id} className="bg-white rounded-lg border border-slate-200 p-4 space-y-3 shadow-xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-md bg-slate-100 text-slate-600 shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{company.name}</h3>
                      <p className="text-[10px] text-slate-400 font-mono">ID: {company.id}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-800 border border-slate-200 shrink-0">
                    {company.transformerCount || 0} Units
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-600 pt-1 border-t border-slate-100">
                  {company.contact_person && (
                    <p><span className="font-medium text-slate-900">Contact:</span> {company.contact_person}</p>
                  )}
                  {company.email && (
                    <p className="flex items-center space-x-1">
                      <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{company.email}</span>
                    </p>
                  )}
                  {company.phone && (
                    <p className="flex items-center space-x-1">
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{company.phone}</span>
                    </p>
                  )}
                  {company.address && (
                    <p className="text-slate-500 text-[11px] pt-1">{company.address}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2 text-xs">
                  <button
                    onClick={() => navigate(`/companies/${company.id}`)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded flex items-center space-x-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(company)}
                    className="px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 font-medium rounded flex items-center space-x-1 border border-amber-200"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleOpenDeleteModal(company)}
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

      {/* Create / Edit Form Modal */}
      <CompanyFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={handleFormSuccess}
        initialData={editingCompany}
      />

      {/* Delete Confirmation Modal */}
      <DeleteCompanyModal
        isOpen={isDeleteModalOpen}
        company={deletingCompany}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </AppLayout>
  );
};
