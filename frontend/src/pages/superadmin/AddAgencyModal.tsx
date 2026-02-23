import React, { useState } from 'react';
import {
  X, Shield, Building2, Users, Briefcase, Settings,
  CheckCircle, AlertTriangle, Loader, ChevronRight, ChevronLeft,
  CheckSquare, Square,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

export type Classification = 'Limited' | 'Basic' | 'Intermediate' | 'Comprehensive';
export type AgencyPlan = 'Trial' | 'Starter' | 'Professional' | 'Enterprise';

export interface NewAgencyData {
  // Company
  companyName: string;
  // License
  state: string;
  licenseNumber: string;
  licenseStatus: string;
  licenseExpiry: string;
  licenseIssuedDate: string;
  licenseVerified: boolean;
  // Profile
  legalName: string;
  dbaName: string;
  classification: Classification;
  taxId: string;
  npiNumber: string;
  medicareProviderNumber: string;
  medicaidProviderNumber: string;
  medicareCertified: boolean;
  medicaidCertified: boolean;
  // Address
  physicalAddress: string;
  physicalCity: string;
  physicalState: string;
  physicalZip: string;
  physicalCounty: string;
  sameMailingAddress: boolean;
  mailingAddress: string;
  mailingCity: string;
  mailingZip: string;
  agencyPhone: string;
  agencyFax: string;
  agencyEmail: string;
  website: string;
  // Contacts
  adminName: string;
  adminTitle: string;
  adminEmail: string;
  adminPhone: string;
  adminCell: string;
  sameBillingContact: boolean;
  billingName: string;
  billingEmail: string;
  billingPhone: string;
  afterHoursName: string;
  afterHoursPhone: string;
  // Services
  serviceCounties: string[];
  servicesOffered: string[];
  payerTypes: string[];
  languages: string[];
  // Platform
  plan: AgencyPlan;
  billingCycle: 'Monthly' | 'Annual';
  notes: string;
}

const EMPTY_FORM: NewAgencyData = {
  companyName: '',
  state: 'OR', licenseNumber: '', licenseStatus: '', licenseExpiry: '',
  licenseIssuedDate: '', licenseVerified: false,
  legalName: '', dbaName: '', classification: 'Basic', taxId: '', npiNumber: '',
  medicareProviderNumber: '', medicaidProviderNumber: '',
  medicareCertified: false, medicaidCertified: false,
  physicalAddress: '', physicalCity: '', physicalState: 'OR', physicalZip: '',
  physicalCounty: '', sameMailingAddress: true,
  mailingAddress: '', mailingCity: '', mailingZip: '',
  agencyPhone: '', agencyFax: '', agencyEmail: '', website: '',
  adminName: '', adminTitle: 'Administrator', adminEmail: '', adminPhone: '', adminCell: '',
  sameBillingContact: true, billingName: '', billingEmail: '', billingPhone: '',
  afterHoursName: '', afterHoursPhone: '',
  serviceCounties: [], servicesOffered: [], payerTypes: [], languages: ['English'],
  plan: 'Trial', billingCycle: 'Monthly', notes: '',
};

// ─── Static Data ─────────────────────────────────────────────────────────────

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY',
];

const OR_COUNTIES = [
  'Baker','Benton','Clackamas','Clatsop','Columbia','Coos','Crook','Curry',
  'Deschutes','Douglas','Gilliam','Grant','Harney','Hood River','Jackson',
  'Jefferson','Josephine','Klamath','Lake','Lane','Lincoln','Linn','Malheur',
  'Marion','Morrow','Multnomah','Polk','Sherman','Tillamook','Umatilla',
  'Union','Wallowa','Wasco','Washington','Wheeler','Yamhill',
];

const SERVICES = [
  'Personal Care (ADLs)',
  'Homemaker Services',
  'Respite Care',
  'Companionship',
  'Transportation Assistance',
  'Medication Assistance',
  'Medication Administration',
  'Nursing Services (RN/LPN)',
  'Physical Therapy Aide',
  'Occupational Therapy Aide',
  'Alzheimer\'s / Dementia Care',
  'Pediatric Home Care',
  'Behavioral Health Support',
  'Meal Preparation',
  'Light Housekeeping',
];

const PAYERS = ['Medicaid', 'Private Pay', 'Veterans (VA)', 'Long-Term Care Insurance', 'Medicare', 'Self-Pay'];
const LANGUAGES = ['English', 'Spanish', 'Mandarin', 'Vietnamese', 'Russian', 'Somali', 'Arabic', 'Tagalog', 'Korean', 'Portuguese'];

