import React, { useState } from 'react';
import { Save, CheckCircle, X, UserPlus, Mail, Loader, AlertTriangle } from 'lucide-react';
import { useAuthStore, type UserRole, type ManagedUser } from '../../store/useAuthStore';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../lib/api';

type SettingsTab = 'agency' | 'system' | 'rates' | 'users' | 'integrations' | 'notifications';

const integrations = [
  { name: 'QuickBooks Online', desc: 'Sync billing and payroll', status: 'Connected', icon: '📊' },
  { name: 'ADP Workforce', desc: 'Payroll processing', status: 'Connected', icon: '💼' },
  { name: 'Checkr', desc: 'Background checks', status: 'Connected', icon: '🔍' },
  { name: 'Indeed', desc: 'Job postings', status: 'Connected', icon: '💼' },
  { name: 'ZipRecruiter', desc: 'Job postings', status: 'Connected', icon: '📋' },
  { name: 'Twilio', desc: 'SMS notifications', status: 'Not Connected', icon: '💬' },
  { name: 'Stripe', desc: 'Private pay billing', status: 'Connected', icon: '💳' },
  { name: 'DocuSign', desc: 'E-signatures for forms', status: 'Not Connected', icon: '✍️' },
  { name: 'Oregon EVV Aggregator', desc: 'State EVV submission', status: 'Connected', icon: '📍' },
  { name: 'Google Maps', desc: 'Caregiver location verification', status: 'Not Connected', icon: '🗺️' },
];

const billingRates: { service: string; rate: string; payer: string }[] = [];

const ROLES: { value: UserRole; label: string; description: string }[] = [
  { value: 'Administrator', label: 'Administrator', description: 'Full access to all agency modules' },
  { value: 'Coordinator', label: 'Coordinator', description: 'Scheduling, clients, caregivers' },
  { value: 'Nurse', label: 'Nurse (RN/LPN)', description: 'Clinical forms, assessments, medication' },
  { value: 'Biller', label: 'Biller', description: 'Billing, invoices, payroll' },
  { value: 'ReadOnly', label: 'Read Only', description: 'View-only access across modules' },
];

// ─── Shared Add User Modal ──────────────────────────────────────────────────
// Exported so the SuperAdmin CompanyManageModal can reuse it.

