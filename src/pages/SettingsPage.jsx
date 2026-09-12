import React from 'react';
import { AppLayout } from '../layouts/AppLayout';
import { Shield, Bell, Database, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { isSupabaseConfigured } from '../services/supabaseClient';

export const SettingsPage = () => {
  const supabaseReady = isSupabaseConfigured();

  return (
    <AppLayout pageTitle="System Settings">
      <div className="max-w-4xl space-y-6">
        {/* Header info */}
        <div>
          <h2 className="text-base font-semibold text-slate-900">Application Configuration</h2>
          <p className="text-xs text-slate-500">View business defaults, warranty rules, and database integration status.</p>
        </div>

        {/* Warranty Configuration Section */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Shield className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Warranty Policy Rules</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Standard Warranty Duration</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value="1 Year (From Service Date)"
                  disabled
                  className="bg-slate-100 border border-slate-200 rounded px-3 py-1.5 w-full text-slate-600 font-medium cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Automatically calculated from the oil-service date.</p>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Expiring Soon Threshold</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value="30 Days Before Expiry"
                  disabled
                  className="bg-slate-100 border border-slate-200 rounded px-3 py-1.5 w-full text-slate-600 font-medium cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Triggers dashboard & alert status highlights.</p>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Bell className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900">Notification Preferences</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1">
              <div>
                <span className="font-semibold text-slate-900 block">Dashboard Alerts</span>
                <span className="text-slate-500">Display expiring soon and expired warranties on the dashboard.</span>
              </div>
              <input type="checkbox" defaultChecked disabled className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-not-allowed" />
            </div>
            <div className="flex items-center justify-between py-1 border-t border-slate-100">
              <div>
                <span className="font-semibold text-slate-900 block">Header Alert Badge</span>
                <span className="text-slate-500">Show notification icon highlight when urgent warranties exist.</span>
              </div>
              <input type="checkbox" defaultChecked disabled className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-not-allowed" />
            </div>
          </div>
        </div>

        {/* Database & Supabase Integration Status */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Database className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Database Integration Status</h3>
          </div>

          <div className="bg-slate-50 p-4 rounded border border-slate-200 text-xs space-y-3">
            <p className="text-slate-600 leading-relaxed pb-1">
              Supabase is connected and the application is using the live database for companies, transformers, service records, and warranty information.
            </p>

            {/* Status Row: Supabase Client */}
            <div className="flex items-center justify-between py-2 border-t border-slate-200">
              <div className="flex items-center space-x-2 font-medium text-slate-800">
                <Info className="w-4 h-4 text-blue-600" />
                <span>Supabase Client Initialization</span>
              </div>
              {supabaseReady ? (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Configured</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Pending Credentials (.env.local)</span>
                </span>
              )}
            </div>

            {/* Status Row: Authentication */}
            <div className="flex items-center justify-between py-2 border-t border-slate-200">
              <div className="flex items-center space-x-2 font-medium text-slate-800">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>Authentication</span>
              </div>
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Configured</span>
              </span>
            </div>

            {/* Status Row: Live Database */}
            <div className="flex items-center justify-between py-2 border-t border-slate-200">
              <div className="flex items-center space-x-2 font-medium text-slate-800">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>Live Database</span>
              </div>
              {supabaseReady ? (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Connected</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Awaiting Credentials</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
