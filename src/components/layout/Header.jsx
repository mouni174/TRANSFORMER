import React from 'react';
import { Menu, Search, Bell, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Header = ({ onMobileMenuOpen, title }) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-10 shadow-xs">
      <div className="flex items-center space-x-4">
        {/* Mobile menu toggle */}
        <button
          onClick={onMobileMenuOpen}
          className="md:hidden p-2 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none"
          aria-label="Open Mobile Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold text-slate-800 tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center space-x-3">
        {/* Search placeholder */}
        <div className="hidden sm:flex items-center relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          <input
            type="text"
            placeholder="Search companies, transformers..."
            className="pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md w-56 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 placeholder-slate-400 transition-all"
            readOnly
          />
        </div>

        {/* Notification Bell Badge */}
        <div className="relative">
          <button 
            className="p-2 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 relative focus:outline-none"
            title="In-app Warranty Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white"></span>
          </button>
        </div>

        <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

        {/* User Account Info */}
        <div className="flex items-center space-x-2">
          <div className="hidden lg:flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-900 truncate max-w-[140px]">
              {user?.email || 'Authenticated User'}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Service Provider</span>
          </div>

          <button
            onClick={logout}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-700 hover:text-red-700 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
