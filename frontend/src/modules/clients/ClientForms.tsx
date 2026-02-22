import React, { useState, useEffect } from 'react';
import { Client } from '../../store/useAppStore';
import { format } from 'date-fns';
import { Printer, Save, FileText } from 'lucide-react';

const FORMS = [
  { id: 'CF01', label: 'CF01 — Client Disclosure Statement', oar: 'OAR 333-536-0055(3)', icon: '📄' },
  { id: 'CF02', label: 'CF02 — Client Rights Notice', oar: 'OAR 333-536-0060', icon: '⚖️' },
  { id: 'CF03', label: 'CF03 — Initial Client Assessment', oar: 'OAR 333-536-0065', icon: '🩺' },
  { id: 'CF04', label: 'CF04 — Service Plan', oar: 'OAR 333-536-0065', icon: '📋' },
  { id: 'CF05', label: 'CF05 — Service & Financial Agreement', oar: 'OAR 333-536-0085', icon: '💼' },
  { id: 'CF06', label: 'CF06 — Stable & Predictable Assessment', oar: 'OAR 333-536-0055(4)', icon: '🏥' },
  { id: 'CF07', label: 'CF07 — End of Service Summary', oar: 'OAR 333-536-0085', icon: '📁' },
  { id: 'CF08', label: 'CF08 — Initial Visit Record (Day 7–30)', oar: 'OAR 333-536-0066', icon: '🏠' },
  { id: 'CF09', label: 'CF09 — Quarterly Monitoring Visit', oar: 'OAR 333-536-0066', icon: '📅' },
  { id: 'CF10', label: 'CF10 — Medication Self-Direction Assessment', oar: 'OAR 333-536-0045', icon: '💊' },
  { id: 'CF11', label: 'CF11 — 90-Day Self-Direction Re-Evaluation', oar: 'OAR 333-536-0045(5)', icon: '🔄' },
];

function PrintSaveBar({ onPrint }: { onPrint: () => void }) {
  return (
    <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200">
      <button onClick={onPrint} className="btn-secondary flex items-center gap-2"><Printer size={14} /> Print / Save PDF</button>
      <button className="btn-primary flex items-center gap-2"><Save size={14} /> Save to Record</button>
    </div>
  );
}

function FormField({ label, value, type = 'text', options }: { label: string; value?: string; type?: string; options?: string[] }) {
  if (type === 'select' && options) return (
    <div>
      <label className="form-label">{label}</label>
      <select className="form-input" defaultValue={value}>{options.map(o => <option key={o}>{o}</option>)}</select>
    </div>
  );
  if (type === 'textarea') return (
    <div>
      <label className="form-label">{label}</label>
      <textarea className="form-input" rows={3} defaultValue={value} />
    </div>
  );
  return (
    <div>
      <label className="form-label">{label}</label>
      <input className="form-input" type={type} defaultValue={value} />
    </div>
  );
}

function CF01({ client }: { client: Client }) {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
        Required per OAR 333-536-0055(3) — must be signed before services begin.
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Client Name" value={client.name} />
        <FormField label="Date" value={format(new Date(), 'yyyy-MM-dd')} type="date" />
        <FormField label="Agency Name" value="CareAxis Home Care" />
        <FormField label="License Classification" value={client.classification} type="select" options={['Limited', 'Basic', 'Intermediate', 'Comprehensive']} />
        <FormField label="Agency License Number" value="IHC-2024-001" />
        <FormField label="Services Offered" type="select" options={['Personal Care', 'Personal Care + Medication Reminding', 'Personal Care + Medication Assistance', 'Personal Care + Medication Administration', 'Personal Care + Nursing Services']} />
      </div>
      <div>
        <label className="form-label">Services Description (per OAR 333-536-0045)</label>
        <textarea className="form-input" rows={4} defaultValue="Services include personal care tasks including bathing, grooming, dressing, toileting, mobility, nutrition/hydration, medication reminding, and housekeeping as specified in the client's service plan." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Hourly Rate" value="$28.00" />
        <FormField label="Minimum Hours Per Visit" value="2 hours" />
        <FormField label="Billing Frequency" type="select" options={['Weekly', 'Bi-Weekly', 'Monthly']} />
        <FormField label="Payment Due Date" type="select" options={['Upon Receipt', 'Net 15', 'Net 30']} />
        <FormField label="Deposit Amount" value="$0" />
        <FormField label="Cancellation Policy" value="24-hour notice required" />
      </div>
      <div>
        <label className="form-label">Termination of Services Policy (OAR 333-536-0060(1)(m))</label>
        <textarea className="form-input" rows={3} defaultValue="Agency provides 30-day written notice of termination except in cases of immediate safety concerns (immediate oral/written) or non-payment (48-hour written)." />
      </div>
      <div>
        <label className="form-label">Administrator / Designee Contact During Service Hours</label>
        <input className="form-input" defaultValue="(503) 555-1000 — Available 24/7 for emergencies" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">Client / Representative Signature</label>
          <input className="form-input" placeholder="Signature" />
        </div>
        <FormField label="Date Signed" value={format(new Date(), 'yyyy-MM-dd')} type="date" />
        <div>
          <label className="form-label">Agency Representative Signature</label>
          <input className="form-input" placeholder="Signature" />
        </div>
        <FormField label="Title" value="Administrator" />
      </div>
      <PrintSaveBar onPrint={() => window.print()} />
    </div>
  );
}

