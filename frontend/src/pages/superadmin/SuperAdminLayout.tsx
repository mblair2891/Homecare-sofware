import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import AgenciesPage from './AgenciesPage';
import PlatformAnalyticsPage from './PlatformAnalyticsPage';
import {
  Shield, Building2, BarChart3, Settings, LogOut,
  ChevronDown, Bell
} from 'lucide-react';

type AdminSection = 'agencies' | 'analytics' | 'settings';

const navItems: { id: AdminSection; label: string; icon: React.ElementType }[] = [
  { id: 'agencies', label: 'Agencies', icon: Building2 },
  { id: 'analytics', label: 'Platform Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Platform Settings', icon: Settings },
];

export default function SuperAdminLayout() {
  const { user, logout } = useAuthStore();
  const [section, setSection] = useState<AdminSection>('agencies');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const initials = user?.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? 'PA';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="flex flex-col w-60 bg-slate-900 flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">CareAxis</div>
            <div className="text-xs font-medium text-blue-400 mt-0.5">Platform Admin</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSection(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                section === id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Icon size={18} className="flex-shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-slate-700">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">{initials}</span>
            </div>
            <div className="flex-1 text-left">
              <div className="text-white text-sm font-medium leading-tight">{user?.name}</div>
              <div className="text-slate-400 text-xs">{user?.email}</div>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>
          {showUserMenu && (
            <div className="mt-1 rounded-lg overflow-hidden border border-slate-700 bg-slate-800">
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <LogOut size={15} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-lg font-semibold text-slate-800">
              {navItems.find((n) => n.id === section)?.label}
            </h1>
            <p className="text-xs text-slate-400">CareAxis Platform Administration</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
              <Bell size={18} />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {section === 'agencies' && <AgenciesPage />}
          {section === 'analytics' && <PlatformAnalyticsPage />}
          {section === 'settings' && <PlatformSettingsPlaceholder />}
        </main>
      </div>
    </div>
  );
}

function PlatformSettingsPlaceholder() {
  return (
    <div className="p-8 flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Settings size={28} className="text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700">Platform Settings</h3>
        <p className="text-slate-400 text-sm mt-1">Billing plans, integrations, and platform configuration</p>
        <div className="mt-4 text-xs text-slate-400 bg-slate-50 rounded-lg px-4 py-2 inline-block">Coming soon</div>
      </div>
    </div>
  );
}