const PLANS: { id: AgencyPlan; price: string; clients: string; features: string[] }[] = [
  { id: 'Trial', price: 'Free / 30 days', clients: 'Up to 10', features: ['All features', 'No credit card required'] },
  { id: 'Starter', price: '$149/mo', clients: 'Up to 30', features: ['All core modules', 'Email support', '1 location'] },
  { id: 'Professional', price: '$299/mo', clients: 'Up to 100', features: ['All modules + AI policies', 'Priority support', 'Up to 5 locations'] },
  { id: 'Enterprise', price: '$599/mo', clients: 'Unlimited', features: ['Everything', 'Dedicated support', 'Unlimited locations', 'Custom integrations'] },
];

// ─── Step Definitions ────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'License', icon: Shield },
  { id: 2, label: 'Agency Profile', icon: Building2 },
  { id: 3, label: 'Contacts', icon: Users },
  { id: 4, label: 'Services', icon: Briefcase },
  { id: 5, label: 'Platform Setup', icon: Settings },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400 ${props.className ?? ''}`}
    />
  );
}

function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
    >
      {children}
    </select>
  );
}

function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button type="button" onClick={onChange} className="flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900">
      {checked ? <CheckSquare size={17} className="text-blue-600 flex-shrink-0" /> : <Square size={17} className="text-slate-300 flex-shrink-0" />}
      {label}
    </button>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-700">{label}</span>
      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-slate-200'}`}
      >
        <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

interface Props {
  onClose: () => void;
  onSave: (data: NewAgencyData) => void;
}

