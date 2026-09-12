import React, { useEffect, useState } from 'react';
import { AppLayout } from '../layouts/AppLayout';
import { StatCard } from '../components/common/StatCard';
import { ExpiringWarrantiesWidget } from '../components/dashboard/ExpiringWarrantiesWidget';
import { RecentServiceWidget } from '../components/dashboard/RecentServiceWidget';
import { fetchServiceRecords } from '../services/serviceRecordService';
import { getWarrantyStatus } from '../utils/warrantyUtils';
import { Building2, Zap, ShieldCheck, Clock, ShieldAlert, Plus, Wrench } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

export const DashboardPage = () => {
  const navigate = useNavigate();

  const [realCompanyCount, setRealCompanyCount] = useState(0);
  const [realTransformerCount, setRealTransformerCount] = useState(0);

  const [serviceStats, setServiceStats] = useState({
    totalRecords: 0,
    activeWarranties: 0,
    expiringSoon: 0,
    expiredWarranties: 0,
  });

  useEffect(() => {
    const fetchAllDashboardData = async () => {
      try {
        // 1. Fetch Real Companies Count
        const { count: companyCount } = await supabase
          .from('companies')
          .select('*', { count: 'exact', head: true });
        if (companyCount !== null) {
          setRealCompanyCount(companyCount);
        }

        // 2. Fetch Real Transformers Count
        const { count: transformerCount } = await supabase
          .from('transformers')
          .select('*', { count: 'exact', head: true });
        if (transformerCount !== null) {
          setRealTransformerCount(transformerCount);
        }

        // 3. Fetch Real Service Records and Calculate Warranty Statuses
        const { data: records } = await fetchServiceRecords();
        if (records) {
          let active = 0;
          let expiring = 0;
          let expired = 0;

          records.forEach((rec) => {
            const statusInfo = getWarrantyStatus(rec.warranty_expiry_date);
            if (statusInfo.status === 'ACTIVE') active++;
            else if (statusInfo.status === 'EXPIRING_SOON') expiring++;
            else if (statusInfo.status === 'EXPIRED') expired++;
          });

          setServiceStats({
            totalRecords: records.length,
            activeWarranties: active,
            expiringSoon: expiring,
            expiredWarranties: expired,
          });
        }
      } catch (err) {
        console.error('Error fetching dashboard metrics:', err);
      }
    };

    fetchAllDashboardData();
  }, []);

  return (
    <AppLayout pageTitle="Dashboard Overview">
      {/* Top Banner / Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-5 rounded-lg shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-white">Transformer Oil Service & Warranty System</h2>
          <p className="text-xs text-slate-300 mt-1">
            Manage client company transformers, record oil change services, and track 1-year warranties.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => navigate('/companies')}
            className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white rounded-md flex items-center space-x-1 transition-colors border border-slate-700"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Company</span>
          </button>
          <button
            onClick={() => navigate('/transformers')}
            className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white rounded-md flex items-center space-x-1 transition-colors border border-slate-700"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Transformer</span>
          </button>
          <button
            onClick={() => navigate('/service-records')}
            className="px-3.5 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center space-x-1.5 transition-colors shadow-xs"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Log Oil Service</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Companies"
          value={realCompanyCount}
          icon={Building2}
          description="Registered client companies"
          badgeText="Companies"
          badgeType="neutral"
        />
        <StatCard
          title="Total Transformers"
          value={realTransformerCount}
          icon={Zap}
          description="Registered transformer units"
          badgeText="Units"
          badgeType="neutral"
        />
        <StatCard
          title="Active Warranties"
          value={serviceStats.activeWarranties}
          icon={ShieldCheck}
          description="Valid 1-year oil warranties"
          badgeText="Active"
          badgeType="success"
        />
        <StatCard
          title="Expiring Soon"
          value={serviceStats.expiringSoon}
          icon={Clock}
          description="Expiring within 30 days"
          badgeText="Expiring Soon"
          badgeType="warning"
        />
        <StatCard
          title="Expired Warranties"
          value={serviceStats.expiredWarranties}
          icon={ShieldAlert}
          description="Warranty period ended"
          badgeText="Expired"
          badgeType="danger"
        />
      </div>

      {/* Main Dashboard Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpiringWarrantiesWidget />
        <RecentServiceWidget />
      </div>
    </AppLayout>
  );
};
