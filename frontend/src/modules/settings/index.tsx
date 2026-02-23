import React, { useState } from 'react';
import { Settings, Save, CheckCircle } from 'lucide-react';

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

const users: { name: string; email: string; role: string; location: string; status: string }[] = [];

const billingRates = [
  { service: 'Personal Care — Hourly', rate: '$28.00', payer: 'Private Pay' },
  { service: 'Personal Care — Hourly', rate: '$26.50', payer: 'Medicaid' },
  { service: 'Personal Care — Hourly', rate: '$28.00', payer: 'Veterans' },
  { service: 'Medication Assistance — Hourly', rate: '$32.00', payer: 'Private Pay' },
  { service: 'Medication Administration — Hourly', rate: '$38.00', payer: 'Private Pay' },
  { service: 'Nursing Services — Hourly', rate: '$65.00', payer: 'Private Pay' },
  { service: 'Housekeeping — Hourly', rate: '$24.00', payer: 'Private Pay' },
];

export default function SettingsModule() {
  const [tab, setTab] = useState<SettingsTab>('agency');
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

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

      {/* AGENCY INFO */}
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

      {/* SYSTEM */}
      {tab === 'system' && (
        <div className="card p-6 space-y-4 max-w-2xl">
          <h2 className="font-semibold text-slate-800">System Preferences</h2>
          <div className="space-y-3">
            {[
              ['Enable Oregon OT alerts (10hr/day + 40hr/week)', true],
              ['Require EVV for all visits', true],
              ['Auto-broadcast open shifts to available caregivers', false],
              ['Alert on expiring certifications (60-day warning)', true],
              ['Alert on upcoming monitoring visits (15-day warning)', true],
              ['Require service plan before scheduling first shift', true],
              ['90-day self-direction re-evaluation reminders', true],
              ['Send weekly compliance summary to administrators', true],
            ].map(([label, checked]) => (
              <label key={label as string} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                <span className="text-sm text-slate-700">{label as string}</span>
                <input type="checkbox" defaultChecked={checked as boolean} className="w-4 h-4 accent-blue-600" />
              </label>
            ))}
          </div>
          <button onClick={save} className="btn-primary flex items-center gap-2"><Save size={14} /> Save Changes</button>
        </div>
      )}

      {/* BILLING RATES */}
      {tab === 'rates' && (
        <div className="card overflow-hidden max-w-3xl">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Billing Rates</h2>
            <button className="btn-primary text-sm">Add Rate</button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Service', 'Rate', 'Payer', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {billingRates.map((r, i) => (
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

      {/* USERS */}
      {tab === 'users' && (
        <div className="card overflow-hidden max-w-3xl">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Users & Role-Based Access</h2>
            <button className="btn-primary text-sm">Add User</button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['User', 'Role', 'Location Access', 'Status', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                    <p className="text-sm font-medium">No users added yet</p>
                    <p className="text-xs mt-1">Add users to manage access and roles</p>
                  </td>
                </tr>
              ) : users.map(user => (
                <tr key={user.email} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium">{user.name}</div>
                    <div className="text-xs text-slate-400">{user.email}</div>
                  </td>
                  <td className="px-4 py-3"><span className="badge-blue">{user.role}</span></td>
                  <td className="px-4 py-3 text-sm text-slate-500">{user.location}</td>
                  <td className="px-4 py-3"><span className="badge-green">{user.status}</span></td>
                  <td className="px-4 py-3"><button className="text-sm text-blue-600 hover:text-blue-800">Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* INTEGRATIONS */}
      {tab === 'integrations' && (
        <div className="grid grid-cols-2 gap-4 max-w-3xl">
          {integrations.map(intg => (
            <div key={intg.name} className="card p-4 flex items-center gap-4">
              <span className="text-2xl">{intg.icon}</span>
              <div className="flex-1">
                <div className="font-medium text-slate-800">{intg.name}</div>
                <div className="text-xs text-slate-500">{intg.desc}</div>
              </div>
              <span className={intg.status === 'Connected' ? 'badge-green' : 'badge-gray'}>{intg.status}</span>
              <button className={`text-sm font-medium ${intg.status === 'Connected' ? 'text-slate-500 hover:text-red-500' : 'text-blue-600 hover:text-blue-800'}`}>
                {intg.status === 'Connected' ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* NOTIFICATIONS */}
      {tab === 'notifications' && (
        <div className="card p-6 space-y-3 max-w-2xl">
          <h2 className="font-semibold text-slate-800">Notification Settings</h2>
          {[
            'EVV missed clock-in/out alert',
            'Certification expiring in 60 days',
            'Background check renewal due',
            'Service plan 7-day deadline approaching',
            'Monitoring visit overdue',
            'Self-direction re-evaluation due',
            'Incident report submitted',
            'New client intake received',
            'Open shift unfilled 24 hours before',
            'License renewal 90 days out',
            'Payroll processing reminder',
            'QA meeting due',
          ].map(notif => (
            <label key={notif} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
              <span className="text-sm text-slate-700">{notif}</span>
              <div className="flex gap-4">
                {['In-App', 'Email', 'SMS'].map(method => (
                  <label key={method} className="flex items-center gap-1 text-xs text-slate-500">
                    <input type="checkbox" defaultChecked={method === 'In-App'} className="accent-blue-600" />
                    {method}
                  </label>
                ))}
              </div>
            </label>
          ))}
          <button onClick={save} className="btn-primary flex items-center gap-2"><Save size={14} /> Save Changes</button>
        </div>
      )}
    </div>
  );
}
