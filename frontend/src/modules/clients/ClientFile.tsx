import React, { useState } from 'react';
import { Client, useAppStore } from '../../store/useAppStore';
import { differenceInDays, parseISO, format } from 'date-fns';
import { AlertTriangle, Clock, CheckCircle, FileText, User, Activity, ClipboardList } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import ClientForms from './ClientForms';

function getAlerts(client: Client) {
  const today = new Date();
  const alerts: { label: string; severity: 'red' | 'yellow' | 'blue'; oar: string; formId: string }[] = [];
  if (!client.disclosureSignedDate) alerts.push({ label: 'Disclosure Statement not signed', severity: 'red', oar: 'OAR 333-536-0055', formId: 'CF01' });
  if (!client.rightsSignedDate) alerts.push({ label: 'Client Rights Notice not signed', severity: 'red', oar: 'OAR 333-536-0060', formId: 'CF02' });
  if (!client.initialAssessmentDate) alerts.push({ label: 'Initial Assessment not completed', severity: 'red', oar: 'OAR 333-536-0065', formId: 'CF03' });
  if (!client.serviceAgreementDate) alerts.push({ label: 'Service & Financial Agreement missing', severity: 'red', oar: 'OAR 333-536-0085', formId: 'CF05' });
  if (!client.servicePlanDate) alerts.push({ label: 'Service Plan not completed (7-day rule)', severity: 'red', oar: 'OAR 333-536-0065', formId: 'CF04' });
  if (client.startDate) {
    const d = differenceInDays(today, parseISO(client.startDate));
    if (!client.initialVisitDate && d >= 7 && d <= 30) alerts.push({ label: `Initial visit window: Day ${d} of 30`, severity: 'blue', oar: 'OAR 333-536-0066', formId: 'CF08' });
    else if (!client.initialVisitDate && d > 30) alerts.push({ label: 'Initial visit MISSED — past day 30', severity: 'red', oar: 'OAR 333-536-0066', formId: 'CF08' });
  }
  if (client.lastMonitoringDate) {
    const d = differenceInDays(today, parseISO(client.lastMonitoringDate));
    if (d > 90) alerts.push({ label: `Quarterly monitoring overdue (${d} days since last)`, severity: 'red', oar: 'OAR 333-536-0066', formId: 'CF09' });
    else if (d > 75) alerts.push({ label: 'Quarterly monitoring due within 15 days', severity: 'yellow', oar: 'OAR 333-536-0066', formId: 'CF09' });
    if (d > 180) alerts.push({ label: '6-month in-person visit deadline approaching', severity: 'red', oar: 'OAR 333-536-0066', formId: 'CF09' });
  }
  if (client.canSelfDirect && client.lastSelfDirectionEvalDate) {
    const d = differenceInDays(today, parseISO(client.lastSelfDirectionEvalDate));
    if (d > 90) alerts.push({ label: '90-day self-direction re-evaluation overdue', severity: 'red', oar: 'OAR 333-536-0045', formId: 'CF11' });
    else if (d > 75) alerts.push({ label: 'Self-direction re-evaluation due in < 15 days', severity: 'yellow', oar: 'OAR 333-536-0045', formId: 'CF11' });
  }
  return alerts;
}

const severityIcon = { red: <AlertTriangle size={14} className="text-red-500" />, yellow: <Clock size={14} className="text-amber-500" />, blue: <CheckCircle size={14} className="text-blue-500" /> };
const severityBg = { red: 'bg-red-50 border-red-200', yellow: 'bg-amber-50 border-amber-200', blue: 'bg-blue-50 border-blue-200' };
const severityText = { red: 'text-red-700', yellow: 'text-amber-700', blue: 'text-blue-700' };
const severityBadge = { red: 'bg-red-100 text-red-700', yellow: 'bg-amber-100 text-amber-700', blue: 'bg-blue-100 text-blue-700' };

type Tab = 'overview' | 'notices' | 'compliance' | 'forms';

