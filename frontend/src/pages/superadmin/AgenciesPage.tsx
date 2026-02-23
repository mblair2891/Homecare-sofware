import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import {
  Building2, Plus, Search, Users, UserCheck,
  ExternalLink, MoreHorizontal, DollarSign, CheckCircle,
} from 'lucide-react';
import AddAgencyModal, { type NewAgencyData, type AgencyPlan, type Classification } from './AddAgencyModal';

// ─── Types ────────────────────────────────────────────────────────────────────

type AgencyStatus = 'Active' | 'Trial' | 'Suspended' | 'Cancelled';

interface Agency {
  id: string;
  name: string;
  state: string;
  classification: Classification;
  plan: AgencyPlan;
  status: AgencyStatus;
  clients: number;
  caregivers: number;
  users: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  licenseNumber: string;
  licenseExpiry: string;
  licenseVerified: boolean;
  joinedDate: string;
  mrr: number;
  servicesOffered: string[];
  serviceCounties: string[];
  payerTypes: string[];
}

const MRR_BY_PLAN: Record<AgencyPlan, number> = {
  Trial: 0, Starter: 149, Professional: 299, Enterprise: 599,
};

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_AGENCIES: Agency[] = [
  {
    id: 'agency-1', name: 'Portland Home Care LLC', state: 'OR',
    classification: 'Intermediate', plan: 'Professional', status: 'Active',
    clients: 42, caregivers: 28, users: 6,
    contactName: 'Jennifer Adams', contactEmail: 'jennifer@portlandhomecare.com',
    contactPhone: '(503) 555-1000', licenseNumber: 'IHC-2021-001',
    licenseExpiry: '2025-07-01', licenseVerified: true,
    joinedDate: '2024-01-15', mrr: 299,
    servicesOffered: ['Personal Care (ADLs)', 'Homemaker Services', 'Medication Assistance'],
    serviceCounties: ['Multnomah', 'Washington', 'Clackamas'],
    payerTypes: ['Medicaid', 'Private Pay', 'Veterans (VA)'],
  },
  {
    id: 'agency-2', name: 'Eugene Care Services Inc', state: 'OR',
    classification: 'Comprehensive', plan: 'Enterprise', status: 'Active',
    clients: 31, caregivers: 19, users: 4,
    contactName: 'Michael Torres', contactEmail: 'mtorres@eugenecare.com',
    contactPhone: '(541) 555-2000', licenseNumber: 'IHC-2022-002',
    licenseExpiry: '2025-08-15', licenseVerified: true,
    joinedDate: '2024-02-01', mrr: 599,
    servicesOffered: ['Personal Care (ADLs)', 'Nursing Services (RN/LPN)', 'Medication Administration'],
    serviceCounties: ['Lane', 'Benton'],
    payerTypes: ['Medicaid', 'Private Pay'],
  },
  {
    id: 'agency-3', name: 'Salem Care Partners LLC', state: 'OR',
    classification: 'Basic', plan: 'Starter', status: 'Active',
    clients: 18, caregivers: 12, users: 3,
    contactName: 'Lisa Chang', contactEmail: 'lchang@salemcare.com',
    contactPhone: '(503) 555-3000', licenseNumber: 'IHC-2022-003',
    licenseExpiry: '2025-09-30', licenseVerified: true,
    joinedDate: '2024-03-10', mrr: 149,
    servicesOffered: ['Personal Care (ADLs)', 'Homemaker Services', 'Companionship'],
    serviceCounties: ['Marion', 'Polk'],
    payerTypes: ['Medicaid', 'Long-Term Care Insurance'],
  },
  {
    id: 'agency-4', name: 'Bend Home Health Services', state: 'OR',
    classification: 'Limited', plan: 'Trial', status: 'Trial',
    clients: 3, caregivers: 4, users: 2,
    contactName: 'David Park', contactEmail: 'dpark@bendhomehealth.com',
    contactPhone: '(541) 555-4000', licenseNumber: 'IHC-2023-004',
    licenseExpiry: '2025-12-31', licenseVerified: true,
    joinedDate: '2025-01-15', mrr: 0,
    servicesOffered: ['Personal Care (ADLs)', 'Companionship'],
    serviceCounties: ['Deschutes'],
    payerTypes: ['Private Pay'],
  },
];

// ─── Badges ───────────────────────────────────────────────────────────────────

const statusColors: Record<AgencyStatus, string> = {
  Active: 'bg-green-100 text-green-700',
  Trial: 'bg-amber-100 text-amber-700',
  Suspended: 'bg-red-100 text-red-700',
  Cancelled: 'bg-slate-100 text-slate-500',
};

