import React, { useState } from 'react';
import { useAppStore, Client } from '../../store/useAppStore';
import { differenceInDays, parseISO, format, addDays } from 'date-fns';
import { Search, Plus, Eye, AlertTriangle, CheckCircle, FileText, Clock } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import ClientFile from './ClientFile';

function getComplianceAlerts(client: Client) {
  const today = new Date();
  const alerts: { label: string; severity: 'red' | 'yellow' | 'blue'; oar: string; action: string }[] = [];

  if (!client.disclosureSignedDate) alerts.push({ label: 'Disclosure Statement not signed', severity: 'red', oar: 'OAR 333-536-0055', action: 'CF01' });
  if (!client.rightsSignedDate) alerts.push({ label: "Client Rights Notice not signed", severity: 'red', oar: 'OAR 333-536-0060', action: 'CF02' });
  if (!client.initialAssessmentDate) alerts.push({ label: 'Initial Assessment not completed', severity: 'red', oar: 'OAR 333-536-0065', action: 'CF03' });
  if (!client.serviceAgreementDate) alerts.push({ label: 'Service & Financial Agreement missing', severity: 'red', oar: 'OAR 333-536-0085', action: 'CF05' });

  if (!client.servicePlanDate) {
    alerts.push({ label: 'Service Plan not completed', severity: 'red', oar: 'OAR 333-536-0065', action: 'CF04' });
  } else {
    const days = differenceInDays(today, parseISO(client.servicePlanDate));
    if (days > 7 && !client.initialVisitDate) alerts.push({ label: 'Service Plan past 7-day rule', severity: 'yellow', oar: 'OAR 333-536-0065', action: 'CF04' });
  }

  if (client.startDate) {
    const daysSinceStart = differenceInDays(today, parseISO(client.startDate));
    if (!client.initialVisitDate && daysSinceStart >= 7 && daysSinceStart <= 30) {
      alerts.push({ label: `Initial visit window open (day ${daysSinceStart} of 30)`, severity: 'blue', oar: 'OAR 333-536-0066', action: 'CF08' });
    } else if (!client.initialVisitDate && daysSinceStart > 30) {
      alerts.push({ label: 'Initial visit MISSED (past day 30)', severity: 'red', oar: 'OAR 333-536-0066', action: 'CF08' });
    }
  }

  if (client.lastMonitoringDate) {
    const days = differenceInDays(today, parseISO(client.lastMonitoringDate));
    if (days > 180) alerts.push({ label: 'In-person monitoring visit overdue (6mo max)', severity: 'red', oar: 'OAR 333-536-0066', action: 'CF09' });
    else if (days > 90) alerts.push({ label: `Quarterly monitoring overdue (${days}d ago)`, severity: 'red', oar: 'OAR 333-536-0066', action: 'CF09' });
    else if (days > 75) alerts.push({ label: 'Quarterly monitoring due within 15 days', severity: 'yellow', oar: 'OAR 333-536-0066', action: 'CF09' });
  }

  if (client.canSelfDirect) {
    if (!client.lastSelfDirectionEvalDate) {
      alerts.push({ label: 'Self-direction assessment not completed', severity: 'red', oar: 'OAR 333-536-0045', action: 'CF10' });
    } else {
      const days = differenceInDays(today, parseISO(client.lastSelfDirectionEvalDate));
      if (days > 90) alerts.push({ label: '90-day self-direction re-eval overdue', severity: 'red', oar: 'OAR 333-536-0045', action: 'CF11' });
      else if (days > 75) alerts.push({ label: 'Self-direction re-eval due within 15 days', severity: 'yellow', oar: 'OAR 333-536-0045', action: 'CF11' });
    }
  }

  return alerts;
}

