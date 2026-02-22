import React, { useState } from 'react';
import { BookOpen, Search, ChevronRight, ChevronLeft, CheckCircle, MessageSquare, Download, Loader } from 'lucide-react';

type PPStep = 'landing' | 'scanning' | 'review' | 'done';

interface PolicySection {
  id: string;
  oar: string;
  title: string;
  gap?: string;
  proposedText: string;
  explanation: string;
  accepted: boolean;
  concern?: string;
  revised?: string;
}

const oregonSections: Omit<PolicySection, 'accepted'>[] = [
  {
    id: 'org', oar: 'OAR 333-536-0050', title: 'Organization, Administration & Authority',
    gap: 'Missing: geographic service area limits, branch/subunit authority definitions',
    proposedText: `1. ORGANIZATION AND ADMINISTRATION\n\nThe agency shall clearly set forth in writing the organization, services provided, administrative control, and lines of authority from the owner to the client-care level.\n\n1.1 Geographic Service Area: Services are provided within 60 miles of the agency's primary location. Subunits operating more than 60 miles from the parent agency shall be separately licensed.\n\n1.2 Branch Offices: Branch offices within 60 miles share administration, supervision, and scheduling with the parent agency. Branch offices may not operate independently.\n\n1.3 Administrative Controls: The agency shall not assign administrative and supervisory functions to another agency or organization. All agency records shall be kept separate and distinct from other business entities.`,
    explanation: 'OAR 333-536-0050 requires written documentation of organizational structure, geographic service area (60-mile limit), and clear distinction between parent/subunit/branch offices. This is reviewed during every OHA survey.'
  },
  {
    id: 'admin', oar: 'OAR 333-536-0052', title: 'Administrator Qualifications & Duties',
    gap: 'Missing: designee requirements, delegate limitations, 24/7 accessibility requirement',
    proposedText: `2. ADMINISTRATOR REQUIREMENTS\n\n2.1 Qualifications: The administrator must possess a high school diploma and at least two years of professional or management experience in a health-related field.\n\n2.2 Accessibility: The administrator or designated administrator's designee shall be accessible and available during all hours services are provided to clients.\n\n2.3 Designee: The administrator may assign a written designee when temporarily unavailable. The designee must meet all administrator qualifications.\n\n2.4 Delegate: Administrative tasks specifically identified in OAR 333-536 as delegable may be assigned to an administrator's delegate. Delegates are not required to meet administrator qualifications. Non-delegable duties may not be delegated.\n\n2.5 Duties include: organizing agency functions, ensuring safe service delivery, ensuring all caregivers meet training requirements, timely investigation of complaints and adverse events, and reporting of abuse allegations.`,
    explanation: 'OAR 333-536-0052 requires a qualified administrator (HS diploma + 2yr management in health field) who is accessible 24/7 when services are provided. This is one of the most frequently cited deficiencies in OHA surveys.'
  },
  {
    id: 'personnel', oar: 'OAR 333-536-0053', title: 'Personnel Records Requirements',
    proposedText: `3. PERSONNEL RECORDS\n\nThe agency shall maintain a personnel record for each caregiver, nursing staff member, and employee including:\n\na) Pre-employment screening documentation (application, interview, reference checks)\nb) Criminal records check and fitness determination documentation\nc) Position qualifications and required licensure documentation\nd) Current health-care license status (if applicable)\ne) Signed current position description identifying highest service level\nf) Evidence of orientation, training, competency evaluations, and ongoing education\ng) Annual performance evaluation documentation\nh) Valid driver's license and current auto insurance (for staff transporting clients)\n\nAll personnel records shall be maintained in the agency's office and retained per applicable state law.`,
    explanation: 'OAR 333-536-0053 specifies exactly what must be in each caregiver\'s personnel file. Surveyors will audit these files. Missing documentation — especially training records and background checks — is the most common survey deficiency.'
  },
  {
    id: 'orient', oar: 'OAR 333-536-0070(5)', title: 'Caregiver Orientation (≥4 Hours)',
    gap: 'Missing: required orientation topics, minimum 4-hour requirement',
    proposedText: `4. CAREGIVER ORIENTATION\n\n4.1 Requirement: All caregivers must complete a minimum 4-hour agency-specific orientation before independently providing services.\n\n4.2 Required Topics:\na) Caregiver job description and requirements\nb) Client rights\nc) Ethics and confidentiality\nd) Agency policies and procedures (travel requirements, reporting, care practices, notification, infection control, emergency response, medication services)\ne) Description of services provided\nf) Assignment and supervision\ng) Documentation of client needs and services\nh) Coordination with community service providers\ni) Medication reminding limitations\nj) Special population needs\n\n4.3 Documentation: Orientation date, topics covered, and instructor signature must be documented in the caregiver's personnel record.`,
    explanation: 'Required by OAR 333-536-0070(5). Minimum 4 hours, can be online or in-person. Must occur BEFORE the caregiver independently provides services. Competency evaluation must also be completed before independent service.'
  },
  {
    id: 'training', oar: 'OAR 333-536-0070(7)', title: 'Initial Caregiver Training (8 Hours)',
    gap: 'Missing: 2hr-before-service requirement, 120-day completion deadline',
    proposedText: `5. INITIAL CAREGIVER TRAINING\n\n5.1 Minimum Hours: Caregivers must receive a minimum of 8 hours of initial training.\n\n5.2 Timing: 2 hours must be completed before providing services. The remaining 6 hours may be completed within 120 days of hire through on-the-job training or other methodology.\n\n5.3 Required Topics (as applicable to agency classification):\na) Caregiver duties and responsibilities\nb) Recognizing and responding to medical emergencies\nc) Adverse behaviors\nd) Nutrition, hydration, meal preparation\ne) Safe techniques in personal care tasks\nf) Skin breakdown, contracture, fall prevention\ng) Hand washing and infection control\nh) Body mechanics\ni) Clean and safe environment\nj) Fire safety and emergency procedures\nk) Assisting with self-directed medication administration\nl) Cultural competence\nm) Abdominal thrust and first aid\n\n5.4 Competency: Caregivers must pass both direct observation and written/oral testing before independent service.\n\n5.5 Exemption: Caregivers with a current Oregon health-care related license or certificate are exempt from initial training.`,
    explanation: 'OAR 333-536-0070(7) requires 8 total hours with 2 hours before service. The 120-day completion window for the remaining 6 hours is a grace period — but the 2-hour before-service requirement is absolute.'
  },
  {
    id: 'medtrain', oar: 'OAR 333-536-0070(8)', title: 'Medication Services Training (4 Hours)',
    proposedText: `6. MEDICATION SERVICES TRAINING\n\n6.1 Requirement: Caregivers assigned to provide medication services must complete a minimum 4 hours of medication training before providing those services.\n\n6.2 Required Training Topics:\na) Medication abbreviations\nb) Reading medication orders and directions\nc) Reading labels and packages including pill packs\nd) For Intermediate/Comprehensive agencies: medication set-up into secondary containers\ne) Administering non-injectable medications (pill, liquid, suppository, topical forms)\nf) Identifying and reporting adverse reactions, interactions, contraindications\ng) Infection control for medication administration\nh) Techniques for safe and accurate administration\n\n6.3 Return Demonstration: Caregivers must successfully demonstrate appropriate medication techniques to a qualified individual before providing medication services.\n\n6.4 Provider: Training must be provided by a qualified individual or entity as defined in OAR 333-536-0005.`,
    explanation: 'Required by OAR 333-536-0070(8) for any caregiver providing medication assistance or administration. The return demonstration requirement is mandatory and must be documented by a qualified individual (RN, LPN, pharmacist, etc.).'
  },
  {
    id: 'annualtrain', oar: 'OAR 333-536-0070(14)', title: 'Annual Training (6+ Hours)',
    proposedText: `7. ANNUAL TRAINING REQUIREMENTS\n\n7.1 Minimum Hours: All caregivers must receive a minimum of 6 hours of annual education from a qualified trainer, qualified individual, or qualified entity.\n\n7.2 Medication Addition: Caregivers who provide medication services must receive one additional hour of annual education related to medication services (total 7 hours annually).\n\n7.3 Timing: Annual training must be completed within 12 months of initial training and every 12 months thereafter.\n\n7.4 Documentation: Training date, topics, hours, and instructor must be documented in the caregiver's personnel record.`,
    explanation: 'OAR 333-536-0070(14) requires 6 hours annually (7 if providing medication services). This is separate from the initial training requirement. Missing annual training is one of the most common OHA survey deficiencies.'
  },
  {
    id: 'svcplan', oar: 'OAR 333-536-0065', title: 'Service Plan Requirements',
    gap: 'Missing: 7-day completion rule, caregiver pre-service review requirement',
    proposedText: `8. SERVICE PLAN POLICY\n\n8.1 Initial Evaluation: The administrator or designee shall conduct and document an initial evaluation of each client's physical, mental, and emotional needs before service begins.\n\n8.2 Service Plan Completion: A written service plan shall be completed within 7 days of initiation of services, developed in collaboration with the client or client representative.\n\n8.3 Required Content: The service plan shall include client information, medical conditions, services to be provided with assigned caregivers and tasks, PCP name, special instructions, scheduled hours per month, and pertinent care information.\n\n8.4 Caregiver Review: The service plan must be reviewed with each caregiver BEFORE the initial delivery of client care. Each caregiver must confirm review by signature or electronic identifier.\n\n8.5 Updates: Changes to the service plan must be reviewed, approved by the agency, communicated to caregivers, and documented.\n\n8.6 Retention: All original and updated service plans shall be maintained in the client's record for 7 years after end of service.`,
    explanation: 'OAR 333-536-0065 requires the service plan within 7 days — not 7 business days, 7 calendar days. The pre-service caregiver review with documented signatures is mandatory and a frequent survey finding when missing.'
  },
  {
    id: 'monitor', oar: 'OAR 333-536-0066', title: 'Monitoring Visit Requirements',
    proposedText: `9. MONITORING VISITS\n\n9.1 Initial Visit: An initial in-person visit must be conducted at the client's residence between Day 7 and Day 30 of service commencement.\n\n9.2 Quarterly Monitoring: Monitoring visits shall be conducted at least quarterly (every 90 days). Visits may be by phone or video only when specific documented circumstances justify non-in-person contact.\n\n9.3 In-Person Maximum: The time between in-person monitoring visits may not exceed six months.\n\n9.4 Required Documentation: Each visit must document whether: (a) safe care techniques were used, (b) service plan was followed, (c) service plan meets client needs, (d) caregiver training is sufficient, (e) client satisfaction, (f) follow-up needed, (g) adverse events since last visit, (h) changes in client health/behavior/environment. Client narrative must be recorded.\n\n9.5 Signatures: Each visit record must be dated and signed by the administrator/designee and the client.`,
    explanation: 'OAR 333-536-0066 is one of the most complex compliance requirements. The Day 7–30 initial visit window is absolute. Quarterly visits with 6-month in-person maximum — violating this is a citable deficiency. All 8 monitoring items must be documented.'
  },
  {
    id: 'bgcheck', oar: 'OAR 333-536-0093', title: 'Criminal Records Check Policy',
    proposedText: `10. CRIMINAL RECORDS CHECK POLICY\n\n10.1 Requirement: A criminal records check and fitness determination must be conducted before hiring any subject individual (SI) who will have direct contact with clients.\n\n10.2 Prohibited Convictions: Any SI convicted of crimes described in ORS 443.004(3) may not be employed.\n\n10.3 Preliminary Hire: The agency may employ an SI pending the outcome of a background check only if: (a) a preliminary fitness determination is made, (b) the SI is actively supervised at all times, (c) no direct client contact occurs until the final fitness determination.\n\n10.4 Required Check Components: Name/address history trace, date of birth verification, SSN trace, local criminal records (7-year history), nationwide multijurisdictional database, nationwide sex offender registry search.\n\n10.5 LEIE Check: The agency shall conduct and document a query of the List of Excluded Individuals and Entities (LEIE) for all subject individuals.\n\n10.6 Renewal: Criminal records checks must be repeated every 3 years from the date of the last check.\n\n10.7 Medicaid Clients: For caregivers serving ODHS/Medicaid clients, background checks must be submitted through the ODHS Background Check Unit (BCU).`,
    explanation: 'OAR 333-536-0093 is extensive. Key points surveyors check: (1) was check done BEFORE hire, (2) is LEIE documented, (3) are 3-year renewals tracked, (4) is there a written weighing test policy for non-disqualifying convictions.'
  },
  {
    id: 'disclosure', oar: 'OAR 333-536-0055', title: 'Client Disclosure & Acceptance',
    proposedText: `11. CLIENT DISCLOSURE AND ACCEPTANCE\n\n11.1 Acceptance Criteria: The agency shall only accept clients for whom it can ensure: sufficient capabilities to meet care needs, adequate trained staff, and ability to coordinate with other providers.\n\n11.2 Disclosure Statement: A written disclosure statement signed by the client or representative is required before services begin. The disclosure must include: license classification and services offered, qualifications of oversight staff for medication services, statement that agency cannot manage unstable/unpredictable medical conditions, caregiver qualifications, all charges, billing methods, cancellation and termination policies, deposit and refund policy, administrator contact information, and a copy of client rights.\n\n11.3 Stable and Predictable: The agency shall notify clients when their condition is no longer stable and predictable, provide referral information, and document all notifications. Unstable clients may only receive housekeeping/support services.`,
    explanation: 'OAR 333-536-0055 requires the disclosure statement BEFORE care begins — not at the first visit. Missing disclosure statements are a common survey finding. The stable-and-predictable determination must be documented and drives what services can be provided.'
  },
  {
    id: 'clientrights', oar: 'OAR 333-536-0060', title: "Client Rights Notice",
    proposedText: `12. CLIENT RIGHTS\n\nThe agency shall recognize and protect the rights of each client including: dignity and respect, freedom from property theft/damage, informed choice to accept/refuse services, freedom from all forms of abuse and neglect, freedom from financial exploitation, freedom from restraints, freedom to voice grievances without reprisal, freedom from discrimination, participation in service planning, access to their records, confidential record maintenance, written notice of charges, 30-day termination notice (with exceptions for immediate safety or non-payment), and the right to written notice of client rights.\n\nGrievance procedures and OHA contact information must be provided to each client.`,
    explanation: 'OAR 333-536-0060 lists 13 specific rights. Every client must receive these in writing as part of the disclosure statement before care begins. The 30-day termination notice requirement has two exceptions that must be in your policies.'
  },
  {
    id: 'infectioncontrol', oar: 'OAR 333-536-0082', title: 'Infection Control Program',
    proposedText: `13. INFECTION CONTROL\n\nThe agency shall maintain an infection control program that includes: (a) active surveillance, identification, prevention, and control of infectious and communicable diseases; (b) appropriate disposal of sharps; (c) written policies on standard precautions (hand hygiene, respiratory hygiene, PPE), availability of PPE, and bloodborne pathogen exposure (Hepatitis B, HIV); (d) education and training for all staff and caregivers on infection control measures.`,
    explanation: 'OAR 333-536-0082 requires a written infection control program. This became more prominent after COVID-19. Surveyors check for written policies AND evidence that caregivers were trained.'
  },
  {
    id: 'records', oar: 'OAR 333-536-0085', title: 'Client Records Management',
    proposedText: `14. CLIENT RECORDS\n\n14.1 Required Contents: Each client record shall include identification data, referral, start date, disclosure documents, client rights documentation, all evaluations and assessments, service plan and updates, documentation of all services including daily caregiver notes, signed service and financial agreement, end-of-service date, and end-of-service summary.\n\n14.2 Daily Caregiver Notes: Documentation must include a summary of tasks completed, observation of the client, and observed or reported concerns.\n\n14.3 Standards: All entries must be dated and authenticated by the author. Electronic authentication is acceptable.\n\n14.4 Retention: Records shall be retained for a minimum of 7 years after the last end-of-service date.\n\n14.5 Security: Reasonable precautions must protect records from unauthorized access, fire, water, and theft.`,
    explanation: 'OAR 333-536-0085 requires daily caregiver notes documenting tasks, client observation, AND concerns. This was strengthened in 2021. The 7-year retention requirement is absolute. Surveyors will review records for completeness.'
  },
  {
    id: 'qa', oar: 'OAR 333-536-0090', title: 'Quality Assessment & Performance Improvement',
    proposedText: `15. QUALITY ASSESSMENT AND PERFORMANCE IMPROVEMENT (QAPI)\n\n15.1 Program: The agency shall maintain an agency-wide QAPI program that evaluates and monitors quality, safety, and appropriateness of services.\n\n15.2 Required Elements: (a) Method to identify, analyze, and correct adverse events and performance issues; (b) method to select and track quality indicators; (c) preventive strategies based on root cause analysis; (d) quarterly committee meetings.\n\n15.3 Committee: The QAPI committee shall include at minimum agency administrative staff and a caregiver. Intermediate and Comprehensive agencies must also include a registered nurse.\n\n15.4 Documentation: Quarterly meeting minutes must include meeting date, committee members with titles, adverse events reviewed, quality indicators tracked, and preventive strategies implemented.`,
    explanation: 'OAR 333-536-0090 requires documented quarterly QAPI meetings. The committee composition requirement (RN for Intermediate/Comprehensive) is frequently missed. Meeting minutes must specifically address the three required elements.'
  },
  {
    id: 'complaints', oar: 'OAR 333-536-0042, 0043', title: 'Complaint Investigation & Reporting',
    proposedText: `16. COMPLAINTS AND INVESTIGATIONS\n\n16.1 Internal Reporting: Employees with knowledge of rule violations shall use agency reporting procedures before contacting OHA, unless immediate client safety is at risk.\n\n16.2 Investigation: All complaints, grievances, adverse events, medication/care errors, and abuse allegations shall be investigated timely. Documentation shall include the complaint/event, investigation process, people interviewed, information gathered, and actions taken.\n\n16.3 Abuse Reporting: Allegations of abuse or neglect shall be reported immediately to ODHS, OHA, or local law enforcement as applicable.\n\n16.4 Cooperation: The agency shall fully cooperate with all OHA investigations and ODHS Adult Protective Services and Child Protective Services investigations.`,
    explanation: 'OAR 333-536-0052(6)(i) requires timely reporting of abuse to appropriate authorities. Failure to report is a citable violation. Your policies must specify who receives internal reports and the escalation path to external agencies.'
  },
  {
    id: 'enforcement', oar: 'OAR 333-536-0117, 0120', title: 'Survey Deficiency & Plan of Correction',
    proposedText: `17. SURVEY DEFICIENCIES AND PLANS OF CORRECTION\n\n17.1 Statement of Deficiencies: Upon receiving a Statement of Deficiencies from OHA, the agency administrator shall review findings and respond within 10 business days with a signed Plan of Correction (POC).\n\n17.2 POC Contents: The POC shall identify: (a) the corrective action for each deficiency, (b) how the correction will be monitored, (c) the date by which correction will be completed.\n\n17.3 Correction Timeline: All deficiencies must be corrected within 60 days of the exit conference unless an extension is granted by OHA in writing.\n\n17.4 Dispute Process: If the agency disputes survey findings, a written request for informal conference must be submitted within 10 business days with detailed explanation.`,
    explanation: 'OAR 333-536-0117 gives you 10 business days to submit a POC and 60 days to correct deficiencies. Missing the POC deadline can itself result in additional enforcement action. Having this process documented protects the agency.'
  },
  {
    id: 'civil', oar: 'OAR 333-536-0125', title: 'Civil Penalties & Violations',
    proposedText: `18. CIVIL PENALTIES AND VIOLATIONS\n\nThe agency acknowledges that OAR 333-536-0125 authorizes civil penalties up to $1,000 per violation (maximum $2,000 total) for violations of in-home care laws and rules. Penalties are assessed per day for continuing violations.\n\nOperating without a valid license may result in penalties up to $500 per day.\n\nThe agency shall maintain continuous compliance with all OAR 333-536 requirements to prevent civil penalty exposure.`,
    explanation: 'Understanding civil penalty structure helps prioritize compliance efforts. At $1,000/day for continuing violations, even minor documentation failures can become expensive. This section should be in your policies as a reminder of regulatory stakes.'
  },
];