const planColors: Record<AgencyPlan, string> = {
  Trial: 'bg-amber-100 text-amber-600',
  Starter: 'bg-slate-100 text-slate-600',
  Professional: 'bg-blue-100 text-blue-700',
  Enterprise: 'bg-purple-100 text-purple-700',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AgenciesPage() {
  const { enterAgency } = useAuthStore();
  const [agencies, setAgencies] = useState<Agency[]>(SEED_AGENCIES);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = agencies.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.contactName.toLowerCase().includes(search.toLowerCase()) ||
      a.contactEmail.toLowerCase().includes(search.toLowerCase()) ||
      a.licenseNumber.toLowerCase().includes(search.toLowerCase())
  );

  const totalMrr = agencies.filter((a) => a.status === 'Active').reduce((s, a) => s + a.mrr, 0);
  const totalClients = agencies.reduce((s, a) => s + a.clients, 0);
  const totalCaregivers = agencies.reduce((s, a) => s + a.caregivers, 0);
  const activeCount = agencies.filter((a) => a.status === 'Active').length;

  const handleSave = (data: NewAgencyData) => {
    const newAgency: Agency = {
      id: `agency-${Date.now()}`,
      name: data.legalName,
      state: data.state,
      classification: data.classification,
      plan: data.plan,
      status: data.plan === 'Trial' ? 'Trial' : 'Active',
      clients: 0,
      caregivers: 0,
      users: 1,
      contactName: data.adminName,
      contactEmail: data.adminEmail || data.agencyEmail,
      contactPhone: data.agencyPhone,
      licenseNumber: data.licenseNumber,
      licenseExpiry: data.licenseExpiry,
      licenseVerified: data.licenseVerified,
      joinedDate: new Date().toISOString().slice(0, 10),
      mrr: MRR_BY_PLAN[data.plan],
      servicesOffered: data.servicesOffered,
      serviceCounties: data.serviceCounties,
      payerTypes: data.payerTypes,
    };
    setAgencies((prev) => [...prev, newAgency]);
    setShowAdd(false);
  };

  const handleSuspend = (id: string) => {
    setAgencies((prev) =>
      prev.map((a) => a.id === id ? { ...a, status: a.status === 'Suspended' ? 'Active' : 'Suspended' as AgencyStatus } : a)
    );
    setOpenMenu(null);
  };

  const handleRemove = (id: string) => {
    if (window.confirm('Remove this agency? This cannot be undone.')) {
      setAgencies((prev) => prev.filter((a) => a.id !== id));
    }
    setOpenMenu(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Agencies', value: agencies.length, sub: `${activeCount} active`, icon: Building2, color: 'text-blue-600 bg-blue-50' },
          { label: 'Total Clients', value: totalClients, sub: 'across all agencies', icon: Users, color: 'text-teal-600 bg-teal-50' },
          { label: 'Total Caregivers', value: totalCaregivers, sub: 'across all agencies', icon: UserCheck, color: 'text-green-600 bg-green-50' },
          { label: 'Monthly Recurring', value: `$${totalMrr.toLocaleString()}`, sub: 'active subscriptions', icon: DollarSign, color: 'text-purple-600 bg-purple-50' },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{value}</div>
              <div className="text-sm font-medium text-slate-600">{label}</div>
              <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="relative w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, license..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={16} />
            Add Agency
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['Agency', 'License', 'Classification', 'Plan', 'Status', 'Clients', 'Caregivers', 'MRR', 'Joined', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((agency) => (
                <tr key={agency.id} className="hover:bg-slate-50 group transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{agency.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{agency.contactEmail}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs text-slate-600">{agency.licenseNumber}</span>
                      {agency.licenseVerified && <CheckCircle size={12} className="text-green-500 flex-shrink-0" title="Verified" />}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{agency.classification}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${planColors[agency.plan]}`}>
                      {agency.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[agency.status]}`}>
                      {agency.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-medium">{agency.clients}</td>
                  <td className="px-4 py-3 text-slate-600 font-medium">{agency.caregivers}</td>
                  <td className="px-4 py-3 text-slate-700 font-medium">
                    {agency.mrr > 0 ? `$${agency.mrr}/mo` : <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                    {new Date(agency.joinedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => enterAgency(agency.id, agency.name)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <ExternalLink size={12} />
                        Open
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === agency.id ? null : agency.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <MoreHorizontal size={15} />
                        </button>
                        {openMenu === agency.id && (
                          <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1">
                            <button onClick={() => { enterAgency(agency.id, agency.name); setOpenMenu(null); }} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 text-slate-700">Open Dashboard</button>
                            <button onClick={() => handleSuspend(agency.id)} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 text-slate-700">
                              {agency.status === 'Suspended' ? 'Reactivate' : 'Suspend'} Agency
                            </button>
                            <div className="border-t border-slate-100 my-1" />
                            <button onClick={() => handleRemove(agency.id)} className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-600">Remove Agency</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-5 py-12 text-center text-slate-400">No agencies found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New comprehensive modal */}
      {showAdd && (
        <AddAgencyModal onClose={() => setShowAdd(false)} onSave={handleSave} />
      )}

      {/* Close context menu on backdrop click */}
      {openMenu && <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />}
    </div>
  );
}
