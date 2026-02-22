import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { differenceInDays, parseISO, format, addDays } from 'date-fns';
import { Shield, AlertTriangle, CheckCircle, Clock, FileText } from 'lucide-react';

type CompTab = 'license' | 'servicePlans' | 'monitoring' | 'training' | 'criminal' | 'medication' | 'disclosure' | 'surveys' | 'qa' | 'violations';

const oarSections = [
  { id: 'license', label: 'License & Classification', oar: '333-536-0007, 0010, 0025' },
  { id: 'servicePlans', label: 'Service Plans', oar: '333-536-0045, 0065' },
  { id: 'monitoring', label: 'Monitoring Visits', oar: '333-536-0066' },
  { id: 'training', label: 'Training Requirements', oar: '333-536-0070' },
  { id: 'criminal', label: 'Criminal Records', oar: '333-536-0093' },
  { id: 'medication', label: 'Medication Services', oar: '333-536-0075' },
  { id: 'disclosure', label: 'Client Disclosures', oar: '333-536-0055, 0060' },
  { id: 'surveys', label: 'Surveys & POC', oar: '333-536-0041, 0117' },
  { id: 'qa', label: 'QA Meetings', oar: '333-536-0090' },
  { id: 'violations', label: 'Violations & Deficiencies', oar: '333-536-0033, 0110, 0125' },
];

const qaHistory = [
  { date: '2026-01-15', attendees: 'Jennifer Adams (Admin), Maria Santos (Caregiver), Angela Davis (RN)', topics: 'EVV compliance review, fall prevention protocol update, medication error review', status: 'Documented' },
  { date: '2025-10-20', attendees: 'Jennifer Adams (Admin), James Wilson (Caregiver)', topics: 'Infection control training, monitoring visit compliance', status: 'Documented' },
];

const surveyHistory = [
  { date: '2024-07-15', type: 'Biennial Licensing Survey', result: 'No Deficiencies', nextDue: '2026-07-15' },
  { date: '2024-03-10', type: 'Initial Licensing Survey', result: 'No Deficiencies', nextDue: 'N/A' },
];