export default function Clients() {
  const { clients, addClient } = useAppStore();
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showNewClientModal, setShowNewClientModal] = useState(false);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.location.toLowerCase().includes(search.toLowerCase()) ||
    c.payer.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (s: Client['status']) => {
    if (s === 'Active') return 'badge-green';
    if (s === 'Inactive') return 'badge-gray';
    if (s === 'On Hold') return 'badge-yellow';
    return 'badge-red';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
          <p className="text-slate-500 text-sm">{clients.filter(c => c.status === 'Active').length} active · {clients.length} total</p>
        </div>
        <button onClick={() => setShowNewClientModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Client
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="form-input pl-9"
          placeholder="Search by name, location, or payer..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Client</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Payer</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Classification</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Location</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Alerts</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(client => {
              const alerts = getComplianceAlerts(client);
              const redAlerts = alerts.filter(a => a.severity === 'red').length;
              const yellowAlerts = alerts.filter(a => a.severity === 'yellow').length;
              return (
                <tr key={client.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{client.name}</div>
                    <div className="text-xs text-slate-400">DOB: {format(parseISO(client.dob), 'MM/dd/yyyy')}</div>
                  </td>
                  <td className="px-4 py-3"><span className={statusColor(client.status)}>{client.status}</span></td>
                  <td className="px-4 py-3 text-sm text-slate-600">{client.payer}</td>
                  <td className="px-4 py-3">
                    <span className="badge-blue">{client.classification}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{client.location}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {redAlerts > 0 && (
                        <span className="flex items-center gap-1 text-xs font-medium text-red-600">
                          <AlertTriangle size={12} /> {redAlerts}
                        </span>
                      )}
                      {yellowAlerts > 0 && (
                        <span className="flex items-center gap-1 text-xs font-medium text-amber-500">
                          <Clock size={12} /> {yellowAlerts}
                        </span>
                      )}
                      {redAlerts === 0 && yellowAlerts === 0 && (
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle size={12} /> OK
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedClient(client)}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <Eye size={14} /> View File
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-10 text-slate-400">No clients found</div>
        )}
      </div>

      {/* Client File Modal */}
      {selectedClient && (
        <ClientFile client={selectedClient} onClose={() => setSelectedClient(null)} />
      )}

      {/* New Client Modal */}
      {showNewClientModal && (
        <NewClientModal onClose={() => setShowNewClientModal(false)} onSave={(c) => { addClient(c); setShowNewClientModal(false); }} />
      )}
    </div>
  );
}

function NewClientModal({ onClose, onSave }: { onClose: () => void; onSave: (c: Client) => void }) {
  const [form, setForm] = useState({
    name: '', dob: '', address: '', phone: '', pcp: '', pcpPhone: '', hospital: '',
    payer: 'Medicaid' as Client['payer'], diagnoses: '', allergies: '', medications: '',
    fallRisk: 'Low' as Client['fallRisk'], emergencyContact: '', emergencyPhone: '',
    location: 'Portland', classification: 'Basic' as Client['classification'], notes: ''
  });

  const handle = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const save = () => {
    const c: Client = {
      id: `c${Date.now()}`, ...form,
      diagnoses: form.diagnoses.split(',').map(s => s.trim()).filter(Boolean),
      allergies: form.allergies.split(',').map(s => s.trim()).filter(Boolean),
      medications: form.medications.split(',').map(s => s.trim()).filter(Boolean),
      status: 'Active', startDate: new Date().toISOString().split('T')[0],
      assignedCaregivers: [], canSelfDirect: true, stableAndPredictable: true,
      disclosureSignedDate: undefined, rightsSignedDate: undefined,
      initialAssessmentDate: undefined, servicePlanDate: undefined,
      serviceAgreementDate: undefined, initialVisitDate: undefined,
      lastMonitoringDate: undefined, lastSelfDirectionEvalDate: undefined,
    };
    onSave(c);
  };

  return (
    <Modal title="New Client" onClose={onClose} size="lg"
      footer={<><button className="btn-secondary" onClick={onClose}>Cancel</button><button className="btn-primary" onClick={save}>Create Client</button></>}>
      <div className="grid grid-cols-2 gap-4">
        {[['name', 'Full Name'], ['dob', 'Date of Birth'], ['phone', 'Phone'], ['address', 'Address'], ['pcp', 'Primary Care Provider'], ['pcpPhone', 'PCP Phone'], ['hospital', 'Preferred Hospital'], ['emergencyContact', 'Emergency Contact'], ['emergencyPhone', 'Emergency Phone']].map(([k, label]) => (
          <div key={k} className={k === 'address' ? 'col-span-2' : ''}>
            <label className="form-label">{label}</label>
            <input className="form-input" type={k === 'dob' ? 'date' : 'text'} value={(form as any)[k]} onChange={e => handle(k, e.target.value)} />
          </div>
        ))}
        {[['payer', 'Payer', ['Medicaid', 'Private Pay', 'Veterans', 'Long-Term Care Insurance']], ['location', 'Location', ['Portland', 'Eugene', 'Salem', 'Bend']], ['classification', 'Classification', ['Limited', 'Basic', 'Intermediate', 'Comprehensive']], ['fallRisk', 'Fall Risk', ['Low', 'Medium', 'High']]].map(([k, label, opts]) => (
          <div key={k as string}>
            <label className="form-label">{label as string}</label>
            <select className="form-input" value={(form as any)[k as string]} onChange={e => handle(k as string, e.target.value)}>
              {(opts as string[]).map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
        {[['diagnoses', 'Diagnoses (comma-separated)'], ['allergies', 'Allergies (comma-separated)'], ['medications', 'Medications (comma-separated)']].map(([k, label]) => (
          <div key={k} className="col-span-2">
            <label className="form-label">{label}</label>
            <input className="form-input" value={(form as any)[k]} onChange={e => handle(k, e.target.value)} />
          </div>
        ))}
        <div className="col-span-2">
          <label className="form-label">Notes</label>
          <textarea className="form-input" rows={3} value={form.notes} onChange={e => handle('notes', e.target.value)} />
        </div>
      </div>
    </Modal>
  );
}