export default function AddAgencyModal({ onClose, onSave }: Props) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<NewAgencyData>(EMPTY_FORM);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<'success' | 'error' | null>(null);
  const [verifyMessage, setVerifyMessage] = useState('');

  const set = (patch: Partial<NewAgencyData>) => setForm((f) => ({ ...f, ...patch }));

  // ── License Verification ──────────────────────────────────────────────────
  const handleVerify = async () => {
    if (!form.licenseNumber.trim()) return;
    setVerifying(true);
    setVerifyResult(null);
    setVerifyMessage('');

    try {
      const res = await fetch('/api/admin/verify-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseNumber: form.licenseNumber.trim(), state: form.state }),
      });

      const data = await res.json();

      if (!res.ok) {
        setVerifyResult('error');
        setVerifyMessage(data.message ?? 'Verification failed. Please try again.');
        return;
      }

      setVerifyResult('success');
      setVerifyMessage(`Verified — ${data.agencyName} is ${data.status.toLowerCase()} in the ${form.state} database.`);
      set({
        licenseVerified: true,
        licenseStatus: data.status,
        licenseExpiry: data.expiryDate,
        licenseIssuedDate: data.issuedDate,
        legalName: data.agencyName || form.legalName,
        classification: data.classification || form.classification,
        physicalAddress: data.address || form.physicalAddress,
        physicalCity: data.city || form.physicalCity,
        physicalState: data.state || form.physicalState,
        physicalZip: data.zip || form.physicalZip,
        physicalCounty: data.county || form.physicalCounty,
        agencyPhone: data.phone || form.agencyPhone,
        adminName: data.directorName || form.adminName,
      });
    } catch {
      setVerifyResult('error');
      setVerifyMessage('Could not reach verification service. You can continue and enter details manually.');
    } finally {
      setVerifying(false);
    }
  };

  // ── Toggle helpers ─────────────────────────────────────────────────────────
  const toggleArr = (field: 'serviceCounties' | 'servicesOffered' | 'payerTypes' | 'languages', val: string) => {
    const arr = form[field] as string[];
    set({ [field]: arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val] } as Partial<NewAgencyData>);
  };

  const handleSubmit = () => {
    onSave(form);
  };

  // ── Step validation (minimal — just required fields) ──────────────────────
  const canProceed = () => {
    if (step === 1) return form.licenseNumber.trim() !== '';
    if (step === 2) return form.companyName.trim() !== '' && form.legalName.trim() !== '' && form.agencyPhone.trim() !== '' && form.agencyEmail.trim() !== '';
    if (step === 3) return form.adminName.trim() !== '' && form.adminEmail.trim() !== '';
    return true;
  };

  // ── Status badge for verified license ─────────────────────────────────────
  const statusBadgeClass: Record<string, string> = {
    Active: 'bg-green-100 text-green-700 border-green-200',
    Expired: 'bg-red-100 text-red-700 border-red-200',
    Suspended: 'bg-amber-100 text-amber-700 border-amber-200',
    Pending: 'bg-blue-100 text-blue-700 border-blue-200',
    Revoked: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Onboard New Company</h2>
            <p className="text-xs text-slate-400 mt-0.5">Step {step} of {STEPS.length} — {STEPS[step - 1].label}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-6 py-3 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-1">
            {STEPS.map(({ id, label, icon: Icon }) => (
              <React.Fragment key={id}>
                <button
                  onClick={() => id < step && setStep(id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    id === step
                      ? 'bg-blue-600 text-white'
                      : id < step
                      ? 'text-blue-600 hover:bg-blue-50 cursor-pointer'
                      : 'text-slate-400 cursor-default'
                  }`}
                >
                  {id < step ? (
                    <CheckCircle size={14} />
                  ) : (
                    <Icon size={14} />
                  )}
                  <span className="hidden sm:inline">{label}</span>
                </button>
                {id < STEPS.length && <div className="flex-1 h-px bg-slate-200 max-w-8" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* ── STEP 1: License ──────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-0.5">License Verification</h3>
                <p className="text-xs text-slate-400">Enter the agency's state and license number, then click Verify to auto-populate details from the state database.</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Field label="State" required>
                  <Select value={form.state} onChange={(e) => { set({ state: e.target.value, licenseVerified: false, licenseStatus: '', licenseExpiry: '', licenseIssuedDate: '' }); setVerifyResult(null); }}>
                    {US_STATES.map((s) => <option key={s}>{s}</option>)}
                  </Select>
                </Field>
                <div className="col-span-2">
                  <Field label="License Number" required>
                    <div className="flex gap-2">
                      <Input
                        value={form.licenseNumber}
                        onChange={(e) => { set({ licenseNumber: e.target.value.toUpperCase(), licenseVerified: false, licenseStatus: '' }); setVerifyResult(null); }}
                        placeholder={form.state === 'OR' ? 'IHC-2024-001' : 'Enter license number'}
                      />
                      <button
                        type="button"
                        onClick={handleVerify}
                        disabled={verifying || !form.licenseNumber.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex-shrink-0"
                      >
                        {verifying ? (
                          <><Loader size={14} className="animate-spin" /> Verifying...</>
                        ) : (
                          <><Shield size={14} /> Verify License</>
                        )}
                      </button>
                    </div>
                  </Field>
                </div>
              </div>

              {verifying && (
                <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                  <Loader size={16} className="animate-spin flex-shrink-0" />
                  Connecting to {form.state} state licensing database...
                </div>
              )}

              {verifyResult === 'success' && (
                <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800">License Verified</p>
                      <p className="text-xs text-green-700 mt-0.5">{verifyMessage}</p>
                    </div>
                  </div>
                  {form.licenseStatus && (
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      <div className="bg-white rounded-lg border border-green-200 px-3 py-2">
                        <div className="text-xs text-slate-400 mb-1">Status</div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusBadgeClass[form.licenseStatus] ?? 'bg-slate-100 text-slate-600'}`}>
                          {form.licenseStatus}
                        </span>
                      </div>
                      <div className="bg-white rounded-lg border border-green-200 px-3 py-2">
                        <div className="text-xs text-slate-400 mb-1">Classification</div>
                        <div className="text-sm font-semibold text-slate-700">{form.classification}</div>
                      </div>
                      <div className="bg-white rounded-lg border border-green-200 px-3 py-2">
                        <div className="text-xs text-slate-400 mb-1">Expires</div>
                        <div className="text-sm font-semibold text-slate-700">
                          {form.licenseExpiry ? new Date(form.licenseExpiry).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </div>
                      </div>
                    </div>
                  )}
                  {form.licenseStatus === 'Expired' || form.licenseStatus === 'Suspended' || form.licenseStatus === 'Revoked' ? (
                    <div className="mt-3 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                      License status is <strong>{form.licenseStatus}</strong>. You can still onboard this agency but flag the issue for follow-up.
                    </div>
                  ) : null}
                </div>
              )}

              {verifyResult === 'error' && (
                <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Verification Failed</p>
                    <p className="text-xs text-red-700 mt-0.5">{verifyMessage}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <Field label="License Issue Date">
                  <Input type="date" value={form.licenseIssuedDate} onChange={(e) => set({ licenseIssuedDate: e.target.value })} />
                </Field>
                <Field label="License Expiry Date">
                  <Input type="date" value={form.licenseExpiry} onChange={(e) => set({ licenseExpiry: e.target.value })} />
                </Field>
              </div>

              {!form.licenseNumber && (
                <p className="text-xs text-slate-400 italic">
                  For Oregon: Try <button className="text-blue-500 underline" onClick={() => set({ licenseNumber: 'IHC-2021-001' })}>IHC-2021-001</button> (Active), <button className="text-blue-500 underline" onClick={() => set({ licenseNumber: 'IHC-2020-015' })}>IHC-2020-015</button> (Expired), or <button className="text-blue-500 underline" onClick={() => set({ licenseNumber: 'IHC-2024-008' })}>IHC-2024-008</button> (Suspended).
                </p>
              )}
            </div>
          )}

          {/* ── STEP 2: Agency Profile ───────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-0.5">Company & Agency Profile</h3>
                <p className="text-xs text-slate-400">Enter the parent company name, then the licensed agency details. For single-agency companies these can be the same.</p>
              </div>

              {/* Company name */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
                <div>
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-0.5">Parent Company</p>
                  <p className="text-xs text-blue-600">The organization that owns and operates the agency. Can match the agency name for single-agency companies.</p>
                </div>
                <Field label="Company / Organization Name" required>
                  <Input
                    value={form.companyName}
                    onChange={(e) => set({ companyName: e.target.value })}
                    placeholder="Pacific Northwest Care Network"
                    className="bg-white"
                  />
                </Field>
              </div>

              <div className="pt-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Licensed Agency</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Field label="Legal Agency Name" required>
                    <Input value={form.legalName} onChange={(e) => set({ legalName: e.target.value })} placeholder="Portland Home Care LLC" />
                  </Field>
                </div>
                <Field label="DBA (Doing Business As)">
                  <Input value={form.dbaName} onChange={(e) => set({ dbaName: e.target.value })} placeholder="Optional — if different from legal name" />
                </Field>
                <Field label="Classification">
                  <Select value={form.classification} onChange={(e) => set({ classification: e.target.value as Classification })}>
                    <option>Limited</option><option>Basic</option><option>Intermediate</option><option>Comprehensive</option>
                  </Select>
                </Field>
                <Field label="Federal Tax ID (EIN)">
                  <Input value={form.taxId} onChange={(e) => set({ taxId: e.target.value })} placeholder="XX-XXXXXXX" />
                </Field>
                <Field label="NPI Number">
                  <Input value={form.npiNumber} onChange={(e) => set({ npiNumber: e.target.value })} placeholder="10-digit NPI" maxLength={10} />
                </Field>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Physical Address</p>
                <div className="grid grid-cols-6 gap-3">
                  <div className="col-span-6">
                    <Field label="Street Address">
                      <Input value={form.physicalAddress} onChange={(e) => set({ physicalAddress: e.target.value })} placeholder="100 SW Broadway" />
                    </Field>
                  </div>
                  <div className="col-span-3">
                    <Field label="City">
                      <Input value={form.physicalCity} onChange={(e) => set({ physicalCity: e.target.value })} placeholder="Portland" />
                    </Field>
                  </div>
                  <div className="col-span-1">
                    <Field label="State">
                      <Input value={form.physicalState} onChange={(e) => set({ physicalState: e.target.value })} maxLength={2} />
                    </Field>
                  </div>
                  <div className="col-span-2">
                    <Field label="ZIP">
                      <Input value={form.physicalZip} onChange={(e) => set({ physicalZip: e.target.value })} placeholder="97201" maxLength={10} />
                    </Field>
                  </div>
                  <div className="col-span-3">
                    <Field label="County">
                      <Select value={form.physicalCounty} onChange={(e) => set({ physicalCounty: e.target.value })}>
                        <option value="">Select county</option>
                        {OR_COUNTIES.map((c) => <option key={c}>{c}</option>)}
                      </Select>
                    </Field>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Mailing Address</p>
                  <CheckRow label="Same as physical address" checked={form.sameMailingAddress} onChange={() => set({ sameMailingAddress: !form.sameMailingAddress })} />
                </div>
                {!form.sameMailingAddress && (
                  <div className="grid grid-cols-6 gap-3">
                    <div className="col-span-6">
                      <Field label="Mailing Street">
                        <Input value={form.mailingAddress} onChange={(e) => set({ mailingAddress: e.target.value })} placeholder="PO Box or alternate address" />
                      </Field>
                    </div>
                    <div className="col-span-3">
                      <Field label="City">
                        <Input value={form.mailingCity} onChange={(e) => set({ mailingCity: e.target.value })} />
                      </Field>
                    </div>
                    <div className="col-span-3">
                      <Field label="ZIP">
                        <Input value={form.mailingZip} onChange={(e) => set({ mailingZip: e.target.value })} maxLength={10} />
                      </Field>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Agency Contact</p>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Main Phone" required>
                    <Input value={form.agencyPhone} onChange={(e) => set({ agencyPhone: e.target.value })} placeholder="(503) 555-0000" />
                  </Field>
                  <Field label="Fax">
                    <Input value={form.agencyFax} onChange={(e) => set({ agencyFax: e.target.value })} placeholder="(503) 555-0001" />
                  </Field>
                  <Field label="Agency Email" required>
                    <Input type="email" value={form.agencyEmail} onChange={(e) => set({ agencyEmail: e.target.value })} placeholder="info@agency.com" />
                  </Field>
                  <Field label="Website">
                    <Input value={form.website} onChange={(e) => set({ website: e.target.value })} placeholder="https://agency.com" />
                  </Field>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Provider Certifications</p>
                <div className="space-y-3">
                  <div className="p-3 border border-slate-200 rounded-lg space-y-3">
                    <Toggle label="Medicare Certified" checked={form.medicareCertified} onChange={() => set({ medicareCertified: !form.medicareCertified })} />
                    {form.medicareCertified && (
                      <Field label="Medicare Provider Number">
                        <Input value={form.medicareProviderNumber} onChange={(e) => set({ medicareProviderNumber: e.target.value })} placeholder="Medicare CCN" />
                      </Field>
                    )}
                  </div>
                  <div className="p-3 border border-slate-200 rounded-lg space-y-3">
                    <Toggle label="Medicaid Certified" checked={form.medicaidCertified} onChange={() => set({ medicaidCertified: !form.medicaidCertified })} />
                    {form.medicaidCertified && (
                      <Field label="Medicaid Provider Number">
                        <Input value={form.medicaidProviderNumber} onChange={(e) => set({ medicaidProviderNumber: e.target.value })} placeholder="Medicaid provider ID" />
                      </Field>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Contacts ─────────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-0.5">Key Contacts</h3>
                <p className="text-xs text-slate-400">Primary administrator, billing contact, and after-hours emergency contact.</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Primary Administrator</p>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Full Name" required>
                    <Input value={form.adminName} onChange={(e) => set({ adminName: e.target.value })} placeholder="Jane Smith" />
                  </Field>
                  <Field label="Title">
                    <Input value={form.adminTitle} onChange={(e) => set({ adminTitle: e.target.value })} placeholder="Administrator" />
                  </Field>
                  <div className="col-span-2">
                    <Field label="Email" required>
                      <Input type="email" value={form.adminEmail} onChange={(e) => set({ adminEmail: e.target.value })} placeholder="admin@agency.com" />
                    </Field>
                  </div>
                  <Field label="Office Phone">
                    <Input value={form.adminPhone} onChange={(e) => set({ adminPhone: e.target.value })} placeholder="(503) 555-0000" />
                  </Field>
                  <Field label="Cell Phone">
                    <Input value={form.adminCell} onChange={(e) => set({ adminCell: e.target.value })} placeholder="(503) 555-0001" />
                  </Field>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Billing Contact</p>
                  <CheckRow label="Same as administrator" checked={form.sameBillingContact} onChange={() => set({ sameBillingContact: !form.sameBillingContact })} />
                </div>
                {!form.sameBillingContact && (
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Billing Contact Name">
                      <Input value={form.billingName} onChange={(e) => set({ billingName: e.target.value })} placeholder="Full name" />
                    </Field>
                    <Field label="Phone">
                      <Input value={form.billingPhone} onChange={(e) => set({ billingPhone: e.target.value })} placeholder="(503) 555-0000" />
                    </Field>
                    <div className="col-span-2">
                      <Field label="Email">
                        <Input type="email" value={form.billingEmail} onChange={(e) => set({ billingEmail: e.target.value })} placeholder="billing@agency.com" />
                      </Field>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">After-Hours Emergency Contact</p>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Contact Name">
                    <Input value={form.afterHoursName} onChange={(e) => set({ afterHoursName: e.target.value })} placeholder="On-call coordinator" />
                  </Field>
                  <Field label="Phone">
                    <Input value={form.afterHoursPhone} onChange={(e) => set({ afterHoursPhone: e.target.value })} placeholder="(503) 555-0002" />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 4: Services ─────────────────────────────────────────── */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-0.5">Services & Coverage</h3>
                <p className="text-xs text-slate-400">Select service areas, service types, accepted payers, and languages.</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Service Counties ({form.serviceCounties.length} selected)</p>
                <div className="border border-slate-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {OR_COUNTIES.map((county) => (
                      <CheckRow
                        key={county}
                        label={county}
                        checked={form.serviceCounties.includes(county)}
                        onChange={() => toggleArr('serviceCounties', county)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Services Offered ({form.servicesOffered.length} selected)</p>
                <div className="border border-slate-200 rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                    {SERVICES.map((svc) => (
                      <CheckRow
                        key={svc}
                        label={svc}
                        checked={form.servicesOffered.includes(svc)}
                        onChange={() => toggleArr('servicesOffered', svc)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Accepted Payers</p>
                  <div className="border border-slate-200 rounded-lg p-3 space-y-2">
                    {PAYERS.map((p) => (
                      <CheckRow key={p} label={p} checked={form.payerTypes.includes(p)} onChange={() => toggleArr('payerTypes', p)} />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Languages Supported</p>
                  <div className="border border-slate-200 rounded-lg p-3 space-y-2">
                    {LANGUAGES.map((l) => (
                      <CheckRow key={l} label={l} checked={form.languages.includes(l)} onChange={() => toggleArr('languages', l)} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 5: Platform Setup ───────────────────────────────────── */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-0.5">Platform Setup</h3>
                <p className="text-xs text-slate-400">Choose a subscription plan and billing cycle for this agency.</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Subscription Plan</p>
                <div className="grid grid-cols-2 gap-3">
                  {PLANS.map(({ id, price, clients, features }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => set({ plan: id })}
                      className={`text-left p-4 rounded-xl border-2 transition-all ${form.plan === id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-800">{id}</span>
                        {form.plan === id && <CheckCircle size={16} className="text-blue-600" />}
                      </div>
                      <div className="text-base font-bold text-blue-600 mb-1">{price}</div>
                      <div className="text-xs text-slate-500 mb-2">{clients} clients</div>
                      <ul className="space-y-0.5">
                        {features.map((f) => (
                          <li key={f} className="flex items-center gap-1.5 text-xs text-slate-600">
                            <CheckCircle size={11} className="text-green-500 flex-shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Billing Cycle</p>
                <div className="flex gap-3">
                  {(['Monthly', 'Annual'] as const).map((cycle) => (
                    <button
                      key={cycle}
                      type="button"
                      onClick={() => set({ billingCycle: cycle })}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all ${form.billingCycle === cycle ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                    >
                      {cycle}
                      {cycle === 'Annual' && <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">2 months free</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <Field label="Internal Notes">
                  <textarea
                    value={form.notes}
                    onChange={(e) => set({ notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Onboarding notes, referral source, special requirements..."
                  />
                </Field>
              </div>

              {/* Summary */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Agency Summary</p>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <span className="text-slate-500">Company:</span><span className="font-medium text-slate-700">{form.companyName || '—'}</span>
                  <span className="text-slate-500">Agency:</span><span className="font-medium text-slate-700">{form.legalName || '—'}</span>
                  <span className="text-slate-500">License:</span><span className="font-medium text-slate-700">{form.licenseNumber || '—'} {form.licenseVerified && <span className="text-green-600 text-xs">✓ Verified</span>}</span>
                  <span className="text-slate-500">Classification:</span><span className="font-medium text-slate-700">{form.classification}</span>
                  <span className="text-slate-500">State:</span><span className="font-medium text-slate-700">{form.state}</span>
                  <span className="text-slate-500">Admin:</span><span className="font-medium text-slate-700">{form.adminName || '—'}</span>
                  <span className="text-slate-500">Plan:</span><span className="font-medium text-slate-700">{form.plan} / {form.billingCycle}</span>
                  <span className="text-slate-500">Services:</span><span className="font-medium text-slate-700">{form.servicesOffered.length} selected</span>
                  <span className="text-slate-500">Counties:</span><span className="font-medium text-slate-700">{form.serviceCounties.length} counties</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 flex-shrink-0">
          <button
            type="button"
            onClick={step === 1 ? onClose : () => setStep(step - 1)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={15} />
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">{step} / {STEPS.length}</span>
            {step < STEPS.length ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Next <ChevronRight size={15} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="flex items-center gap-1.5 px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <CheckCircle size={15} />
                Create Agency
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
