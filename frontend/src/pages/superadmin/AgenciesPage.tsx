import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import {
  Building2, Plus, Search, Users, UserCheck,
  ExternalLink, MoreHorizontal, TrendingUp, DollarSign,
  X, ChevronDown
} from 'lucide-react';

type AgencyStatus = 'Active' | 'Trial' | 'Suspended' | 'Cancelled';
type AgencyPlan = 'Starter' | 'Professional' | 'Enterprise' | 'Trial';
type Classification = 'Limited' | 'Basic' | 'Intermediate' | 'Comprehensive';

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
  joinedDate: string;
  mrr: number;
}

const SEED_AGENCIES: Agency[] = [
  {
    id: 'agency-1', name: 'Portland Home Care', state: 'OR',
    classification: 'Intermediate', plan: 'Professional', status: 'Active',
    clients: 42, caregivers: 28, users: 6,
    contactName: 'Jennifer Adams', contactEmail: 'jennifer@portlandhomecare.com',
    contactPhone: '(503) 555-1000', licenseNumber: 'IHC-2024-001',
    licenseExpiry: '2025-07-01', joinedDate: '2024-01-15', mrr: 299,
  },
  {
    id: 'agency-2', name: 'Eugene Care Services', state: 'OR',
    classification: 'Comprehensive', plan: 'Enterprise', status: 'Active',
    clients: 31, caregivers: 19, users: 4,
    contactName: 'Michael Torres', contactEmail: 'mtorres@eugenecare.com',
    contactPhone: '(541) 555-2000', licenseNumber: 'IHC-2024-002',
    licenseExpiry: '2025-08-15', joinedDate: '2024-02-01', mrr: 599,
  },
  {
    id: 'agency-3', name: 'Salem Care Partners', state: 'OR',
    classification: 'Basic', plan: 'Starter', status: 'Active',
    clients: 18, caregivers: 12, users: 3,
    contactName: 'Lisa Chang', contactEmail: 'lchang@salemcare.com',
    contactPhone: '(503) 555-3000', licenseNumber: 'IHC-2024-003',
    licenseExpiry: '2025-09-30', joinedDate: '2024-03-10', mrr: 149,
  },
  {
    id: 'agency-4', name: 'Bend Home Health', state: 'OR',
    classification: 'Limited', plan: 'Trial', status: 'Trial',
    clients: 3, caregivers: 4, users: 2,
    contactName: 'David Park', contactEmail: 'dpark@bendhomehealth.com',
    contactPhone: '(541) 555-4000', licenseNumber: 'IHC-2024-004',
    licenseExpiry: '2025-12-31', joinedDate: '2025-12-01', mrr: 0,
  },
];

const statusColors: Record<AgencyStatus, string> = {
  Active: 'bg-green-100 text-green-700',
  Trial: 'bg-amber-100 text-amber-700',
  Suspended: 'bg-red-100 text-red-700',
  Cancelled: 'bg-slate-100 text-slate-500',
};

const planColors: Record<AgencyPlan, string> = {
  Starter: 'bg-slate-100 text-slate-600',
  Professional: 'bg-blue-100 text-blue-700',
  Enterprise: 'bg-purple-100 text-purple-700',
  Trial: 'bg-amber-100 text-amber-600',
};

interface AddAgencyForm {
  name: string;
  state: string;
  classification: Classification;
  plan: AgencyPlan;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  licenseNumber: string;
  licenseExpiry: string;
}

const emptyForm: AddAgencyForm = {
  name: '', state: 'OR', classification: 'Basic', plan: 'Trial',
  contactName: '', contactEmail: '', contactPhone: '',
  licenseNumber: '', licenseExpiry: '',
};