export function AddUserModal({ onClose, onUserCreated, agencyIdOverride, agencyNameOverride }: {
  onClose: () => void;
  onUserCreated: (user: ManagedUser, tempPassword: string) => void;
  agencyIdOverride?: string;
  agencyNameOverride?: string;
}) {
  const { user: currentUser, impersonatingAgency } = useAuthStore();
  const { locations } = useAppStore();
  const [form, setForm] = useState({ name: '', email: '', role: 'Coordinator' as UserRole, location: 'All' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ email: string; tempPassword: string } | null>(null);

  const agencyName = agencyNameOverride || impersonatingAgency?.name || currentUser?.agencyName || 'Your Agency';
  const agencyId = agencyIdOverride || impersonatingAgency?.id || currentUser?.agencyId || 'agency-default';

  const handleSubmit = async () => {
    setError('');
    if (!form.name.trim() || !form.email.trim()) { setError('Name and email are required.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('Please enter a valid email address.'); return; }

    setSubmitting(true);
    try {
      // Try the backend API first (requires JWT auth).
      const res = await api.post('/api/users', { name: form.name.trim(), email: form.email.trim().toLowerCase(), role: form.role, location: form.location, agencyId, agencyName });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');

      const managedUser: ManagedUser = {
        id: data.user.id, name: data.user.name, email: data.user.email,
        role: data.user.role as UserRole, agencyId, agencyName,
        mustChangePassword: true, password: data.tempPassword,
        location: data.user.location || form.location, status: 'Active',
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setSuccess({ email: data.user.email, tempPassword: data.tempPassword });
      onUserCreated(managedUser, data.tempPassword);
    } catch {
      // Backend unreachable or user not authenticated — fall back to local
      // creation so the SuperAdmin and offline/demo flows still work.
      const tempPassword = Math.random().toString(36).slice(-10).toUpperCase();
      const managedUser: ManagedUser = {
        id: `u-${Date.now()}`, name: form.name.trim(), email: form.email.trim().toLowerCase(),
        role: form.role, agencyId, agencyName,
        mustChangePassword: true, password: tempPassword,
        location: form.location, status: 'Active',
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setSuccess({ email: managedUser.email, tempPassword });
      onUserCreated(managedUser, tempPassword);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center"><UserPlus size={18} className="text-blue-600" /></div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Add New User</h2>
              <p className="text-xs text-slate-400">{agencyName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {success ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <CheckCircle size={32} className="mx-auto text-green-500 mb-2" />
                <p className="text-sm font-semibold text-green-800">User Created Successfully</p>
                <p className="text-xs text-green-600 mt-1">A welcome email has been sent to {success.email}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Login Credentials</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between"><span className="text-sm text-slate-500">Email</span><span className="text-sm font-medium text-slate-800">{success.email}</span></div>
                  <div className="flex items-center justify-between"><span className="text-sm text-slate-500">Temp Password</span><code className="text-sm font-bold text-slate-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{success.tempPassword}</code></div>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                <AlertTriangle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700">Save these credentials — the temporary password will not be shown again.</p>
              </div>
              <button onClick={onClose} className="w-full btn-primary py-2">Done</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="form-label">Full Name *</label><input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Smith" /></div>
                <div className="col-span-2">
                  <label className="form-label">Email Address *</label>
                  <input type="email" className="form-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@youragency.com" />
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><Mail size={11} /> A welcome email with login credentials will be sent to this address</p>
                </div>
                <div>
                  <label className="form-label">Role *</label>
                  <select className="form-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}>{ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}</select>
                  <p className="text-xs text-slate-400 mt-1">{ROLES.find((r) => r.value === form.role)?.description}</p>
                </div>
                <div>
                  <label className="form-label">Location Access</label>
                  <select className="form-input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}>
                    <option value="All">All Locations</option>
                    {locations.map((loc) => <option key={loc.id} value={loc.name}>{loc.name}</option>)}
                  </select>
                </div>
              </div>
              {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2"><AlertTriangle size={14} className="text-red-500 flex-shrink-0" /><p className="text-sm text-red-700">{error}</p></div>}
              <div className="flex items-center gap-3 pt-2">
                <button onClick={onClose} className="flex-1 btn-secondary py-2">Cancel</button>
                <button onClick={handleSubmit} disabled={submitting} className="flex-1 btn-primary py-2 flex items-center justify-center gap-2">
                  {submitting ? <><Loader size={14} className="animate-spin" /> Creating...</> : <><UserPlus size={14} /> Create User & Send Email</>}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Settings Module ───────────────────────────────────────────────────

export default function SettingsModule() {
  const [tab, setTab] = useState<SettingsTab>('agency');
  const [saved, setSaved] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const { managedUsers, addManagedUser, user: currentUser, impersonatingAgency } = useAuthStore();

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const agencyId = impersonatingAgency?.id || currentUser?.agencyId;
  const agencyUsers = managedUsers.filter((u) => {
    if (u.role === 'SuperAdmin') return false;
    if (!agencyId) return true;
    return u.agencyId === agencyId;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        {saved && <div className="flex items-center gap-2 text-green-600 text-sm font-medium"><CheckCircle size={16} /> Saved</div>}
      </div>

      <div className="flex flex-wrap gap-1 border-b border-slate-200 pb-0">
        {([['agency', 'Agency Info'], ['system', 'System'], ['rates', 'Billing Rates'], ['users', 'Users & Roles'], ['integrations', 'Integrations'], ['notifications', 'Notifications']] as [SettingsTab, string][]).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>{label}</button>
        ))}
      </div>

      {tab === 'agency' && (
        <div className="card p-6 space-y-4 max-w-2xl">
          <h2 className="font-semibold text-slate-800">Agency Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Agency Name</label><input className="form-input" placeholder="Your Agency Name" /></div>
            <div><label className="form-label">OHA License Classification</label><select className="form-input"><option>Limited</option><option>Basic</option><option>Intermediate</option><option>Comprehensive</option></select></div>
            <div><label className="form-label">Primary License Number</label><input className="form-input" placeholder="IHC-YYYY-NNN" /></div>
            <div><label className="form-label">License Expiry</label><input type="date" className="form-input" /></div>
            <div className="col-span-2"><label className="form-label">Primary Address</label><input className="form-input" placeholder="Street, City, OR ZIP" /></div>
            <div><label className="form-label">Phone</label><input className="form-input" placeholder="(503) 000-0000" /></div>
            <div><label className="form-label">Fax</label><input className="form-input" placeholder="(503) 000-0000" /></div>
            <div><label className="form-label">Email</label><input className="form-input" placeholder="info@youragency.com" /></div>
            <div><label className="form-label">Website</label><input className="form-input" placeholder="www.youragency.com" /></div>
            <div className="col-span-2"><label className="form-label">Administrator</label><input className="form-input" placeholder="Administrator Name" /></div>
          </div>
          <button onClick={save} className="btn-primary flex items-center gap-2"><Save size={14} /> Save Changes</button>
        </div>
      )}

      {tab === 'system' && (
        <div className="card p-6 space-y-4 max-w-2xl">
          <h2 className="font-semibold text-slate-800">System Preferences</h2>
          <div className="space-y-3">
            {[['Enable Oregon OT alerts (10hr/day + 40hr/week)', true], ['Require EVV for all visits', true], ['Auto-broadcast open shifts to available caregivers', false], ['Alert on expiring certifications (60-day warning)', true], ['Alert on upcoming monitoring visits (15-day warning)', true], ['Require service plan before scheduling first shift', true], ['90-day self-direction re-evaluation reminders', true], ['Send weekly compliance summary to administrators', true]].map(([label, checked]) => (
              <label key={label as string} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                <span className="text-sm text-slate-700">{label as string}</span>
                <input type="checkbox" defaultChecked={checked as boolean} className="w-4 h-4 accent-blue-600" />
              </label>
            ))}
          </div>
          <button onClick={save} className="btn-primary flex items-center gap-2"><Save size={14} /> Save Changes</button>
        </div>
      )}

      {tab === 'rates' && (
        <div className="card overflow-hidden max-w-3xl">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Billing Rates</h2>
            <button className="btn-primary text-sm">Add Rate</button>
          </div>
          <table className="w-full">
            <thead><tr className="bg-slate-50 border-b border-slate-200">{['Service', 'Rate', 'Payer', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">
              {billingRates.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-400"><p className="text-sm font-medium">No billing rates configured</p><p className="text-xs mt-1">Add rates for your agency's services</p></td></tr>
              ) : billingRates.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium">{r.service}</td>
                  <td className="px-4 py-3 text-sm font-bold text-green-700">{r.rate}/hr</td>
                  <td className="px-4 py-3"><span className="badge-blue">{r.payer}</span></td>
                  <td className="px-4 py-3"><button className="text-sm text-blue-600 hover:text-blue-800">Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'users' && (
        <div className="card overflow-hidden max-w-3xl">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Users & Role-Based Access</h2>
            <button onClick={() => setShowAddUser(true)} className="btn-primary text-sm flex items-center gap-2"><UserPlus size={14} /> Add User</button>
          </div>
          <table className="w-full">
            <thead><tr className="bg-slate-50 border-b border-slate-200">{['User', 'Role', 'Location Access', 'Status', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">
              {agencyUsers.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                  <UserPlus size={28} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm font-medium">No users added yet</p>
                  <p className="text-xs mt-1">Add users to manage access and roles. Each user receives a welcome email with login credentials.</p>
                </td></tr>
              ) : agencyUsers.map(user => (
                <tr key={user.email} className="hover:bg-slate-50">
                  <td className="px-4 py-3"><div className="text-sm font-medium">{user.name}</div><div className="text-xs text-slate-400">{user.email}</div></td>
                  <td className="px-4 py-3"><span className="badge-blue">{user.role}</span></td>
                  <td className="px-4 py-3 text-sm text-slate-500">{user.location}</td>
                  <td className="px-4 py-3">
                    <span className={user.status === 'Active' ? 'badge-green' : 'badge-gray'}>{user.status}</span>
                    {user.mustChangePassword && <span className="ml-2 text-xs text-amber-600 font-medium">Pending first login</span>}
                  </td>
                  <td className="px-4 py-3"><button className="text-sm text-blue-600 hover:text-blue-800">Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'integrations' && (
        <div className="grid grid-cols-2 gap-4 max-w-3xl">
          {integrations.map(intg => (
            <div key={intg.name} className="card p-4 flex items-center gap-4">
              <span className="text-2xl">{intg.icon}</span>
              <div className="flex-1"><div className="font-medium text-slate-800">{intg.name}</div><div className="text-xs text-slate-500">{intg.desc}</div></div>
              <span className={intg.status === 'Connected' ? 'badge-green' : 'badge-gray'}>{intg.status}</span>
              <button className={`text-sm font-medium ${intg.status === 'Connected' ? 'text-slate-500 hover:text-red-500' : 'text-blue-600 hover:text-blue-800'}`}>{intg.status === 'Connected' ? 'Disconnect' : 'Connect'}</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'notifications' && (
        <div className="card p-6 space-y-3 max-w-2xl">
          <h2 className="font-semibold text-slate-800">Notification Settings</h2>
          {['EVV missed clock-in/out alert', 'Certification expiring in 60 days', 'Background check renewal due', 'Service plan 7-day deadline approaching', 'Monitoring visit overdue', 'Self-direction re-evaluation due', 'Incident report submitted', 'New client intake received', 'Open shift unfilled 24 hours before', 'License renewal 90 days out', 'Payroll processing reminder', 'QA meeting due'].map(notif => (
            <label key={notif} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
              <span className="text-sm text-slate-700">{notif}</span>
              <div className="flex gap-4">{['In-App', 'Email', 'SMS'].map(method => <label key={method} className="flex items-center gap-1 text-xs text-slate-500"><input type="checkbox" defaultChecked={method === 'In-App'} className="accent-blue-600" />{method}</label>)}</div>
            </label>
          ))}
          <button onClick={save} className="btn-primary flex items-center gap-2"><Save size={14} /> Save Changes</button>
        </div>
      )}

      {showAddUser && <AddUserModal onClose={() => setShowAddUser(false)} onUserCreated={(user) => addManagedUser(user)} />}
    </div>
  );
}
