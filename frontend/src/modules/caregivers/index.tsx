import React, { useState } from 'react';
import { useAppStore, Caregiver } from '../../store/useAppStore';
import { differenceInDays, parseISO, format } from 'date-fns';
import { Search, Plus, Eye, AlertTriangle, CheckCircle, Star, Clock } from 'lucide-react';
import Modal from '../../components/ui/Modal';

function getCaregiverAlerts(cg: Caregiver) {
  const today = new Date();
  const alerts: { label: string; severity: 'red' | 'yellow' }[] = [];
  if (!cg.backgroundCheckDate) { alerts.push({ label: 'Background check not on file', severity: 'red' }); }
  else {
    const years = differenceInDays(today, parseISO(cg.backgroundCheckDate)) / 365;
    if (years >= 3) alerts.push({ label: 'Background check renewal OVERDUE (3yr)', severity: 'red' });
    else if (years >= 2.75) alerts.push({ label: 'Background check renewal due within 90 days', severity: 'yellow' });
  }
  if (!cg.leieCheckedDate) alerts.push({ label: 'LEIE check not documented', severity: 'red' });
  if (!cg.orientationDate) alerts.push({ label: 'Orientation not documented', severity: 'red' });
  if (!cg.initialTrainingDate) alerts.push({ label: 'Initial caregiver training not completed', severity: 'red' });
  if (cg.lastAnnualTrainingDate) {
    const days = differenceInDays(today, parseISO(cg.lastAnnualTrainingDate));
    if (days > 365) alerts.push({ label: 'Annual training (6hr) OVERDUE', severity: 'red' });
    else if (days > 330) alerts.push({ label: 'Annual training due within 35 days', severity: 'yellow' });
  }
  if (cg.licenseExpiry) {
    const days = differenceInDays(parseISO(cg.licenseExpiry), today);
    if (days < 0) alerts.push({ label: `License/Cert EXPIRED ${Math.abs(days)}d ago`, severity: 'red' });
    else if (days < 60) alerts.push({ label: `License/Cert expires in ${days} days`, severity: 'yellow' });
  }
  return alerts;
}

