import React, { useState } from 'react';
import {
  X, Building2, Users, UserPlus, Mail, Phone, MapPin,
  Calendar, CheckCircle, AlertTriangle, Loader, Shield,
} from 'lucide-react';
import { useAuthStore, type UserRole, type ManagedUser } from '../../store/useAuthStore';
import type { Company } from '../../store/usePlatformStore';
import { api } from '../../lib/api';

type ManageTab = 'overview' | 'users';

const ROLES: { value: UserRole; label: string; description: string }[] = [
  { value: 'Owner', label: 'Owner', description: 'Full access + billing + user management' },
  { value: 'Administrator', label: 'Administrator', description: 'Full access to all agency modules' },
  { value: 'Coordinator', label: 'Coordinator', description: 'Scheduling, clients, caregivers' },
  { value: 'Nurse', label: 'Nurse (RN/LPN)', description: 'Clinical forms, assessments, medication' },
  { value: 'Biller', label: 'Biller', description: 'Billing, invoices, payroll' },
  { value: 'ReadOnly', label: 'Read Only', description: 'View-only access across modules' },
];

// ─── Add User Form (inline, not a sub-modal) ───────────────────────────────

function InlineAddUser({ company, onUserCreated, onCancel }: {
  company: Company;
  onUserCreated: (user: ManagedUser, tempPassword: string) => void;
  onCancel: () => void;
}) {
  const agencyId = company.agencies[0]?.id || company.id;
  const agencyName = company.companyName;
  const [form, setForm] = useState({ name: '', email: '', role: 'Coordinator' as UserRole });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ email: string; tempPassword: string } | null>(null);

  const handleSubmit = async () => {
    setError('');
    if (!form.name.trim() || !form.email.trim()) { setError('Name and email are required.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('Please enter a valid email address.'); return; }

    setSubmitting(true);
    try {
      const res = await api.post('/api/users', { name: form.name.trim(), email: form.email.trim().toLowerCase(), role: form.role, location: 'All', agencyId, agencyName });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');

      const managedUser: ManagedUser = {
        id: data.user.id, name: data.user.name, email: data.user.email,
        role: data.user.role as UserRole, agencyId, agencyName,
        mustChangePassword: true, password: data.tempPassword,
        location: 'All', status: 'Active', createdAt: new Date().toISOString().slice(0, 10),
      };
      setSuccess({ email: data.user.email, tempPassword: data.tempPassword });
      onUserCreated(managedUser, data.tempPassword);
    } catch (err: any) {
      setError(err.message || 'Failed to create user.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="border border-green-200 bg-green-50 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle size={16} className="text-green-600" />
          <p className="text-sm font-semibold text-green-800">User created — welcome email sent to {success.email}</p>
        </div>
        <div className="bg-white border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-slate-500">Email</span>
            <span className="font-medium text-slate-800">{success.email}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Temp Password</span>
            <code className="font-bold text-slate-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{success.tempPassword}</code>
          </div>
        </div>
        <div className="flex items-start gap-2 text-xs text-amber-700">
          <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
          Save these credentials — the temp password will not be shown again.
        </div>
        <button onClick={onCancel} className="btn-secondary text-sm w-full py-1.5">Done</button>
      </div>
    );
  }

  return (
    <div className="border border-blue-200 bg-blue-50/50 rounded-lg p-4 space-y-3">
      <h4 className="text-sm font-semibold text-slate-700">New User for {agencyName}</h4>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-medium text-slate-500">Full Name *</label>
          <input className="form-input text-sm mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Smith" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500">Email *</label>
          <input type="email" className="form-input text-sm mt-1" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@agency.com" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500">Role *</label>
          <select className="form-input text-sm mt-1" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}>
            {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
      </div>
      <p className="text-xs text-slate-400 flex items-center gap-1"><Mail size={10} /> A welcome email with login credentials will be sent automatically</p>
      {error && <p className="text-xs text-red-600 flex items-center gap-1"><AlertTriangle size={12} /> {error}</p>}
      <div className="flex gap-2">
        <button onClick={onCancel} className="btn-secondary text-sm py-1.5 px-4">Cancel</button>
        <button onClick={handleSubmit} disabled={submitting} className="btn-primary text-sm py-1.5 px-4 flex items-center gap-2">
          {submitting ? <><Loader size={12} className="animate-spin" /> Creating...</> : <><UserPlus size={12} /> Create & Send Email</>}
        </button>
      </div>
    </div>
  );
}

// ─── Main Modal ─────────────────────────────────────────────────────────────

export default function CompanyManageModal({ company, onClose }: { company: Company; onClose: () => void }) {
  const [tab, setTab] = useState<ManageTab>('users');
  const [showAddUser, setShowAddUser] = useState(false);
  const { managedUsers, addManagedUser } = useAuthStore();

  // Get all agencies for this company
  const agencyIds = company.agencies.map((a) => a.id);
  const companyUsers = managedUsers.filter((u) =>
    u.role !== 'SuperAdmin' && u.agencyId && agencyIds.includes(u.agencyId)
  );

  const agency = company.agencies[0];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">{company.companyName}</h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{company.primaryContactEmail}</span>
                <span>·</span>
                <span>{company.agencies.length} {company.agencies.length === 1 ? 'agency' : 'agencies'}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-3 border-b border-slate-100 flex-shrink-0">
          {([['overview', 'Overview', Building2], ['users', 'Users', Users]] as [ManageTab, string, React.ElementType][]).map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon size={14} /> {label}
              {id === 'users' && <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-semibold ${companyUsers.length > 0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>{companyUsers.length}</span>}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* OVERVIEW TAB */}
          {tab === 'overview' && (
            <div className="space-y-6">
              {/* Company Info */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-700">Company Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2"><Building2 size={14} className="text-slate-400 mt-0.5" /><div><div className="font-medium text-slate-700">{company.companyName}</div><div className="text-xs text-slate-400">Plan: {company.plan} · {company.billingCycle}</div></div></div>
                    <div className="flex items-center gap-2"><Mail size={14} className="text-slate-400" /><span className="text-slate-600">{company.primaryContactEmail}</span></div>
                    <div className="flex items-center gap-2"><Phone size={14} className="text-slate-400" /><span className="text-slate-600">{company.primaryContactPhone}</span></div>
                    <div className="flex items-center gap-2"><Calendar size={14} className="text-slate-400" /><span className="text-slate-600">Joined {new Date(company.joinedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-700">Primary Contact</h3>
                  <div className="space-y-2 text-sm">
                    <div className="font-medium text-slate-700">{company.primaryContactName}</div>
                    <div className="text-slate-600">{company.primaryContactEmail}</div>
                    <div className="text-slate-600">{company.primaryContactPhone}</div>
                  </div>
                </div>
              </div>

              {/* Agencies */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Agencies</h3>
                <div className="space-y-2">
                  {company.agencies.map((ag) => (
                    <div key={ag.id} className="border border-slate-200 rounded-lg p-4 flex items-start justify-between">
                      <div>
                        <div className="font-medium text-slate-800">{ag.name}</div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                          <MapPin size={11} /> {ag.physicalCity}, {ag.physicalState} {ag.physicalZip}
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs">
                          <span className="font-mono text-slate-500">{ag.licenseNumber}</span>
                          {ag.licenseVerified && <span className="flex items-center gap-1 text-green-600"><CheckCircle size={11} /> Verified</span>}
                          <span className="text-slate-400">{ag.classification}</span>
                        </div>
                      </div>
                      <div className="text-right text-xs text-slate-500">
                        <div>{ag.clients} clients</div>
                        <div>{ag.caregivers} caregivers</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {tab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-700">User Accounts</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {companyUsers.length} user{companyUsers.length !== 1 ? 's' : ''} for {company.companyName}
                  </p>
                </div>
                {!showAddUser && (
                  <button
                    onClick={() => setShowAddUser(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <UserPlus size={14} /> Add User
                  </button>
                )}
              </div>

              {/* Add User Form */}
              {showAddUser && (
                <InlineAddUser
                  company={company}
                  onUserCreated={(user, tempPw) => {
                    addManagedUser(user);
                  }}
                  onCancel={() => setShowAddUser(false)}
                />
              )}

              {/* Users Table */}
              {companyUsers.length === 0 && !showAddUser ? (
                <div className="border border-dashed border-slate-200 rounded-lg p-10 text-center">
                  <Users size={32} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-sm font-medium text-slate-500">No user accounts yet</p>
                  <p className="text-xs text-slate-400 mt-1">Create user logins for this business. Each user will receive an email with their credentials.</p>
                  <button
                    onClick={() => setShowAddUser(true)}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <UserPlus size={14} /> Create First User
                  </button>
                </div>
              ) : companyUsers.length > 0 && (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        {['User', 'Role', 'Agency', 'Status', 'Created'].map((h) => (
                          <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {companyUsers.map((user) => (
                        <tr key={user.email} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-800">{user.name}</div>
                            <div className="text-xs text-slate-400">{user.email}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                              user.role === 'Owner' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                            }`}>{user.role}</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500">{user.agencyName || company.companyName}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                              user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                            }`}>{user.status}</span>
                            {user.mustChangePassword && (
                              <span className="ml-2 text-xs text-amber-600 font-medium">Pending</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-400">{user.createdAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
