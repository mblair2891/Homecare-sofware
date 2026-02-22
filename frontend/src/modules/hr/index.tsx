import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { differenceInDays, parseISO, format } from 'date-fns';
import { AlertTriangle, CheckCircle, FileText, Plus, Download } from 'lucide-react';
import Modal from '../../components/ui/Modal';

type HRTab = 'certifications' | 'oregonLaw' | 'incidents' | 'documents';

const oregonRules = [
  { rule: 'Paid Sick Leave', desc: 'Employees earn 1hr per 30hrs worked. Up to 40hrs/yr for employers <10, 40hrs+ for ≥10.', status: 'Compliant', oar: 'ORS 653.606' },
  { rule: 'Predictive Scheduling', desc: 'Employers ≥500 employees must provide 14-day advance schedules. Penalty pay for last-minute changes.', status: 'N/A — <500 employees', oar: 'ORS 653.450' },
  { rule: 'Oregon Minimum Wage', desc: 'Portland Metro: $15.45/hr. Standard: $14.20/hr. Non-urban: $13.20/hr (2026 rates).', status: 'Review Needed', oar: 'ORS 653.025' },
  { rule: 'Daily Overtime', desc: 'OT required after 10hrs in a workday at 1.5x rate.', status: 'Compliant', oar: 'ORS 653.261' },
  { rule: 'Weekly Overtime', desc: 'OT required after 40hrs in a workweek at 1.5x rate.', status: 'Compliant', oar: 'ORS 653.261' },
  { rule: 'Rest Periods', desc: '10-min rest per 4hrs worked. 30-min meal break for shifts >6hrs.', status: 'Compliant', oar: 'ORS 653.261' },
  { rule: 'Background Check (3yr renewal)', desc: 'All caregivers must have background check every 3 years per OAR 333-536-0093.', status: '1 Due Soon', oar: 'OAR 333-536-0093(13)' },
  { rule: 'LEIE Check (Annual)', desc: 'Query List of Excluded Individuals/Entities annually per OAR 333-536-0093(11).', status: 'Compliant', oar: 'OAR 333-536-0093(11)' },
  { rule: 'I-9 Verification', desc: 'Employment eligibility verification required for all employees.', status: 'Compliant', oar: '8 USC 1324a' },
];

const incidents = [
  { id: 'INC-001', date: '2026-02-10', client: 'Margaret Thompson', type: 'Fall', severity: 'Moderate', reporter: 'Maria Santos', status: 'Investigating', oar: 'OAR 333-536-0052(6)(h)' },
  { id: 'INC-002', date: '2026-01-25', client: 'Harold Jenkins', type: 'Medication Error', severity: 'Minor', reporter: 'James Wilson', status: 'Resolved', oar: 'OAR 333-536-0052(6)(h)' },
];

const documents = [
  { name: 'Employee Handbook 2026', type: 'Policy', date: '2026-01-01', status: 'Current' },
  { name: 'I-9 Form — Maria Santos', type: 'I-9', date: '2024-01-10', status: 'Current' },
  { name: 'I-9 Form — James Wilson', type: 'I-9', date: '2024-02-01', status: 'Current' },
  { name: 'I-9 Form — Angela Davis', type: 'I-9', date: '2024-03-01', status: 'Current' },
  { name: 'Workers Comp Certificate 2026', type: 'Insurance', date: '2026-01-01', status: 'Current' },
  { name: 'Agency Liability Insurance 2026', type: 'Insurance', date: '2026-01-01', status: 'Current' },
];

