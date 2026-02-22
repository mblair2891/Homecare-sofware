import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  LayoutDashboard, Users, UserCheck, Calendar, DollarSign,
  FileText, MessageSquare, MapPin, UserPlus, BarChart3,
  Settings, Shield, BookOpen, ChevronLeft, ChevronRight,
  Bell, Search, ChevronDown, Building2
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'caregivers', label: 'Caregivers', icon: UserCheck },
  { id: 'scheduling', label: 'Scheduling & EVV', icon: Calendar },
  { id: 'billing', label: 'Billing & Payroll', icon: DollarSign },
  { id: 'hr', label: 'HR & Compliance', icon: FileText },
  { id: 'messaging', label: 'Messaging', icon: MessageSquare },
  { id: 'locations', label: 'Locations', icon: MapPin },
  { id: 'recruiting', label: 'Recruiting', icon: UserPlus },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'compliance', label: 'OR Compliance', icon: Shield },
  { id: 'policies', label: 'Policy & Procedures', icon: BookOpen },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { activeModule, setActiveModule, sidebarCollapsed, setSidebarCollapsed, activeLocation, setActiveLocation, locations } = useAppStore();
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [notifications] = useState(5);

  const locationOptions = ['All Locations', ...locations.map(l => l.name)];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`flex flex-col bg-slate-900 transition-all duration-200 ${sidebarCollapsed ? 'w-16' : 'w-60'} flex-shrink-0`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-700">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">CA</span>
          </div>
          {!sidebarCollapsed && (
            <div>
              <div className="text-white font-bold text-sm leading-tight">CareAxis</div>
              <div className="text-slate-400 text-xs">Homecare Management</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map(({ id, label, icon: Icon }) => (
            <div
              key={id}
              onClick={() => setActiveModule(id)}
              className={`sidebar-link ${activeModule === id ? 'active' : 'text-slate-400'}`}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!sidebarCollapsed && <span>{label}</span>}
            </div>
          ))}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="flex items-center justify-center h-10 border-t border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search clients, caregivers, shifts..."
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Location picker */}
            <div className="relative">
              <button
                onClick={() => setShowLocationMenu(!showLocationMenu)}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                <Building2 size={14} className="text-slate-500" />
                <span className="font-medium text-slate-700 max-w-32 truncate">{activeLocation}</span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>
              {showLocationMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                  {locationOptions.map(loc => (
                    <button
                      key={loc}
                      onClick={() => { setActiveLocation(loc); setShowLocationMenu(false); }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 ${activeLocation === loc ? 'text-blue-600 font-medium' : 'text-slate-700'}`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
              <Bell size={18} />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {notifications}
                </span>
              )}
            </button>

            {/* User */}
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">JA</span>
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-slate-700">Jennifer Adams</div>
                <div className="text-xs text-slate-400">Administrator</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