export default function Policies() {
  const [step, setStep] = useState<PPStep>('landing');
  const [state, setState] = useState('OR');
  const [classification, setClassification] = useState('Basic');
  const [scanLog, setScanLog] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);
  const [sections, setSections] = useState<PolicySection[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [concern, setConcern] = useState('');
  const [showConcernInput, setShowConcernInput] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [responding, setResponding] = useState(false);
  const [chat, setChat] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);

  const scanLog_messages = [
    'Connecting to Oregon Health Authority regulatory database...',
    'Fetching OAR 333-536-0000 through 333-536-0125...',
    'Parsing regulatory amendments (latest: PH 50-2023, PH 59-2024)...',
    'Loading current agency classification: ' + classification,
    'Scanning existing policy manual for matching sections...',
    'Analyzing Section 1: Organization & Administration...',
    'Analyzing Section 2: Administrator Requirements...',
    'Analyzing Section 3: Personnel Records...',
    'Analyzing Section 4–7: Training Requirements...',
    'Analyzing Section 8: Service Plan Policy...',
    'Analyzing Section 9: Monitoring Visits...',
    'Analyzing Section 10: Criminal Records Check...',
    'Analyzing Sections 11–12: Client Disclosure & Rights...',
    'Analyzing Sections 13–14: Infection Control & Records...',
    'Analyzing Sections 15–18: QAPI, Complaints, Enforcement...',
    'Gap analysis complete. Preparing 18-section review...',
    'Ready for step-by-step review.',
  ];

  const startScan = async () => {
    setStep('scanning');
    setScanning(true);
    setScanLog([]);
    for (let i = 0; i < scanLog_messages.length; i++) {
      await new Promise(r => setTimeout(r, 400));
      setScanLog(l => [...l, scanLog_messages[i]]);
    }
    setSections(oregonSections.map(s => ({ ...s, accepted: false })));
    setCurrentIdx(0);
    setScanning(false);
    setTimeout(() => setStep('review'), 500);
  };

  const acceptSection = () => {
    setSections(s => s.map((sec, i) => i === currentIdx ? { ...sec, accepted: true } : sec));
    setShowConcernInput(false);
    setConcern('');
    setAiResponse('');
    if (currentIdx < sections.length - 1) setCurrentIdx(i => i + 1);
    else setStep('done');
  };

  const submitConcern = async () => {
    if (!concern.trim()) return;
    setResponding(true);
    const section = sections[currentIdx];
    await new Promise(r => setTimeout(r, 1500));
    const response = `Thank you for your feedback on the **${section.title}** section.\n\nRegarding your concern: "${concern}"\n\nHere's a revised approach that addresses your feedback while maintaining compliance with ${section.oar}:\n\nThe regulatory requirement is mandatory — agencies must document this to avoid survey deficiencies. However, I can simplify the language or adjust the structure to better fit your operations. The core compliance elements must remain, but the implementation details can be tailored.\n\nWould the revised version above work for your agency? If you have additional questions about this requirement, type them below.`;
    setAiResponse(response);
    setChat(c => [...c, { role: 'user', text: concern }, { role: 'ai', text: response }]);
    setConcern('');
    setResponding(false);
  };

  const allAccepted = sections.filter(s => s.accepted).length;
  const currentSection = sections[currentIdx];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Policy & Procedure Generator</h1>
          <p className="text-slate-500 text-sm">AI-powered, regulation-current P&P manual generation</p>
        </div>
        {step === 'review' && (
          <div className="text-sm text-slate-500 font-medium">{allAccepted}/{sections.length} sections accepted</div>
        )}
      </div>

      {/* LANDING */}
      {step === 'landing' && (
        <div className="max-w-2xl space-y-6">
          <div className="card p-6 space-y-5">
            <h2 className="font-semibold text-slate-800">Generate / Update Your Policy & Procedure Manual</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="form-label">State / Jurisdiction</label>
                <select className="form-input" value={state} onChange={e => setState(e.target.value)}>
                  <option value="OR">Oregon</option>
                  <option value="WA">Washington</option>
                  <option value="CA">California</option>
                  <option value="AZ">Arizona</option>
                  <option value="NV">Nevada</option>
                </select>
              </div>
              <div><label className="form-label">Agency Classification</label>
                <select className="form-input" value={classification} onChange={e => setClassification(e.target.value)}>
                  <option>Limited</option>
                  <option>Basic</option>
                  <option>Intermediate</option>
                  <option>Comprehensive</option>
                </select>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-sm font-medium text-slate-700 mb-2">Existing Policy Manual</div>
              <div className="text-xs text-slate-500 mb-2">CareAxis_PP_Manual_2025.pdf — Last updated Jan 1, 2025</div>
              <button className="text-xs text-blue-600 hover:text-blue-800">Upload New Document</button>
            </div>
            <div className="flex gap-3">
              <button onClick={startScan} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Search size={16} /> Scan & Update Existing Manual
              </button>
              <button onClick={startScan} className="btn-secondary flex-1">Generate Fresh Manual</button>
            </div>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
            <strong>How it works:</strong> The AI scans Oregon OAR 333-536 regulations, cross-references your existing manual, identifies gaps, and walks you through each section one at a time. You can accept as-is or request changes. When complete, a full compliant P&P manual is generated.
          </div>
        </div>
      )}

      {/* SCANNING */}
      {step === 'scanning' && (
        <div className="max-w-2xl">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <Loader size={20} className="text-blue-600 animate-spin" />
              <h2 className="font-semibold text-slate-800">Scanning Regulations...</h2>
            </div>
            <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm space-y-1 min-h-48">
              {scanLog.map((log, i) => (
                <div key={i} className="text-green-400">&gt; {log}</div>
              ))}
              {scanning && <div className="text-green-400 animate-pulse">&gt; _</div>}
            </div>
          </div>
        </div>
      )}

      {/* REVIEW */}
      {step === 'review' && currentSection && (
        <div className="max-w-3xl space-y-4">
          {/* Progress */}
          <div className="flex items-center gap-4">
            <button onClick={() => currentIdx > 0 && setCurrentIdx(i => i - 1)} className="btn-secondary p-2" disabled={currentIdx === 0}>
              <ChevronLeft size={16} />
            </button>
            <div className="flex-1">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Section {currentIdx + 1} of {sections.length}</span>
                <span>{allAccepted} accepted</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full">
                <div className="h-2 bg-blue-500 rounded-full transition-all" style={{ width: `${((currentIdx + 1) / sections.length) * 100}%` }} />
              </div>
            </div>
            <button onClick={() => currentIdx < sections.length - 1 && setCurrentIdx(i => i + 1)} className="btn-secondary p-2">
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Section card */}
          <div className="card p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{currentSection.title}</h2>
                <div className="text-xs font-mono text-slate-400 mt-0.5">{currentSection.oar}</div>
              </div>
              {currentSection.accepted && <span className="badge-green flex items-center gap-1"><CheckCircle size={12} /> Accepted</span>}
            </div>

            {currentSection.gap && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <strong>Gap Identified:</strong> {currentSection.gap}
              </div>
            )}

            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Proposed Policy Language</div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">
                {currentSection.proposedText}
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">AI</div>
                <span className="text-sm font-semibold text-blue-800">Why this matters</span>
              </div>
              <p className="text-sm text-blue-700">{currentSection.explanation}</p>
            </div>

            {chat.length > 0 && (
              <div className="border border-slate-200 rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
                {chat.map((m, i) => (
                  <div key={i} className={`text-sm ${m.role === 'user' ? 'text-slate-600' : 'text-blue-700'}`}>
                    <strong>{m.role === 'user' ? 'You: ' : 'AI: '}</strong>{m.text}
                  </div>
                ))}
              </div>
            )}

            {showConcernInput && (
              <div className="space-y-2">
                <textarea
                  className="form-input text-sm"
                  rows={3}
                  value={concern}
                  onChange={e => setConcern(e.target.value)}
                  placeholder="Describe what you don't understand or agree with..."
                />
                <div className="flex gap-2">
                  <button onClick={submitConcern} disabled={responding} className="btn-primary flex items-center gap-2">
                    {responding ? <Loader size={14} className="animate-spin" /> : <MessageSquare size={14} />}
                    Submit Concern
                  </button>
                  <button onClick={() => setShowConcernInput(false)} className="btn-secondary">Cancel</button>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={acceptSection} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <CheckCircle size={16} /> Accept & Continue
              </button>
              <button onClick={() => setShowConcernInput(!showConcernInput)} className="btn-secondary flex items-center gap-2">
                <MessageSquare size={14} /> I Have a Concern
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DONE */}
      {step === 'done' && (
        <div className="max-w-2xl space-y-4">
          <div className="card p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Policy & Procedure Manual Complete</h2>
            <p className="text-slate-500 text-sm">{sections.filter(s => s.accepted).length} sections accepted · OAR 333-536 compliant · {classification} classification</p>
            <div className="flex gap-3 justify-center">
              <button className="btn-primary flex items-center gap-2"><Download size={16} /> Download Manual (PDF)</button>
              <button className="btn-secondary flex items-center gap-2"><Download size={16} /> Download (.docx)</button>
            </div>
            <button onClick={() => { setStep('landing'); setCurrentIdx(0); setSections([]); setChat([]); }} className="text-sm text-blue-600 hover:text-blue-800">
              Start New / Update Again
            </button>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-3">Next Steps</h3>
            <div className="space-y-2">
              {['Have all staff review the updated manual', 'Administrator signs the certification page', 'Upload signed manual to Document Management', 'Schedule staff training on any new or changed policies', 'Set reminder for annual review (12 months from today)'].map((step, i) => (
                <label key={i} className="flex items-center gap-3 text-sm cursor-pointer hover:bg-slate-50 p-2 rounded">
                  <input type="checkbox" className="w-4 h-4 accent-blue-600" />
                  <span>{step}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-3">Ask a Follow-Up Question</h3>
            <div className="flex gap-2">
              <input className="form-input flex-1 text-sm" placeholder="e.g. What is the 7-day rule? How do I handle a POC?" />
              <button className="btn-primary px-3"><MessageSquare size={16} /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
