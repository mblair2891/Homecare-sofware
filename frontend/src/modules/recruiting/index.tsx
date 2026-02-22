import React, { useState } from 'react';
import { UserPlus, Plus, Mail, Phone } from 'lucide-react';

type Stage = 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Onboarding';
const STAGES: Stage[] = ['Applied', 'Screening', 'Interview', 'Offer', 'Onboarding'];

const applicants = [
  { id: 'ap1', name: 'Sarah Johnson', position: 'Personal Care Aide', stage: 'Onboarding' as Stage, date: '2026-01-28', location: 'Portland', phone: '(503) 555-0401', email: 'sjohnson@email.com', source: 'Indeed' },
  { id: 'ap2', name: 'Michael Brown', position: 'Medication Aide', stage: 'Interview' as Stage, date: '2026-02-05', location: 'Portland', phone: '(503) 555-0402', email: 'mbrown@email.com', source: 'ZipRecruiter' },
  { id: 'ap3', name: 'Linda Garcia', position: 'Personal Care Aide', stage: 'Screening' as Stage, date: '2026-02-10', location: 'Eugene', phone: '(541) 555-0403', email: 'lgarcia@email.com', source: 'Indeed' },
  { id: 'ap4', name: 'David Lee', position: 'RN Care Coordinator', stage: 'Applied' as Stage, date: '2026-02-18', location: 'Salem', phone: '(503) 555-0404', email: 'dlee@email.com', source: 'LinkedIn' },
  { id: 'ap5', name: 'Patricia Wilson', position: 'Personal Care Aide', stage: 'Offer' as Stage, date: '2026-02-01', location: 'Portland', phone: '(503) 555-0405', email: 'pwilson@email.com', source: 'Referral' },
];

const jobPostings = [
  { title: 'Personal Care Aide', location: 'Portland', type: 'Full-Time', posted: '2026-02-01', applicants: 12, platforms: ['Indeed', 'ZipRecruiter'] },
  { title: 'Personal Care Aide (Bilingual Spanish)', location: 'Portland', type: 'Part-Time', posted: '2026-02-05', applicants: 4, platforms: ['Indeed'] },
  { title: 'Medication Aide', location: 'Portland', type: 'Full-Time', posted: '2026-02-08', applicants: 7, platforms: ['Indeed', 'ZipRecruiter', 'LinkedIn'] },
  { title: 'RN Care Coordinator', location: 'Salem', type: 'Full-Time', posted: '2026-02-12', applicants: 3, platforms: ['LinkedIn', 'Indeed'] },
];

const onboardingChecklist = [
  'Background check submitted (OAR 333-536-0093)',
  'LEIE check completed',
  'I-9 Employment Eligibility Verification',
  'W-4 tax withholding form',
  'Direct deposit enrollment',
  'Employee handbook signed',
  'Position description signed',
  'Driver license + auto insurance (if transporting)',
  'Agency orientation scheduled (≥4hrs required)',
  'Initial caregiver training scheduled (8hrs)',
  'CPR/First Aid certification',
  'Medication training (if applicable)',
];

const stageColor: Record<Stage, string> = {
  Applied: 'bg-slate-100', Screening: 'bg-blue-50', Interview: 'bg-purple-50', Offer: 'bg-amber-50', Onboarding: 'bg-green-50'
};
const stageBadge: Record<Stage, string> = {
  Applied: 'badge-gray', Screening: 'badge-blue', Interview: 'bg-purple-100 text-purple-700 px-2 py-0.5 text-xs font-medium rounded-full',
  Offer: 'badge-yellow', Onboarding: 'badge-green'
};

type RecTab = 'pipeline' | 'applicants' | 'postings' | 'onboarding';

export default function Recruiting() {
  const [tab, setTab] = useState<RecTab>('pipeline');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Recruiting</h1>
        <button className="btn-primary flex items-center gap-2"><Plus size={16} /> New Job Posting</button>
      </div>

      <div className="flex border-b border-slate-200">
        {([['pipeline', 'Kanban Pipeline'], ['applicants', 'Applicants'], ['postings', 'Job Postings'], ['onboarding', 'Onboarding Checklist']] as [RecTab, string][]).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`px-4 py-3 text-sm font-medium border-b-2 ${tab === id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>{label}</button>
        ))}
      </div>

      {/* KANBAN */}
      {tab === 'pipeline' && (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {STAGES.map(stage => {
            const stageApps = applicants.filter(a => a.stage === stage);
            return (
              <div key={stage} className="flex-1 min-w-48">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-700">{stage}</h3>
                  <span className="badge-gray">{stageApps.length}</span>
                </div>
                <div className="space-y-2">
                  {stageApps.map(app => (
                    <div key={app.id} className={`p-3 rounded-lg border border-slate-200 ${stageColor[stage]} cursor-pointer hover:shadow-sm transition-shadow`}>
                      <div className="font-medium text-sm text-slate-800">{app.name}</div>
                      <div className="text-xs text-slate-500">{app.position}</div>
                      <div className="text-xs text-slate-400 mt-1">{app.location} · {app.source}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* APPLICANTS TABLE */}
      {tab === 'applicants' && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Applicant', 'Position', 'Stage', 'Location', 'Applied', 'Source', 'Contact'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applicants.map(app => (
                <tr key={app.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-800">{app.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{app.position}</td>
                  <td className="px-4 py-3"><span className={stageBadge[app.stage]}>{app.stage}</span></td>
                  <td className="px-4 py-3 text-sm text-slate-500">{app.location}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{app.date}</td>
                  <td className="px-4 py-3 text-sm text-slate-400">{app.source}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <a href={`mailto:${app.email}`} className="text-blue-600 hover:text-blue-800"><Mail size={14} /></a>
                      <a href={`tel:${app.phone}`} className="text-blue-600 hover:text-blue-800"><Phone size={14} /></a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* JOB POSTINGS */}
      {tab === 'postings' && (
        <div className="space-y-3">
          {jobPostings.map(job => (
            <div key={job.title + job.location} className="card p-4 flex items-center gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800">{job.title}</h3>
                <div className="text-sm text-slate-500">{job.location} · {job.type} · Posted {job.posted}</div>
                <div className="flex gap-1 mt-1">{job.platforms.map(p => <span key={p} className="badge-gray">{p}</span>)}</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-blue-600">{job.applicants}</div>
                <div className="text-xs text-slate-400">applicants</div>
              </div>
              <button className="btn-secondary text-sm">Manage</button>
            </div>
          ))}
        </div>
      )}

      {/* ONBOARDING */}
      {tab === 'onboarding' && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            This checklist ensures all Oregon regulatory requirements are met before a new caregiver independently provides services (OAR 333-536-0070, 333-536-0093).
          </div>
          <div className="grid grid-cols-2 gap-3">
            {onboardingChecklist.map((item, i) => (
              <label key={i} className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input type="checkbox" className="mt-0.5 flex-shrink-0" />
                <span className="text-sm text-slate-700">{item}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