export default function Caregivers() {
  const { caregivers, addCaregiver } = useAppStore();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Caregiver | null>(null);
  const [showNew, setShowNew] = useState(false);

  const filtered = caregivers.filter(cg =>
    cg.name.toLowerCase().includes(search.toLowerCase()) ||
    cg.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Caregivers</h1>
          <p className="text-slate-500 text-sm">{caregivers.filter(c => c.status === 'Active').length} active · {caregivers.length} total</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> New Caregiver</button>
      </div>
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className="form-input pl-9" placeholder="Search caregivers..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {['Caregiver', 'Status', 'Classification', 'Location', 'Certifications', 'Alerts', 'Rating', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(cg => {
              const alerts = getCaregiverAlerts(cg);
              const red = alerts.filter(a => a.severity === 'red').length;
              const yellow = alerts.filter(a => a.severity === 'yellow').length;
              return (
                <tr key={cg.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{cg.name}</div>
                    <div className="text-xs text-slate-400">{cg.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cg.status === 'Active' ? 'badge-green' : cg.status === 'On Leave' ? 'badge-yellow' : 'badge-gray'}>{cg.status}</span>
                  </td>
                  <td className="px-4 py-3"><span className="badge-blue">{cg.classification}</span></td>
                  <td className="px-4 py-3 text-sm text-slate-600">{cg.location}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">{cg.certifications.slice(0, 2).map(c => <span key={c} className="badge-gray text-xs">{c}</span>)}{cg.certifications.length > 2 && <span className="badge-gray text-xs">+{cg.certifications.length - 2}</span>}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {red > 0 && <span className="flex items-center gap-1 text-xs text-red-600"><AlertTriangle size={12} />{red}</span>}
                      {yellow > 0 && <span className="flex items-center gap-1 text-xs text-amber-500"><Clock size={12} />{yellow}</span>}
                      {red === 0 && yellow === 0 && <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle size={12} />OK</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm">
                      <Star size={13} className="text-amber-400 fill-amber-400" />
                      <span className="font-medium">{cg.rating}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelected(cg)} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"><Eye size={14} /> View</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected && <CaregiverFile caregiver={selected} onClose={() => setSelected(null)} />}
      {showNew && <NewCaregiverModal onClose={() => setShowNew(false)} onSave={(c) => { addCaregiver(c); setShowNew(false); }} />}
    </div>
  );
}

function CaregiverFile({ caregiver: cg, onClose }: { caregiver: Caregiver; onClose: () => void }) {
  const alerts = getCaregiverAlerts(cg);
  const trainingItems = [
    { label: 'Agency Orientation (4hr min)', date: cg.orientationDate, oar: 'OAR 333-536-0070(5)' },
    { label: 'Initial Caregiver Training (8hr total)', date: cg.initialTrainingDate, oar: 'OAR 333-536-0070(7)' },
    { label: 'Medication Services Training (4hr)', date: cg.medicationTrainedDate, oar: 'OAR 333-536-0070(8)' },
    { label: 'Annual Training (6hr + 1hr if med)', date: cg.lastAnnualTrainingDate, oar: 'OAR 333-536-0070(14)' },
    { label: 'Background Check', date: cg.backgroundCheckDate, oar: 'OAR 333-536-0093' },
    { label: 'LEIE Check', date: cg.leieCheckedDate, oar: 'OAR 333-536-0093(11)' },
  ];

  return (
    <Modal title={`Caregiver File — ${cg.name}`} onClose={onClose} size="lg">
      {alerts.filter(a => a.severity === 'red').length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertTriangle size={16} className="text-red-500 mt-0.5" />
          <div className="text-sm text-red-700"><strong>{alerts.filter(a => a.severity === 'red').length} compliance issues</strong> require attention.</div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="form-section">
            <h3 className="text-sm font-semibold mb-3">Personal Information</h3>
            <div className="space-y-1.5 text-sm">
              {[['Phone', cg.phone], ['Email', cg.email], ['Address', cg.address], ['Hire Date', cg.hireDate ? format(parseISO(cg.hireDate), 'MM/dd/yyyy') : 'N/A'], ['Location', cg.location], ['Classification', cg.classification], ['Status', cg.status]].map(([k, v]) => (
                <div key={k} className="flex gap-2"><span className="text-slate-400 w-28">{k}:</span><span className="font-medium">{v}</span></div>
              ))}
            </div>
          </div>
          <div className="form-section">
            <h3 className="text-sm font-semibold mb-2">Certifications</h3>
            <div className="flex flex-wrap gap-1">{cg.certifications.map(c => <span key={c} className="badge-blue">{c}</span>)}</div>
          </div>
          {cg.licenseNumber && (
            <div className="form-section">
              <h3 className="text-sm font-semibold mb-2">License</h3>
              <div className="text-sm"><div>{cg.licenseNumber}</div><div className={`text-xs mt-0.5 ${cg.licenseExpiry && differenceInDays(parseISO(cg.licenseExpiry), new Date()) < 60 ? 'text-red-500' : 'text-slate-400'}`}>Expires: {cg.licenseExpiry ? format(parseISO(cg.licenseExpiry), 'MM/dd/yyyy') : 'N/A'}</div></div>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div className="form-section">
            <h3 className="text-sm font-semibold mb-3">Compliance & Training Tracker</h3>
            <div className="space-y-2">
              {trainingItems.map(item => (
                <div key={item.label} className="flex items-center gap-3 p-2 border border-slate-100 rounded">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${item.date ? 'bg-green-100' : 'bg-red-100'}`}>
                    {item.date ? <CheckCircle size={10} className="text-green-600" /> : <AlertTriangle size={10} className="text-red-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-700 truncate">{item.label}</div>
                    <div className="text-xs text-slate-400">{item.oar}</div>
                  </div>
                  <div className="text-xs text-right flex-shrink-0">{item.date ? format(parseISO(item.date), 'MM/dd/yy') : <span className="text-red-500">Missing</span>}</div>
                </div>
              ))}
            </div>
          </div>
          {alerts.length > 0 && (
            <div className="form-section">
              <h3 className="text-sm font-semibold mb-2">Action Items</h3>
              <div className="space-y-1">
                {alerts.map((a, i) => (
                  <div key={i} className={`flex items-start gap-2 p-2 rounded text-xs ${a.severity === 'red' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                    <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" /> {a.label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

function NewCaregiverModal({ onClose, onSave }: { onClose: () => void; onSave: (c: Caregiver) => void }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', location: 'Portland', classification: 'Basic' as Caregiver['classification'] });
  const handle = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const save = () => {
    onSave({
      id: `cg${Date.now()}`, ...form, status: 'Active', certifications: [], assignedClients: [],
      rating: 5.0, hireDate: new Date().toISOString().split('T')[0], driverLicense: false, autoInsurance: false,
    });
  };
  return (
    <Modal title="New Caregiver" onClose={onClose} size="md"
      footer={<><button className="btn-secondary" onClick={onClose}>Cancel</button><button className="btn-primary" onClick={save}>Create</button></>}>
      <div className="grid grid-cols-2 gap-4">
        {[['name', 'Full Name'], ['phone', 'Phone'], ['email', 'Email'], ['address', 'Address']].map(([k, l]) => (
          <div key={k} className={k === 'address' ? 'col-span-2' : ''}>
            <label className="form-label">{l}</label>
            <input className="form-input" value={(form as any)[k]} onChange={e => handle(k, e.target.value)} />
          </div>
        ))}
        <div><label className="form-label">Location</label>
          <select className="form-input" value={form.location} onChange={e => handle('location', e.target.value)}>
            {['Portland', 'Eugene', 'Salem', 'Bend'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div><label className="form-label">Classification</label>
          <select className="form-input" value={form.classification} onChange={e => handle('classification', e.target.value as any)}>
            {['Limited', 'Basic', 'Intermediate', 'Comprehensive'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>
    </Modal>
  );
}
