import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '../layouts/AppLayout';
import { fetchServiceRecords } from '../services/serviceRecordService';
import { getWarrantyStatus, formatDisplayDate } from '../utils/warrantyUtils';
import { StatusBadge } from '../components/common/StatusBadge';
import { StatCard } from '../components/common/StatCard';
import { EmptyState } from '../components/common/EmptyState';
import { 
  ShieldAlert, 
  Clock, 
  ShieldCheck, 
  Calendar, 
  Loader2, 
  RefreshCw, 
  Search, 
  ExternalLink, 
  ArrowUpDown, 
  Droplet 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const WarrantyAlertsPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('URGENCY'); // 'URGENCY' | 'EXPIRY_ASC' | 'SERVICE_DESC' | 'COMPANY_ASC'

  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: err } = await fetchServiceRecords();

      if (err) {
        setError(err.message || 'Failed to fetch warranty records.');
      } else {
        setRecords(data || []);
      }
    } catch (e) {
      setError('An error occurred while loading warranty status.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  // Compute status for all records
  const itemsWithStatus = records.map((item) => ({
    ...item,
    warrantyInfo: getWarrantyStatus(item.warranty_expiry_date),
  }));

  // Counts
  const activeCount = itemsWithStatus.filter((i) => i.warrantyInfo.status === 'ACTIVE').length;
  const expiringSoonCount = itemsWithStatus.filter((i) => i.warrantyInfo.status === 'EXPIRING_SOON').length;
  const expiredCount = itemsWithStatus.filter((i) => i.warrantyInfo.status === 'EXPIRED').length;

  // Filter by Tab and Search
  const filteredItems = itemsWithStatus.filter((item) => {
    // Tab Filter
    if (activeTab === 'EXPIRING_SOON' && item.warrantyInfo.status !== 'EXPIRING_SOON') return false;
    if (activeTab === 'EXPIRED' && item.warrantyInfo.status !== 'EXPIRED') return false;
    if (activeTab === 'ACTIVE' && item.warrantyInfo.status !== 'ACTIVE') return false;

    // Search Filter
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.serialNumber?.toLowerCase().includes(term) ||
      item.companyName?.toLowerCase().includes(term) ||
      item.oil_type?.toLowerCase().includes(term)
    );
  });

  // Sorting Logic
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'URGENCY') {
      // Priority: Expiring Soon (1) -> Expired (2) -> Active (3)
      const priorityOrder = { EXPIRING_SOON: 1, EXPIRED: 2, ACTIVE: 3, NO_WARRANTY: 4, INVALID: 5 };
      const prioA = priorityOrder[a.warrantyInfo.status] || 99;
      const prioB = priorityOrder[b.warrantyInfo.status] || 99;

      if (prioA !== prioB) return prioA - prioB;
      // Secondary sort: earliest expiry date first
      return (a.warranty_expiry_date || '').localeCompare(b.warranty_expiry_date || '');
    }
    if (sortBy === 'EXPIRY_ASC') {
      return (a.warranty_expiry_date || '').localeCompare(b.warranty_expiry_date || '');
    }
    if (sortBy === 'SERVICE_DESC') {
      return (b.service_date || '').localeCompare(a.service_date || '');
    }
    if (sortBy === 'COMPANY_ASC') {
      return (a.companyName || '').localeCompare(b.companyName || '');
    }
    return 0;
  });

  // Dynamic Empty State message
  const getEmptyStateDetails = () => {
    if (records.length === 0) {
      return {
        title: 'No warranty records available yet.',
        description: 'Oil service records logged in the system will appear here with calculated 1-year warranties.',
      };
    }
    if (activeTab === 'EXPIRING_SOON') {
      return {
        title: 'No warranties are expiring soon.',
        description: 'There are currently no transformer oil warranties expiring within the next 30 days.',
      };
    }
    if (activeTab === 'EXPIRED') {
      return {
        title: 'No expired warranties.',
        description: 'There are currently no expired transformer oil warranties.',
      };
    }
    if (activeTab === 'ACTIVE') {
      return {
        title: 'No active warranties.',
        description: 'There are currently no active transformer oil warranties.',
      };
    }
    return {
      title: 'No matching warranty records.',
      description: 'Try adjusting your search criteria.',
    };
  };

  return (
    <AppLayout pageTitle="Warranty Alerts">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Warranty Expiry Tracker</h2>
          <p className="text-xs text-slate-500">
            Monitor transformer service warranties that are active, expiring soon, or expired.
          </p>
        </div>
        <button
          onClick={loadAlerts}
          title="Refresh Alerts"
          className="p-2 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Active Warranties"
          value={activeCount}
          icon={ShieldCheck}
          description="Valid >30 days or expiring today"
          badgeText="Active"
          badgeType="success"
        />
        <StatCard
          title="Expiring Soon"
          value={expiringSoonCount}
          icon={Clock}
          description="Expiring within 30 days"
          badgeText="Attention"
          badgeType="warning"
        />
        <StatCard
          title="Expired Warranties"
          value={expiredCount}
          icon={ShieldAlert}
          description="Warranty period ended"
          badgeText="Expired"
          badgeType="danger"
        />
      </div>

      {/* Search, Sort, and Filter Controls */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search company, transformer serial, oil type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center space-x-2 text-xs">
          <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-slate-500 font-medium shrink-0">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="URGENCY">Priority / Urgency (Default)</option>
            <option value="EXPIRY_ASC">Expiry Date (Earliest First)</option>
            <option value="SERVICE_DESC">Service Date (Latest First)</option>
            <option value="COMPANY_ASC">Company Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-slate-200 flex space-x-6 text-xs font-medium text-slate-500 overflow-x-auto">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'ALL'
              ? 'border-slate-900 text-slate-900 font-semibold'
              : 'border-transparent hover:text-slate-700'
          }`}
        >
          <span>All Warranties ({records.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('EXPIRING_SOON')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'EXPIRING_SOON'
              ? 'border-amber-500 text-amber-600 font-semibold'
              : 'border-transparent hover:text-slate-700'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Expiring Soon (&lt;30 Days)</span>
          <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px]">
            {expiringSoonCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('EXPIRED')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'EXPIRED'
              ? 'border-red-500 text-red-600 font-semibold'
              : 'border-transparent hover:text-slate-700'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Expired Warranties</span>
          <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px]">
            {expiredCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ACTIVE')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'ACTIVE'
              ? 'border-emerald-500 text-emerald-600 font-semibold'
              : 'border-transparent hover:text-slate-700'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Active Warranties</span>
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
            {activeCount}
          </span>
        </button>
      </div>

      {/* Main Table / Cards View */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>Evaluating service record warranty statuses...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 text-xs font-medium space-y-3">
            <p>{error}</p>
            <button
              onClick={loadAlerts}
              className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-medium"
            >
              Retry
            </button>
          </div>
        ) : sortedItems.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <tr>
                    <th className="px-5 py-3">Transformer Serial</th>
                    <th className="px-5 py-3">Owner Company</th>
                    <th className="px-5 py-3">Service Date</th>
                    <th className="px-5 py-3">Warranty Expiry</th>
                    <th className="px-5 py-3">Remaining / Expired</th>
                    <th className="px-5 py-3">Warranty Status</th>
                    <th className="px-5 py-3 text-right">Service Record</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {sortedItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-slate-900 font-mono">
                        {item.serialNumber}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-900">
                        {item.companyName}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-600">
                        {formatDisplayDate(item.service_date)}
                      </td>
                      <td className="px-5 py-3.5 font-mono font-medium text-slate-900">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{formatDisplayDate(item.warranty_expiry_date)}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-medium">
                        <span
                          className={`text-xs ${
                            item.warrantyInfo.status === 'EXPIRED'
                              ? 'text-red-600 font-semibold'
                              : item.warrantyInfo.status === 'EXPIRING_SOON'
                              ? 'text-amber-600 font-semibold'
                              : 'text-emerald-700 font-medium'
                          }`}
                        >
                          {item.warrantyInfo.daysText}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={item.warrantyInfo.status} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          to={`/service-records/${item.id}`}
                          className="px-2.5 py-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded font-medium inline-flex items-center space-x-1 border border-slate-200 transition-colors"
                        >
                          <span>View Record</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {sortedItems.map((item) => (
                <div key={item.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-900 font-mono text-sm block">
                        {item.serialNumber}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">{item.companyName}</span>
                    </div>
                    <StatusBadge status={item.warrantyInfo.status} />
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 font-mono pt-1">
                    <p className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0 font-sans" />
                      <span>Service Date: {formatDisplayDate(item.service_date)}</span>
                    </p>
                    <p className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0 font-sans" />
                      <span>Warranty Expiry: {formatDisplayDate(item.warranty_expiry_date)}</span>
                    </p>
                    <p
                      className={`font-semibold font-sans text-xs ${
                        item.warrantyInfo.status === 'EXPIRED'
                          ? 'text-red-600'
                          : item.warrantyInfo.status === 'EXPIRING_SOON'
                          ? 'text-amber-600'
                          : 'text-emerald-700'
                      }`}
                    >
                      {item.warrantyInfo.daysText}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                    <Link
                      to={`/service-records/${item.id}`}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded flex items-center space-x-1"
                    >
                      <span>View Service Record</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="p-6">
            <EmptyState
              icon={ShieldAlert}
              title={getEmptyStateDetails().title}
              description={getEmptyStateDetails().description}
            />
          </div>
        )}
      </div>
    </AppLayout>
  );
};