export default function ClientFile({ client, onClose }: { client: Client; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('overview');
  const [openForm, setOpenForm] = useState<string | null>(null);
  const { caregivers } = useAppStore();
  const alerts = getAlerts(client);
  const assignedCaregivers = caregivers.filter(cg => client.assignedCaregivers.includes(cg.id));

  const complianceItems = [
    { label: 'Disclosure Statement', date: client.disclosureSignedDate, form: 'CF01', next: client.disclosureSignedDate ? 'On file' : 'Required before service', oar: 'OAR 333-536-0055' },
    { label: 'Client Rights Notice', date: client.rightsSignedDate, form: 'CF02', next: client.rightsSignedDate ? 'On file' : 'Required before service', oar: 'OAR 333-536-0060' },
    { label: 'Initial Assessment', date: client.initialAssessmentDate, form: 'CF03', next: client.initialAssessmentDate ? 'On file' : 'Required at intake', oar: 'OAR 333-536-0065' },
    { label: 'Service Plan', date: client.servicePlanDate, form: 'CF04', next: client.servicePlanDate ? 'Within 7 days of start' : 'Due within 7 days of start', oar: 'OAR 333-536-0065' },
    { label: 'Service & Financial Agreement', date: client.serviceAgreementDate, form: 'CF05', next: client.serviceAgreementDate ? 'On file' : 'Required before service', oar: 'OAR 333-536-0085' },
    { label: 'Initial Visit (Day 7–30)', date: client.initialVisitDate, form: 'CF08', next: client.initialVisitDate ? 'Completed' : `Due between day 7–30 of start`, oar: 'OAR 333-536-0066' },
    { label: 'Quarterly Monitoring', date: client.lastMonitoringDate, form: 'CF09', next: client.lastMonitoringDate ? `Every 90 days` : 'Required', oar: 'OAR 333-536-0066' },
    { label: 'Self-Direction Assessment', date: client.lastSelfDirectionEvalDate, form: 'CF10', next: 'Every 90 days', oar: 'OAR 333-536-0045' },
  ];

  const allForms = [
    { id: 'CF01', label: 'Disclosure Statement', required: true },
    { id: 'CF02', label: 'Client Rights Notice', required: true },
    { id: 'CF03', label: 'Initial Assessment', required: true },
    { id: 'CF04', label: 'Service Plan', required: true },
    { id: 'CF05', label: 'Service & Financial Agreement', required: true },
    { id: 'CF06', label: 'Stable & Predictable Assessment', required: false },
    { id: 'CF07', label: 'End of Service Summary', required: false },
    { id: 'CF08', label: 'Initial Visit Record', required: true },
    { id: 'CF09', label: 'Quarterly Monitoring Visit', required: true },
    { id: 'CF10', label: 'Medication Self-Direction Assessment', required: client.canSelfDirect },
    { id: 'CF11', label: '90-Day Self-Direction Re-Evaluation', required: client.canSelfDirect },
  ];

  return (
    <Modal title={`Client File — ${client.name}`} onClose={onClose} size="xl">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-5 -mt-2">
        {([['overview', 'Overview', User], ['notices', `Notices ${alerts.length > 0 ? `(${alerts.length})` : ''}`, AlertTriangle], ['compliance', 'Compliance Status', Activity], ['forms', `Forms (${allForms.length})`, FileText]] as [Tab, string, React.ElementType][]).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Alert banner */}
      {alerts.filter(a => a.severity === 'red').length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-700">
            <strong>{alerts.filter(a => a.severity === 'red').length} urgent compliance item(s)</strong> require immediate attention.
          </div>
        </div>
      )}

      {/* OVERVIEW TAB */}
      {tab === 'overview' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="form-section">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Client Information</h3>
              <div className="space-y-2 text-sm">
                {[['DOB', format(parseISO(client.dob), 'MM/dd/yyyy')], ['Address', client.address], ['Phone', client.phone], ['Status', client.status], ['Location', client.location], ['Payer', client.payer], ['Start Date', format(parseISO(client.startDate), 'MM/dd/yyyy')]].map(([k, v]) => (
                  <div key={k} className="flex gap-2"><span className="text-slate-400 w-28 flex-shrink-0">{k}:</span><span className="text-slate-700 font-medium">{v}</span></div>
                ))}
              </div>
            </div>
            <div className="form-section">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Emergency Contact</h3>
              <div className="text-sm space-y-1">
                <div className="font-medium text-slate-700">{client.emergencyContact}</div>
                <div className="text-slate-500">{client.emergencyPhone}</div>
              </div>
            </div>
            <div className="form-section">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Assigned Caregivers</h3>
              <div className="space-y-1">
                {assignedCaregivers.length === 0 ? <span className="text-sm text-slate-400">None assigned</span> : assignedCaregivers.map(cg => (
                  <div key={cg.id} className="text-sm"><span className="font-medium text-slate-700">{cg.name}</span> <span className="text-slate-400">— {cg.classification}</span></div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="form-section">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Medical Information</h3>
              <div className="space-y-3 text-sm">
                <div><span className="text-slate-400">PCP:</span> <span className="font-medium ml-2">{client.pcp}</span> <span className="text-slate-400 ml-1">{client.pcpPhone}</span></div>
                <div><span className="text-slate-400">Hospital:</span> <span className="font-medium ml-2">{client.hospital}</span></div>
                <div><span className="text-slate-400">Fall Risk:</span> <span className={`ml-2 font-medium ${client.fallRisk === 'High' ? 'text-red-600' : client.fallRisk === 'Medium' ? 'text-amber-600' : 'text-green-600'}`}>{client.fallRisk}</span></div>
                <div><span className="text-slate-400">Self-Direct:</span> <span className="ml-2">{client.canSelfDirect ? '✓ Yes' : '✗ No'}</span></div>
                <div><span className="text-slate-400">Stable & Predictable:</span> <span className="ml-2">{client.stableAndPredictable ? '✓ Yes' : '✗ No'}</span></div>
              </div>
            </div>
            <div className="form-section">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Diagnoses</h3>
              <div className="flex flex-wrap gap-1">{client.diagnoses.map(d => <span key={d} className="badge-blue">{d}</span>)}</div>
            </div>
            <div className="form-section">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Allergies</h3>
              <div className="flex flex-wrap gap-1">{client.allergies.length === 0 ? <span className="text-sm text-slate-400">NKDA</span> : client.allergies.map(a => <span key={a} className="badge-red">{a}</span>)}</div>
            </div>
            <div className="form-section">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Current Medications</h3>
              <div className="space-y-0.5">{client.medications.map(m => <div key={m} className="text-sm text-slate-600">• {m}</div>)}</div>
            </div>
          </div>
        </div>
      )}

      {/* NOTICES TAB */}
      {tab === 'notices' && (
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-10 text-slate-400 flex flex-col items-center gap-3">
              <CheckCircle size={40} className="text-green-500" />
              <div>No compliance issues for this client.</div>
            </div>
          ) : alerts.map((alert, i) => (
            <div key={i} className={`border rounded-lg p-4 ${severityBg[alert.severity]}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {severityIcon[alert.severity]}
                  <div>
                    <div className={`text-sm font-semibold ${severityText[alert.severity]}`}>{alert.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{alert.oar}</div>
                  </div>
                </div>
                <button onClick={() => { setOpenForm(alert.formId); setTab('forms'); }} className="text-xs font-medium px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 whitespace-nowrap">
                  Complete Now →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* COMPLIANCE STATUS TAB */}
      {tab === 'compliance' && (
        <div className="space-y-2">
          {complianceItems.map(item => {
            const hasDate = !!item.date;
            return (
              <div key={item.form} className="flex items-center gap-4 p-3 border border-slate-200 rounded-lg">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${hasDate ? 'bg-green-100' : 'bg-red-100'}`}>
                  {hasDate ? <CheckCircle size={12} className="text-green-600" /> : <AlertTriangle size={12} className="text-red-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-700">{item.label}</div>
                  <div className="text-xs text-slate-400">{item.oar}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  {hasDate ? (
                    <div className="text-xs font-medium text-green-600">{format(parseISO(item.date!), 'MM/dd/yyyy')}</div>
                  ) : (
                    <div className="text-xs font-medium text-red-500">Not completed</div>
                  )}
                  <div className="text-xs text-slate-400">{item.next}</div>
                </div>
                <button onClick={() => { setOpenForm(item.form); setTab('forms'); }} className="text-xs font-medium px-2 py-1 bg-slate-100 rounded hover:bg-slate-200">
                  {hasDate ? 'View' : 'Complete'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* FORMS TAB */}
      {tab === 'forms' && (
        <ClientForms client={client} openForm={openForm} onClearForm={() => setOpenForm(null)} />
      )}
    </Modal>
  );
}
