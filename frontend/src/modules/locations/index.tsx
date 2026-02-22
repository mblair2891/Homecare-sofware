import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { MapPin, Users, UserCheck, Building2, TrendingUp, Plus, CheckCircle } from 'lucide-react';
import Modal from '../../components/ui/Modal';

const expansionPipeline = [
  { city: 'Bend', stage: 'Site Selection', progress: 30, est: 'Q3 2026', classification: 'Basic', type: 'Subunit' },
  { city: 'Medford', stage: 'License Application', progress: 60, est: 'Q2 2026', classification: 'Basic', type: 'Subunit' },
];

const medfordChecklist = [
  { item: 'Identify qualified administrator', done: true },
  { item: 'Lease signed at 500 Jackson St', done: true },
  { item: 'OHA license application submitted', done: true },
  { item: 'Background checks for initial staff', done: false },
  { item: 'Caregiver orientation scheduled', done: false },
  { item: 'OHA initial survey', done: false },
  { item: 'First client intake', done: false },
];

export default function Locations() {
  const { locations } = useAppStore();
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Locations</h1>
          <p className="text-slate-500 text-sm">{locations.filter(l => l.status === 'Active').length} active · {locations.length} total (incl. pipeline)</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add Location</button>
      </div>

      {/* Active locations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {locations.filter(l => l.status === 'Active').map(loc => (
          <div key={loc.id} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Building2 size={18} className="text-blue-600" />
                <div>
                  <h3 className="font-semibold text-slate-800">{loc.name}</h3>
                  <div className="text-xs text-slate-400">{loc.type}</div>
                </div>
              </div>
              <span className="badge-green">Active</span>
            </div>
            <div className="text-xs text-slate-500 mb-3 flex items-center gap-1"><MapPin size={11} />{loc.address}</div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="p-2 bg-blue-50 rounded-lg text-center">
                <div className="text-xl font-bold text-blue-700">{loc.activeClients}</div>
                <div className="text-xs text-blue-500">Clients</div>
              </div>
              <div className="p-2 bg-teal-50 rounded-lg text-center">
                <div className="text-xl font-bold text-teal-700">{loc.activeCaregivers}</div>
                <div className="text-xs text-teal-500">Caregivers</div>
              </div>
            </div>
            <div className="space-y-1 text-xs text-slate-600">
              <div className="flex justify-between"><span className="text-slate-400">Classification:</span> <span className="badge-blue">{loc.classification}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Administrator:</span> <span>{loc.administrator}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">License #:</span> <span>{loc.licenseNumber}</span></div>
              {loc.licenseExpiry && <div className="flex justify-between"><span className="text-slate-400">License Expires:</span> <span>{loc.licenseExpiry}</span></div>}
            </div>
          </div>
        ))}
      </div>

      {/* Expansion pipeline */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-green-600" /> Expansion Pipeline</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {expansionPipeline.map(loc => (
            <div key={loc.city} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-800">{loc.city} — {loc.type}</h3>
                <span className="badge-yellow">{loc.stage}</span>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Progress</span>
                  <span>{loc.progress}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full">
                  <div className="h-2 bg-blue-500 rounded-full transition-all" style={{ width: `${loc.progress}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                <div className="flex justify-between"><span className="text-slate-400">Est. Launch:</span> <span className="font-medium">{loc.est}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Classification:</span> <span className="badge-blue">{loc.classification}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Medford launch checklist */}
      <div className="card p-5">
        <h2 className="font-semibold text-slate-800 mb-4">Medford Launch Checklist (OAR 333-536 Requirements)</h2>
        <div className="space-y-2">
          {medfordChecklist.map((item, i) => (
            <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg ${item.done ? 'bg-green-50' : 'bg-slate-50'}`}>
              <CheckCircle size={16} className={item.done ? 'text-green-500' : 'text-slate-300'} />
              <span className={`text-sm ${item.done ? 'text-green-700 line-through' : 'text-slate-700'}`}>{item.item}</span>
            </div>
          ))}
        </div>
      </div>

      {showNew && (
        <Modal title="Add New Location" onClose={() => setShowNew(false)} size="md"
          footer={<><button className="btn-secondary" onClick={() => setShowNew(false)}>Cancel</button><button className="btn-primary">Add Location</button></>}>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Location Name</label><input className="form-input" /></div>
            <div><label className="form-label">Type</label><select className="form-input"><option>Parent</option><option>Subunit</option><option>Branch</option></select></div>
            <div className="col-span-2"><label className="form-label">Address</label><input className="form-input" /></div>
            <div><label className="form-label">Phone</label><input className="form-input" /></div>
            <div><label className="form-label">Classification</label><select className="form-input"><option>Limited</option><option>Basic</option><option>Intermediate</option><option>Comprehensive</option></select></div>
            <div><label className="form-label">Administrator</label><input className="form-input" /></div>
            <div><label className="form-label">Status</label><select className="form-input"><option>Planning</option><option>Pending</option><option>Active</option></select></div>
          </div>
        </Modal>
      )}
    </div>
  );
}