function CF02({ client }: { client: Client }) {
  const rights = [
    'The right to be treated with dignity and respect',
    'The right to be free from theft, damage, or misuse of personal property',
    'The right to informed choice and opportunity to select or refuse service',
    'The right to be free from neglect, verbal, mental, emotional, physical, or sexual abuse',
    'The right to be free from financial exploitation',
    'The right to be free from physical and chemical restraints',
    'The right to voice grievances or complaints without discrimination or reprisal',
    'The right to be free from discrimination (race, ethnicity, gender, disability, religion, etc.)',
    'The right to participate in planning services and any changes to services',
    'The right to access his/her client record',
    'The right to have records confidentially maintained',
    'The right to written notice of charges before care begins',
    'The right to 30-day written notice of termination (or immediate in safety emergencies, 48-hour for non-payment)',
  ];
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
        Required per OAR 333-536-0060(2) — must be provided as part of the disclosure statement before care.
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Client Name" value={client.name} />
        <FormField label="Date" value={format(new Date(), 'yyyy-MM-dd')} type="date" />
      </div>
      <div>
        <label className="form-label">Client Rights (initial each right)</label>
        <div className="space-y-2 mt-2">
          {rights.map((right, i) => (
            <div key={i} className="flex items-start gap-3 p-2 border border-slate-200 rounded">
              <input type="text" className="w-16 px-2 py-1 border border-slate-300 rounded text-center text-sm flex-shrink-0" placeholder="Initials" />
              <span className="text-sm text-slate-700">{i + 1}. {right}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="form-section">
        <h3 className="text-sm font-semibold mb-2">Grievance Procedures (OAR 333-536-0060(2)(a))</h3>
        <textarea className="form-input" rows={3} defaultValue="To file a grievance with the agency: contact your agency administrator at (503) 555-1000 or submit in writing to 100 SW Broadway, Portland, OR 97201." />
      </div>
      <div className="form-section">
        <h3 className="text-sm font-semibold mb-2">State Complaint Procedures (OAR 333-536-0060(2)(b))</h3>
        <div className="text-sm text-slate-600">Oregon Health Authority, Public Health Division<br/>500 Summer St NE, Salem, OR 97301<br/>Phone: 971-673-0540</div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="form-label">Client / Representative Signature</label><input className="form-input" placeholder="Signature" /></div>
        <FormField label="Date" value={format(new Date(), 'yyyy-MM-dd')} type="date" />
      </div>
      <PrintSaveBar onPrint={() => window.print()} />
    </div>
  );
}

function CF03({ client }: { client: Client }) {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
        Initial evaluation required per OAR 333-536-0065(2) — must be dated and signed by evaluator.
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Client Name" value={client.name} />
        <FormField label="DOB" value={client.dob} type="date" />
        <FormField label="Assessment Date" value={format(new Date(), 'yyyy-MM-dd')} type="date" />
        <FormField label="Assessed By" value="Jennifer Adams — Administrator" />
      </div>
      <div className="form-section">
        <h3 className="text-sm font-semibold mb-3">Activities of Daily Living (ADLs)</h3>
        <div className="space-y-2">
          {['Bathing', 'Personal Grooming & Hygiene', 'Dressing', 'Toileting & Elimination', 'Mobility & Movement', 'Nutrition/Hydration & Feeding', 'Foot/Nail Care'].map(adl => (
            <div key={adl} className="flex items-center gap-4">
              <span className="text-sm text-slate-700 w-48">{adl}</span>
              <select className="form-input flex-1">
                <option>Independent</option>
                <option>Minimal Assistance</option>
                <option>Moderate Assistance</option>
                <option>Maximum Assistance</option>
                <option>Total Dependence</option>
                <option>Not Applicable</option>
              </select>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="form-section">
          <h3 className="text-sm font-semibold mb-2">Physical Status</h3>
          <div className="space-y-2">
            <FormField label="Fall Risk" value={client.fallRisk} type="select" options={['Low', 'Medium', 'High']} />
            <FormField label="Mobility Aids" type="select" options={['None', 'Cane', 'Walker', 'Wheelchair', 'Hoyer Lift']} />
            <div><label className="form-label">Diagnoses</label><textarea className="form-input" rows={2} defaultValue={client.diagnoses.join(', ')} /></div>
            <div><label className="form-label">Allergies</label><textarea className="form-input" rows={2} defaultValue={client.allergies.join(', ')} /></div>
          </div>
        </div>
        <div className="form-section">
          <h3 className="text-sm font-semibold mb-2">Cognitive / Emotional Status</h3>
          <div className="space-y-2">
            <FormField label="Orientation" type="select" options={['Oriented x4', 'Oriented x3', 'Oriented x2', 'Oriented x1', 'Disoriented']} />
            <FormField label="Memory" type="select" options={['Intact', 'Mild Impairment', 'Moderate Impairment', 'Severe Impairment']} />
            <FormField label="Communication" type="select" options={['Clear', 'Impaired — Language', 'Impaired — Hearing', 'Non-verbal']} />
            <FormField label="Behavioral Concerns" type="textarea" />
          </div>
        </div>
      </div>
      <div className="form-section">
        <h3 className="text-sm font-semibold mb-2">Stable & Predictable Determination (OAR 333-536-0005(42))</h3>
        <div className="flex gap-4 mb-2">
          <label className="flex items-center gap-2 text-sm"><input type="radio" name="stable" defaultChecked /> Yes — client's condition is stable and predictable</label>
          <label className="flex items-center gap-2 text-sm"><input type="radio" name="stable" /> No — requires referral</label>
        </div>
        <FormField label="Clinical Basis for Determination" type="textarea" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="form-label">Evaluator Signature</label><input className="form-input" placeholder="Signature" /></div>
        <FormField label="Date" value={format(new Date(), 'yyyy-MM-dd')} type="date" />
      </div>
      <PrintSaveBar onPrint={() => window.print()} />
    </div>
  );
}

function CF04({ client }: { client: Client }) {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
        Service Plan required within 7 days of start per OAR 333-536-0065(3). Must be reviewed with caregiver before first visit.
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Client Name" value={client.name} />
        <FormField label="DOB" value={client.dob} type="date" />
        <FormField label="Address" value={client.address} />
        <FormField label="Phone" value={client.phone} />
        <FormField label="Primary Care Provider" value={client.pcp} />
        <FormField label="PCP Phone" value={client.pcpPhone} />
        <FormField label="Plan Start Date" value={format(new Date(), 'yyyy-MM-dd')} type="date" />
        <FormField label="Classification Level" value={client.classification} type="select" options={['Limited', 'Basic', 'Intermediate', 'Comprehensive']} />
      </div>
      <div className="form-section">
        <h3 className="text-sm font-semibold mb-2">Medical Conditions</h3>
        <textarea className="form-input" rows={2} defaultValue={client.diagnoses.join(', ')} />
      </div>
      <div className="form-section">
        <h3 className="text-sm font-semibold mb-3">Services to be Provided (OAR 333-536-0065(4)(c))</h3>
        <div className="space-y-2">
          {['Bathing', 'Grooming/Hygiene', 'Dressing', 'Toileting', 'Mobility/Transfers', 'Meal Preparation/Feeding', 'Medication Reminding', 'Medication Assistance', 'Medication Administration', 'Housekeeping', 'Laundry', 'Shopping/Errands', 'Transportation'].map(svc => (
            <label key={svc} className="flex items-center gap-3 text-sm">
              <input type="checkbox" className="w-4 h-4" />
              <span>{svc}</span>
              <input className="flex-1 px-2 py-0.5 border border-slate-200 rounded text-xs" placeholder="Special instructions..." />
            </label>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Scheduled Hours Per Month (range)" value="80–120 hours" />
        <FormField label="Visit Frequency" value="Daily" type="select" options={['Daily', '5x/week', '3x/week', '2x/week', 'Weekly', 'As needed']} />
      </div>
      <div className="form-section">
        <h3 className="text-sm font-semibold mb-2">Special Instructions / Allergies</h3>
        <textarea className="form-input" rows={3} defaultValue={`Allergies: ${client.allergies.join(', ') || 'NKDA'}. Fall risk: ${client.fallRisk}.`} />
      </div>
      <div className="form-section">
        <h3 className="text-sm font-semibold mb-3">Caregiver Pre-Service Review Sign-Off (OAR 333-536-0065(5))</h3>
        <p className="text-xs text-slate-500 mb-2">Each caregiver must review and sign before first visit with this client.</p>
        {['Maria Santos', 'James Wilson'].map(cg => (
          <div key={cg} className="flex items-center gap-4 mb-2 p-2 border border-slate-200 rounded">
            <span className="text-sm flex-1">{cg}</span>
            <input type="text" className="px-2 py-1 border rounded text-sm w-36" placeholder="Signature" />
            <input type="date" className="form-input w-36" defaultValue={format(new Date(), 'yyyy-MM-dd')} />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="form-label">Client / Representative Signature</label><input className="form-input" placeholder="Signature" /></div>
        <FormField label="Date" value={format(new Date(), 'yyyy-MM-dd')} type="date" />
        <div><label className="form-label">Administrator Signature</label><input className="form-input" placeholder="Signature" /></div>
        <FormField label="Date" value={format(new Date(), 'yyyy-MM-dd')} type="date" />
      </div>
      <PrintSaveBar onPrint={() => window.print()} />
    </div>
  );
}

function CF08({ client }: { client: Client }) {
  const checklist = [
    'Appropriate and safe techniques used in provision of care',
    'Service plan has been followed as written',
    'Service plan is meeting the client\'s needs',
    'Caregiver has received sufficient training for this client',
    'Client is satisfied with the caregiver relationship',
    'Follow-up is necessary for any identified issues',
    'Any adverse events, complaints or grievances since start',
    'Any changes in client\'s health, behavior, or environment',
  ];
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
        Initial visit required between Day 7 and Day 30 of service per OAR 333-536-0066(1)(a).
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Client Name" value={client.name} />
        <FormField label="Visit Date" value={format(new Date(), 'yyyy-MM-dd')} type="date" />
        <FormField label="Visit Start Date" value={client.startDate} type="date" />
        <FormField label="Day of Service (must be 7–30)" value="14" />
        <FormField label="Visit Conducted By" value="Jennifer Adams — Administrator" />
        <FormField label="Visit Method" type="select" options={['In-Person (Required)', 'Phone (special circumstances only)', 'Video (special circumstances only)']} />
        <FormField label="Caregiver Present" type="select" options={['Yes', 'No']} />
        <FormField label="Caregiver Name if Present" />
      </div>
      <div className="form-section">
        <h3 className="text-sm font-semibold mb-3">Monitoring Checklist (OAR 333-536-0066(4))</h3>
        <div className="space-y-3">
          {checklist.map((item, i) => (
            <div key={i} className="p-3 border border-slate-200 rounded-lg">
              <div className="flex items-start gap-3 mb-2">
                <span className="text-xs font-bold text-slate-400 w-5 flex-shrink-0">{i + 1}.</span>
                <span className="text-sm text-slate-700 flex-1">{item}</span>
                <div className="flex gap-3 flex-shrink-0">
                  <label className="flex items-center gap-1 text-xs"><input type="radio" name={`q${i}`} value="yes" /> Yes</label>
                  <label className="flex items-center gap-1 text-xs"><input type="radio" name={`q${i}`} value="no" /> No</label>
                  <label className="flex items-center gap-1 text-xs"><input type="radio" name={`q${i}`} value="na" /> N/A</label>
                </div>
              </div>
              <textarea className="form-input text-xs" rows={2} placeholder="Narrative comments required per OAR 333-536-0066(5)..." />
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="form-label">Administrator/Designee Signature</label><input className="form-input" placeholder="Signature" /></div>
        <FormField label="Date" value={format(new Date(), 'yyyy-MM-dd')} type="date" />
        <div><label className="form-label">Client Signature</label><input className="form-input" placeholder="Signature" /></div>
        <FormField label="Date" value={format(new Date(), 'yyyy-MM-dd')} type="date" />
      </div>
      <PrintSaveBar onPrint={() => window.print()} />
    </div>
  );
}

function CF09({ client }: { client: Client }) {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
        Quarterly monitoring required per OAR 333-536-0066(1)(b). In-person required at least every 6 months.
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Client Name" value={client.name} />
        <FormField label="Visit Date" value={format(new Date(), 'yyyy-MM-dd')} type="date" />
        <FormField label="Visit Method" type="select" options={['In-Person', 'Phone (justified below)', 'Video (justified below)']} />
        <FormField label="Last In-Person Visit Date" value={client.lastMonitoringDate} type="date" />
        <FormField label="Conducted By" value="Jennifer Adams — Administrator" />
        <FormField label="Caregiver Present" type="select" options={['Yes', 'No']} />
      </div>
      <div className="form-section">
        <h3 className="text-sm font-semibold mb-2">Justification for Non-In-Person Visit (if applicable)</h3>
        <select className="form-input mb-2"><option>N/A — In-person visit</option><option>Impending discharge</option><option>Relocation to facility</option><option>Minimal services causing financial burden</option><option>Client requested non-in-person</option><option>Other circumstances (documented below)</option></select>
        <textarea className="form-input" rows={2} placeholder="Document circumstances if not in-person..." />
      </div>
      <div className="form-section">
        <h3 className="text-sm font-semibold mb-3">Monitoring Items (OAR 333-536-0066(4))</h3>
        {['Appropriate and safe care techniques used', 'Service plan followed as written', 'Service plan meeting client needs', 'Caregiver has sufficient training', 'Client satisfied with caregiver relationship', 'Follow-up necessary for any issues', 'Adverse events/complaints/grievances since last visit', 'Changes in health, behavior, or environment'].map((item, i) => (
          <div key={i} className="mb-3 p-3 border border-slate-100 rounded">
            <div className="flex items-start gap-3 mb-1">
              <span className="text-sm text-slate-700 flex-1">{item}</span>
              <div className="flex gap-3">
                {['Yes', 'No', 'N/A'].map(opt => <label key={opt} className="flex items-center gap-1 text-xs"><input type="radio" name={`mq${i}`} /> {opt}</label>)}
              </div>
            </div>
            <textarea className="form-input text-xs" rows={2} placeholder="Client narrative / notes..." />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="form-label">Administrator/Designee Signature</label><input className="form-input" placeholder="Signature" /></div>
        <FormField label="Date" value={format(new Date(), 'yyyy-MM-dd')} type="date" />
        <div><label className="form-label">Client Signature</label><input className="form-input" placeholder="Signature" /></div>
        <FormField label="Date" value={format(new Date(), 'yyyy-MM-dd')} type="date" />
      </div>
      <PrintSaveBar onPrint={() => window.print()} />
    </div>
  );
}

function CF10({ client }: { client: Client }) {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
        Required per OAR 333-536-0045(4) before medication assistance begins. Client must be able to self-direct.
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Client Name" value={client.name} />
        <FormField label="Assessment Date" value={format(new Date(), 'yyyy-MM-dd')} type="date" />
        <FormField label="Assessed By" value="Jennifer Adams — Administrator" />
        <FormField label="Next Re-Evaluation Due" value={format(new Date(Date.now() + 90 * 86400000), 'yyyy-MM-dd')} type="date" />
      </div>
      <div className="form-section">
        <h3 className="text-sm font-semibold mb-3">Medication Knowledge Assessment (per OAR 333-536-0045(4)(a))</h3>
        <p className="text-xs text-slate-500 mb-3">For each medication, client must demonstrate knowledge of all four criteria.</p>
        {client.medications.map((med, i) => (
          <div key={i} className="mb-4 p-3 border border-slate-200 rounded-lg">
            <div className="font-medium text-sm text-slate-700 mb-2">💊 {med}</div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="form-label">Reason for medication</label><input className="form-input" placeholder="Client states reason..." /></div>
              <div><label className="form-label">Dosage / Amount</label><input className="form-input" placeholder="Client states dose..." /></div>
              <div><label className="form-label">Route of administration</label><input className="form-input" placeholder="Oral, topical, etc..." /></div>
              <div><label className="form-label">Time of day</label><input className="form-input" placeholder="Morning, evening, etc..." /></div>
            </div>
            <div className="mt-2 flex gap-4">
              <label className="flex items-center gap-2 text-sm"><input type="radio" name={`self${i}`} defaultChecked /> Client demonstrates self-direction for this medication</label>
              <label className="flex items-center gap-2 text-sm"><input type="radio" name={`self${i}`} /> Client CANNOT self-direct — escalation required</label>
            </div>
          </div>
        ))}
      </div>
      <div className="form-section">
        <h3 className="text-sm font-semibold mb-2">Overall Self-Direction Determination</h3>
        <div className="flex gap-4 mb-2">
          <label className="flex items-center gap-2 text-sm"><input type="radio" name="overall" defaultChecked /> Client CAN self-direct — medication assistance authorized</label>
          <label className="flex items-center gap-2 text-sm"><input type="radio" name="overall" /> Client CANNOT self-direct — refer to higher classification or medication administration</label>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="form-label">Client Signature</label><input className="form-input" placeholder="Signature" /></div>
        <FormField label="Date" value={format(new Date(), 'yyyy-MM-dd')} type="date" />
        <div><label className="form-label">Administrator/Designee Signature</label><input className="form-input" placeholder="Signature" /></div>
        <FormField label="Date" value={format(new Date(), 'yyyy-MM-dd')} type="date" />
      </div>
      <PrintSaveBar onPrint={() => window.print()} />
    </div>
  );
}

function GenericForm({ client, formId }: { client: Client; formId: string }) {
  return (
    <div className="space-y-4">
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <h3 className="font-semibold text-slate-700 mb-1">{FORMS.find(f => f.id === formId)?.label}</h3>
        <p className="text-sm text-slate-500">Pre-populated with {client.name}'s data. Complete all fields below.</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Client Name" value={client.name} />
        <FormField label="Date" value={format(new Date(), 'yyyy-MM-dd')} type="date" />
        <FormField label="Completed By" value="Jennifer Adams — Administrator" />
      </div>
      <FormField label="Notes / Narrative" type="textarea" />
      <div className="grid grid-cols-2 gap-4">
        <div><label className="form-label">Signature</label><input className="form-input" placeholder="Signature" /></div>
        <FormField label="Date" value={format(new Date(), 'yyyy-MM-dd')} type="date" />
      </div>
      <PrintSaveBar onPrint={() => window.print()} />
    </div>
  );
}

const formComponents: Record<string, React.ComponentType<{ client: Client }>> = {
  CF01: CF01, CF02: CF02, CF03: CF03, CF04: CF04,
  CF08: CF08, CF09: CF09, CF10: CF10,
};

export default function ClientForms({ client, openForm, onClearForm }: { client: Client; openForm: string | null; onClearForm: () => void }) {
  const [activeForm, setActiveForm] = useState<string | null>(openForm);

  useEffect(() => { if (openForm) setActiveForm(openForm); }, [openForm]);

  if (activeForm) {
    const FormComp = formComponents[activeForm];
    const formMeta = FORMS.find(f => f.id === activeForm);
    return (
      <div>
        <button onClick={() => { setActiveForm(null); onClearForm(); }} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mb-4 font-medium">
          ← Back to {client.name}'s Forms
        </button>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">{formMeta?.label}</h3>
        <div className="text-xs text-slate-400 mb-4">{formMeta?.oar}</div>
        {FormComp ? <FormComp client={client} /> : <GenericForm client={client} formId={activeForm} />}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {FORMS.map(form => (
        <button
          key={form.id}
          onClick={() => setActiveForm(form.id)}
          className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 text-left transition-all"
        >
          <span className="text-2xl">{form.icon}</span>
          <div>
            <div className="font-medium text-slate-800 text-sm">{form.label}</div>
            <div className="text-xs text-slate-400 mt-0.5">{form.oar}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