export default function AgenciesPage() {
  const { enterAgency } = useAuthStore();
  const [agencies, setAgencies] = useState<Agency[]>(SEED_AGENCIES);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<AddAgencyForm>(emptyForm);
  const [formError, setFormError] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = agencies.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.contactName.toLowerCase().includes(search.toLowerCase()) ||
      a.contactEmail.toLowerCase().includes(search.toLowerCase())
  );

  const totalMrr = agencies.filter((a) => a.status === 'Active').reduce((s, a) => s + a.mrr, 0);
  const totalClients = agencies.reduce((s, a) => s + a.clients, 0);
  const totalCaregivers = agencies.reduce((s, a) => s + a.caregivers, 0);
  const activeCount = agencies.filter((a) => a.status === 'Active').length;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.contactName || !form.contactEmail) {
      setFormError('Please fill in all required fields.');
      return;
    }
    const newAgency: Agency = {
      id: `agency-${Date.now()}`,
      ...form,
      status: 'Trial',
      clients: 0,
      caregivers: 0,
      users: 1,
      mrr: 0,
      joinedDate: new Date().toISOString().slice(0, 10),
    };
    setAgencies((prev) => [...prev, newAgency]);
    setForm(emptyForm);
    setFormError('');
    setShowAdd(false);
  };

  const handleSuspend = (id: string) => {
    setAgencies((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: a.status === 'Suspended' ? 'Active' : 'Suspended' } : a
      )
    );
    setOpenMenu(null);
  };

  const handleDelete = (id: string) => {
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
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="relative w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search agencies..."
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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['Agency', 'Classification', 'Plan', 'Status', 'Clients', 'Caregivers', 'MRR', 'Joined', ''].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((agency) => (
                <tr key={agency.id} className="hover:bg-slate-50 group transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-slate-800">{agency.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{agency.contactEmail}</div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{agency.classification}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${planColors[agency.plan]}`}>
                      {agency.plan}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[agency.status]}`}>
                      {agency.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 font-medium">{agency.clients}</td>
                  <td className="px-5 py-3.5 text-slate-600 font-medium">{agency.caregivers}</td>
                  <td className="px-5 py-3.5 text-slate-700 font-medium">
                    {agency.mrr > 0 ? `$${agency.mrr}/mo` : <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs">
                    {new Date(agency.joinedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => enterAgency(agency.id, agency.name)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <ExternalLink size={13} />
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
                            <button
                              onClick={() => enterAgency(agency.id, agency.name)}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 text-slate-700"
                            >
                              Open Dashboard
                            </button>
                            <button
                              onClick={() => handleSuspend(agency.id)}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 text-slate-700"
                            >
                              {agency.status === 'Suspended' ? 'Reactivate' : 'Suspend'} Agency
                            </button>
                            <div className="border-t border-slate-100 my-1" />
                            <button
                              onClick={() => handleDelete(agency.id)}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-600"
                            >
                              Remove Agency
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-slate-400">
                    No agencies found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Agency Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800">Add New Agency</h2>
              <button onClick={() => { setShowAdd(false); setForm(emptyForm); setFormError(''); }} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">{formError}</div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Agency Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Portland Home Care"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                  <input
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="OR"
                    maxLength={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Classification</label>
                  <div className="relative">
                    <select
                      value={form.classification}
                      onChange={(e) => setForm({ ...form, classification: e.target.value as Classification })}
                      className="w-full px-3 py-2 pr-8 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                    >
                      <option>Limited</option>
                      <option>Basic</option>
                      <option>Intermediate</option>
                      <option>Comprehensive</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Plan</label>
                  <div className="relative">
                    <select
                      value={form.plan}
                      onChange={(e) => setForm({ ...form, plan: e.target.value as AgencyPlan })}
                      className="w-full px-3 py-2 pr-8 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                    >
                      <option>Trial</option>
                      <option>Starter</option>
                      <option>Professional</option>
                      <option>Enterprise</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">License Number</label>
                  <input
                    value={form.licenseNumber}
                    onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="IHC-2025-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">License Expiry</label>
                  <input
                    type="date"
                    value={form.licenseExpiry}
                    onChange={(e) => setForm({ ...form, licenseExpiry: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2 border-t border-slate-100 pt-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Primary Contact</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contact Name *</label>
                  <input
                    required
                    value={form.contactName}
                    onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Jane Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contact Phone</label>
                  <input
                    value={form.contactPhone}
                    onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="(503) 555-0000"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contact Email *</label>
                  <input
                    type="email"
                    required
                    value={form.contactEmail}
                    onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="admin@agency.com"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAdd(false); setForm(emptyForm); setFormError(''); }}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Create Agency
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close menu on backdrop click */}
      {openMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
      )}
    </div>
  );
}