export default function Compliance() {
  const { clients, caregivers, locations } = useAppStore();
  const [tab, setTab] = useState<CompTab>('license');
  const today = new Date();

  // Calculate overall compliance score
  let totalChecks = 0;
  let passedChecks = 0;

  clients.forEach(c => {
    totalChecks += 5;
    if (c.disclosureSignedDate) passedChecks++;
    if (c.rightsSignedDate) passedChecks++;
    if (c.servicePlanDate) passedChecks++;
    if (c.initialVisitDate) passedChecks++;
    if (c.lastMonitoringDate && differenceInDays(today, parseISO(c.lastMonitoringDate)) <= 90) passedChecks++;
  });
  caregivers.forEach(cg => {
    totalChecks += 3;
    if (cg.backgroundCheckDate && differenceInDays(today, parseISO(cg.backgroundCheckDate)) / 365 < 3) passedChecks++;
    if (cg.initialTrainingDate) passedChecks++;
    if (cg.lastAnnualTrainingDate && differenceInDays(today, parseISO(cg.lastAnnualTrainingDate)) <= 365) passedChecks++;
  });
  const score = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Oregon Regulatory Compliance</h1>
          <p className="text-slate-500 text-sm">OAR 333-536-0000 through 333-536-0125</p>
        </div>
        <div className="flex items-center gap-3 card px-4 py-3">
          <div className={`text-2xl font-bold ${score >= 90 ? 'text-green-600' : score >= 75 ? 'text-amber-500' : 'text-red-600'}`}>{score}%</div>
          <div><div className="text-xs font-semibold text-slate-600">Overall Compliance Score</div><div className="text-xs text-slate-400">{passedChecks}/{totalChecks} checks passed</div></div>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex flex-wrap gap-1">
        {oarSections.map(s => (
          <button key={s.id} onClick={() => setTab(s.id as CompTab)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${tab === s.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="text-xs text-slate-400 font-mono">
        {oarSections.find(s => s.id === tab)?.oar}
      </div>

      {/* LICENSE & CLASSIFICATION */}
      {tab === 'license' && (
        <div className="space-y-4">
          {locations.filter(l => l.status === 'Active').map(loc => {
            const daysToExpiry = loc.licenseExpiry ? differenceInDays(parseISO(loc.licenseExpiry), today) : null;
            return (
              <div key={loc.id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-800">{loc.name}</h3>
                    <div className="text-sm text-slate-500">{loc.type} · {loc.address}</div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${daysToExpiry !== null && daysToExpiry < 30 ? 'bg-red-100 text-red-700' : daysToExpiry !== null && daysToExpiry < 90 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                    License {daysToExpiry !== null ? `expires in ${daysToExpiry}d` : 'No expiry set'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-slate-400">License #:</span> <span className="font-medium ml-2">{loc.licenseNumber || 'Not issued'}</span></div>
                  <div><span className="text-slate-400">Classification:</span> <span className="font-medium ml-2">{loc.classification}</span></div>
                  <div><span className="text-slate-400">Expiry:</span> <span className="font-medium ml-2">{loc.licenseExpiry ? format(parseISO(loc.licenseExpiry), 'MM/dd/yyyy') : 'N/A'}</span></div>
                  <div><span className="text-slate-400">Administrator:</span> <span className="font-medium ml-2">{loc.administrator}</span></div>
                </div>
                <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
                  <strong>OAR 333-536-0025:</strong> License expires 12 months from issue. Renewal application due 30 days before expiry. License must be conspicuously posted (OAR 333-536-0021).
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SERVICE PLANS */}
      {tab === 'servicePlans' && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Client', 'Start Date', 'Service Plan Date', '7-Day Rule', 'Self-Direction', '90-Day Re-eval', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.filter(c => c.status === 'Active').map(c => {
                const planLate = c.startDate && c.servicePlanDate && differenceInDays(parseISO(c.servicePlanDate), parseISO(c.startDate)) > 7;
                const evalOverdue = c.canSelfDirect && c.lastSelfDirectionEvalDate && differenceInDays(today, parseISO(c.lastSelfDirectionEvalDate)) > 90;
                return (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{c.startDate ? format(parseISO(c.startDate), 'MM/dd/yy') : '—'}</td>
                    <td className="px-4 py-3 text-sm">{c.servicePlanDate ? format(parseISO(c.servicePlanDate), 'MM/dd/yy') : <span className="text-red-500">Missing</span>}</td>
                    <td className="px-4 py-3">
                      {!c.servicePlanDate ? <span className="badge-red">Missing</span> :
                        planLate ? <span className="badge-yellow">Late</span> :
                          <span className="badge-green">On Time</span>}
                    </td>
                    <td className="px-4 py-3 text-sm">{c.canSelfDirect ? '✓ Yes' : '✗ No'}</td>
                    <td className="px-4 py-3">
                      {!c.canSelfDirect ? <span className="text-xs text-slate-400">N/A</span> :
                        !c.lastSelfDirectionEvalDate ? <span className="badge-red">Missing</span> :
                          evalOverdue ? <span className="badge-red">Overdue</span> :
                            <span className="badge-green">{format(parseISO(c.lastSelfDirectionEvalDate!), 'MM/dd/yy')}</span>}
                    </td>
                    <td className="px-4 py-3">
                      {!c.servicePlanDate || evalOverdue ? <span className="badge-red flex items-center gap-1 w-fit"><AlertTriangle size={11} /> Action</span> :
                        <span className="badge-green flex items-center gap-1 w-fit"><CheckCircle size={11} /> OK</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MONITORING VISITS */}
      {tab === 'monitoring' && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Client', 'Start Date', 'Initial Visit (Day 7–30)', 'Last Monitoring', 'Next Due', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.filter(c => c.status === 'Active').map(c => {
                const daysSinceStart = c.startDate ? differenceInDays(today, parseISO(c.startDate)) : 0;
                const initMissed = !c.initialVisitDate && daysSinceStart > 30;
                const initWindow = !c.initialVisitDate && daysSinceStart >= 7 && daysSinceStart <= 30;
                const monDays = c.lastMonitoringDate ? differenceInDays(today, parseISO(c.lastMonitoringDate)) : null;
                const monOverdue = monDays !== null && monDays > 90;
                const nextDue = c.lastMonitoringDate ? format(addDays(parseISO(c.lastMonitoringDate), 90), 'MM/dd/yy') : 'Not set';
                return (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{c.startDate ? format(parseISO(c.startDate), 'MM/dd/yy') : '—'}</td>
                    <td className="px-4 py-3">
                      {c.initialVisitDate ? <span className="badge-green text-xs">{format(parseISO(c.initialVisitDate), 'MM/dd/yy')}</span> :
                        initMissed ? <span className="badge-red">Missed!</span> :
                          initWindow ? <span className="badge-blue">Window Open (Day {daysSinceStart})</span> :
                            <span className="badge-gray">Day {daysSinceStart}</span>}
                    </td>
                    <td className="px-4 py-3 text-sm">{c.lastMonitoringDate ? format(parseISO(c.lastMonitoringDate), 'MM/dd/yy') : <span className="text-slate-400">None</span>}</td>
                    <td className="px-4 py-3 text-sm">{nextDue}</td>
                    <td className="px-4 py-3">
                      {initMissed || monOverdue ? <span className="badge-red flex items-center gap-1 w-fit"><AlertTriangle size={11} /> Overdue</span> :
                        initWindow ? <span className="badge-blue">Action Needed</span> :
                          <span className="badge-green flex items-center gap-1 w-fit"><CheckCircle size={11} /> OK</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TRAINING */}
      {tab === 'training' && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            <strong>OAR 333-536-0070 Training Requirements Summary:</strong> Orientation ≥4hrs before first shift. Initial training: 2hrs before service + 6hrs within 120 days (8hrs total). Medication services: additional 4hrs. Annual training: 6hrs (+ 1hr for med caregivers). Competency evaluation required.
          </div>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['Caregiver', 'Orientation', 'Initial Training', 'Medication Training', 'Last Annual (6hr)', 'Next Annual Due', 'Compliant'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {caregivers.map(cg => {
                  const annualOverdue = cg.lastAnnualTrainingDate && differenceInDays(today, parseISO(cg.lastAnnualTrainingDate)) > 365;
                  const nextAnnual = cg.lastAnnualTrainingDate ? format(addDays(parseISO(cg.lastAnnualTrainingDate), 365), 'MM/dd/yy') : 'Not set';
                  const isMedCaregiver = cg.certifications.some(c => c.includes('Medication') || c === 'CNA' || c === 'RN');
                  return (
                    <tr key={cg.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-medium">{cg.name}</td>
                      <td className="px-4 py-3 text-sm">{cg.orientationDate ? <span className="text-green-600">{format(parseISO(cg.orientationDate), 'MM/dd/yy')} ✓</span> : <span className="text-red-500">Missing</span>}</td>
                      <td className="px-4 py-3 text-sm">{cg.initialTrainingDate ? <span className="text-green-600">{format(parseISO(cg.initialTrainingDate), 'MM/dd/yy')} ✓</span> : <span className="text-red-500">Missing</span>}</td>
                      <td className="px-4 py-3 text-sm">{!isMedCaregiver ? <span className="text-slate-400">N/A</span> : cg.medicationTrainedDate ? <span className="text-green-600">{format(parseISO(cg.medicationTrainedDate), 'MM/dd/yy')} ✓</span> : <span className="text-red-500">Required</span>}</td>
                      <td className="px-4 py-3 text-sm">{cg.lastAnnualTrainingDate ? <span className={annualOverdue ? 'text-red-600 font-medium' : 'text-green-600'}>{format(parseISO(cg.lastAnnualTrainingDate), 'MM/dd/yy')}{annualOverdue && ' OVERDUE'}</span> : <span className="text-red-500">Missing</span>}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{nextAnnual}</td>
                      <td className="px-4 py-3">
                        {annualOverdue || !cg.orientationDate || !cg.initialTrainingDate ? <span className="badge-red">No</span> : <span className="badge-green">Yes</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CRIMINAL RECORDS */}
      {tab === 'criminal' && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            <strong>OAR 333-536-0093:</strong> Background check required before hire. Must renew every 3 years. LEIE check required per §(11). Medicaid clients: ODHS BCU check required. Weighing test policy required for non-disqualifying convictions.
          </div>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['Caregiver', 'Background Check Date', '3yr Renewal Due', 'LEIE Check', 'Fitness Determination', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {caregivers.map(cg => {
                  const bgYears = cg.backgroundCheckDate ? differenceInDays(today, parseISO(cg.backgroundCheckDate)) / 365 : null;
                  const renewalDue = cg.backgroundCheckDate ? format(addDays(parseISO(cg.backgroundCheckDate), 1095), 'MM/dd/yy') : 'Not set';
                  return (
                    <tr key={cg.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-medium">{cg.name}</td>
                      <td className="px-4 py-3 text-sm">{cg.backgroundCheckDate ? format(parseISO(cg.backgroundCheckDate), 'MM/dd/yy') : <span className="text-red-500">Missing</span>}</td>
                      <td className="px-4 py-3 text-sm">{renewalDue}</td>
                      <td className="px-4 py-3 text-sm">{cg.leieCheckedDate ? <span className="text-green-600">{format(parseISO(cg.leieCheckedDate), 'MM/dd/yy')} ✓</span> : <span className="text-red-500">Missing</span>}</td>
                      <td className="px-4 py-3"><span className="badge-green">Approved</span></td>
                      <td className="px-4 py-3">
                        {!cg.backgroundCheckDate || !cg.leieCheckedDate || (bgYears !== null && bgYears >= 3) ? <span className="badge-red">Action Needed</span> : bgYears !== null && bgYears >= 2.75 ? <span className="badge-yellow">Renewal Soon</span> : <span className="badge-green">Compliant</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QA MEETINGS */}
      {tab === 'qa' && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            <strong>OAR 333-536-0090:</strong> QA committee must include admin staff + caregiver + RN (if Intermediate/Comprehensive). Must meet and document at least quarterly. Minutes must include adverse events, quality indicators, and preventive strategies.
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">Next QA meeting due: <span className="font-semibold text-amber-600">April 15, 2026</span></div>
            <button className="btn-primary flex items-center gap-2"><FileText size={14} /> Log QA Meeting</button>
          </div>
          <div className="space-y-3">
            {qaHistory.map((qa, i) => (
              <div key={i} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-slate-800">QA Meeting — {qa.date}</h3>
                  <span className="badge-green">{qa.status}</span>
                </div>
                <div className="text-sm text-slate-600 mb-1"><strong>Attendees:</strong> {qa.attendees}</div>
                <div className="text-sm text-slate-600"><strong>Topics:</strong> {qa.topics}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SURVEYS */}
      {tab === 'surveys' && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            <strong>OAR 333-536-0041:</strong> Initial survey before services. Biennial survey every 2 years. 72-hour advance notice required. Exit conference required. POC must be submitted within 10 business days of exit conference, corrections within 60 days.
          </div>
          <div className="space-y-3">
            {surveyHistory.map((sv, i) => (
              <div key={i} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-slate-800">{sv.type} — {sv.date}</h3>
                  <span className="badge-green">{sv.result}</span>
                </div>
                {sv.nextDue !== 'N/A' && <div className="text-sm text-slate-500">Next survey due: <span className="font-medium">{sv.nextDue}</span></div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Placeholder tabs */}
      {['medication', 'disclosure', 'violations'].includes(tab) && (
        <div className="card p-8 text-center text-slate-500">
          <Shield size={40} className="mx-auto text-slate-300 mb-3" />
          <div className="font-medium">Compliance tracking for {oarSections.find(s => s.id === tab)?.label}</div>
          <div className="text-sm mt-1">All requirements mapped to {oarSections.find(s => s.id === tab)?.oar}</div>
        </div>
      )}
    </div>
  );
}