export default function HR() {
  const { caregivers } = useAppStore();
  const [tab, setTab] = useState<HRTab>('certifications');
  const [showNewIncident, setShowNewIncident] = useState(false);
  const today = new Date();

  const certStatus = caregivers.map(cg => {
    const bgExpired = cg.backgroundCheckDate && differenceInDays(today, parseISO(cg.backgroundCheckDate)) / 365 >= 3;
    const bgWarn = cg.backgroundCheckDate && differenceInDays(today, parseISO(cg.backgroundCheckDate)) / 365 >= 2.75;
    const licExpired = cg.licenseExpiry && differenceInDays(parseISO(cg.licenseExpiry), today) < 0;
    const licWarn = cg.licenseExpiry && differenceInDays(parseISO(cg.licenseExpiry), today) < 60;
    const trainExpired = cg.lastAnnualTrainingDate && differenceInDays(today, parseISO(cg.lastAnnualTrainingDate)) > 365;
    return { cg, bgExpired, bgWarn, licExpired, licWarn, trainExpired };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">HR & Compliance</h1>
          <p className="text-slate-500 text-sm">Oregon-specific labor law and agency compliance tracking</p>
        </div>
        <button onClick={() => setShowNewIncident(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Log Incident</button>
      </div>

      <div className="flex border-b border-slate-200">
        {([['certifications', 'Certification Tracker'], ['oregonLaw', 'Oregon Labor Law'], ['incidents', 'Incident Reports'], ['documents', 'Documents']] as [HRTab, string][]).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`px-4 py-3 text-sm font-medium border-b-2 ${tab === id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>{label}</button>
        ))}
      </div>

      {/* CERTIFICATION TRACKER */}
      {tab === 'certifications' && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Caregiver', 'Certifications', 'Background Check', 'LEIE Check', 'License Expiry', 'Annual Training', 'Overall'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {certStatus.map(({ cg, bgExpired, bgWarn, licExpired, licWarn, trainExpired }) => {
                const hasIssue = bgExpired || licExpired || trainExpired;
                const hasWarn = bgWarn || licWarn;
                return (
                  <tr key={cg.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-700">{cg.name}</div>
                      <div className="text-xs text-slate-400">{cg.classification}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">{cg.certifications.slice(0, 2).map(c => <span key={c} className="badge-blue">{c}</span>)}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {cg.backgroundCheckDate ? (
                        <span className={bgExpired ? 'text-red-600 font-medium' : bgWarn ? 'text-amber-600' : 'text-green-600'}>
                          {format(parseISO(cg.backgroundCheckDate), 'MM/dd/yy')}
                          {bgExpired && ' ❌'}{bgWarn && !bgExpired && ' ⚠'}
                        </span>
                      ) : <span className="text-red-500">Missing</span>}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {cg.leieCheckedDate ? <span className="text-green-600">{format(parseISO(cg.leieCheckedDate), 'MM/dd/yy')} ✓</span> : <span className="text-red-500">Missing</span>}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {cg.licenseExpiry ? (
                        <span className={licExpired ? 'text-red-600 font-medium' : licWarn ? 'text-amber-600' : 'text-green-600'}>
                          {format(parseISO(cg.licenseExpiry), 'MM/dd/yy')}
                          {licExpired && ' EXPIRED'}{licWarn && !licExpired && ' ⚠'}
                        </span>
                      ) : <span className="text-slate-400">N/A</span>}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {cg.lastAnnualTrainingDate ? (
                        <span className={trainExpired ? 'text-red-600 font-medium' : 'text-green-600'}>
                          {format(parseISO(cg.lastAnnualTrainingDate), 'MM/dd/yy')}{trainExpired && ' OVERDUE'}
                        </span>
                      ) : <span className="text-red-500">Missing</span>}
                    </td>
                    <td className="px-4 py-3">
                      {hasIssue ? <span className="badge-red flex items-center gap-1 w-fit"><AlertTriangle size={11} /> Action Needed</span> :
                        hasWarn ? <span className="badge-yellow">⚠ Review</span> :
                          <span className="badge-green flex items-center gap-1 w-fit"><CheckCircle size={11} /> OK</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* OREGON LAW */}
      {tab === 'oregonLaw' && (
        <div className="space-y-3">
          {oregonRules.map(rule => (
            <div key={rule.rule} className="card p-4 flex items-start gap-4">
              <div className={`w-2 h-full min-h-8 rounded-full flex-shrink-0 ${rule.status === 'Compliant' ? 'bg-green-500' : rule.status.includes('N/A') ? 'bg-slate-300' : 'bg-amber-400'}`} />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-slate-800">{rule.rule}</h3>
                  <span className="text-xs text-slate-400">{rule.oar}</span>
                </div>
                <p className="text-sm text-slate-600">{rule.desc}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded flex-shrink-0 ${rule.status === 'Compliant' ? 'bg-green-100 text-green-700' : rule.status.includes('N/A') ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-700'}`}>
                {rule.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* INCIDENTS */}
      {tab === 'incidents' && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['ID', 'Date', 'Client', 'Type', 'Severity', 'Reporter', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {incidents.map(inc => (
                <tr key={inc.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-mono text-slate-600">{inc.id}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{inc.date}</td>
                  <td className="px-4 py-3 text-sm font-medium">{inc.client}</td>
                  <td className="px-4 py-3 text-sm">{inc.type}</td>
                  <td className="px-4 py-3"><span className={inc.severity === 'Minor' ? 'badge-yellow' : 'badge-red'}>{inc.severity}</span></td>
                  <td className="px-4 py-3 text-sm text-slate-500">{inc.reporter}</td>
                  <td className="px-4 py-3"><span className={inc.status === 'Resolved' ? 'badge-green' : 'badge-yellow'}>{inc.status}</span></td>
                  <td className="px-4 py-3"><button className="text-sm text-blue-600 hover:text-blue-800">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* DOCUMENTS */}
      {tab === 'documents' && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Document', 'Type', 'Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.map(doc => (
                <tr key={doc.name} className="hover:bg-slate-50">
                  <td className="px-4 py-3"><div className="flex items-center gap-2 text-sm font-medium text-slate-700"><FileText size={14} className="text-slate-400" />{doc.name}</div></td>
                  <td className="px-4 py-3"><span className="badge-gray">{doc.type}</span></td>
                  <td className="px-4 py-3 text-sm text-slate-500">{doc.date}</td>
                  <td className="px-4 py-3"><span className="badge-green">{doc.status}</span></td>
                  <td className="px-4 py-3"><button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"><Download size={12} />Download</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showNewIncident && (
        <Modal title="Log Incident Report" onClose={() => setShowNewIncident(false)} size="md"
          footer={<><button className="btn-secondary" onClick={() => setShowNewIncident(false)}>Cancel</button><button className="btn-primary">Submit Report</button></>}>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700 mb-4">
            Per OAR 333-536-0052(6)(h), all adverse events must be investigated and documented. Abuse must be reported to ODHS/OHA/law enforcement immediately.
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Date & Time</label><input type="datetime-local" className="form-input" /></div>
            <div><label className="form-label">Client</label><select className="form-input"><option>Margaret Thompson</option><option>Harold Jenkins</option><option>Dorothy Williams</option><option>Frank Morales</option></select></div>
            <div><label className="form-label">Type</label><select className="form-input"><option>Fall</option><option>Medication Error</option><option>Client Injury</option><option>Caregiver Injury</option><option>Complaint/Grievance</option><option>Abuse Allegation</option><option>Property Damage</option><option>Other Adverse Event</option></select></div>
            <div><label className="form-label">Severity</label><select className="form-input"><option>Minor</option><option>Moderate</option><option>Major</option><option>Life-Threatening</option></select></div>
            <div><label className="form-label">Reported By</label><input className="form-input" /></div>
            <div><label className="form-label">Caregiver Present</label><input className="form-input" /></div>
            <div className="col-span-2"><label className="form-label">Description of Event</label><textarea className="form-input" rows={4} /></div>
            <div className="col-span-2"><label className="form-label">Immediate Actions Taken</label><textarea className="form-input" rows={3} /></div>
            <div className="col-span-2">
              <label className="form-label">Reporting Required</label>
              <div className="flex flex-col gap-1">
                {['Reported to ODHS Adult Protective Services', 'Reported to OHA', 'Reported to Law Enforcement', 'Client/Family Notified'].map(opt => (
                  <label key={opt} className="flex items-center gap-2 text-sm"><input type="checkbox" />{opt}</label>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
