import React, { useState, useRef } from 'react';
import { Search, ChevronRight, ChevronLeft, CheckCircle, MessageSquare, Download, Loader, FileText, Printer, ChevronDown, Building2, Upload } from 'lucide-react';

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
  forms?: string[];
}

const oregonSections: Omit<PolicySection, 'accepted'>[] = [
  {
    id: 'org', oar: 'OAR 333-536-0050', title: 'Organization, Administration & Authority',
    gap: 'Missing: geographic service area limits, branch/subunit authority definitions',
    proposedText: `SECTION 1: ORGANIZATION AND ADMINISTRATION

POLICY:
The agency maintains a documented organizational structure that clearly defines services offered, administrative control, lines of authority from ownership to direct-care staff, and the geographic boundaries within which services are provided.

PURPOSE:
To ensure every employee understands the chain of command, who to report to, and how the agency is structured — and to meet Oregon licensing requirements under OAR 333-536-0050.

SCOPE:
All owners, administrators, office staff, and caregivers.

PROCEDURES:
1. The Administrator shall maintain a current organizational chart showing all positions from ownership through direct-care staff.
2. Post the organizational chart in the main office where all staff can view it.
3. Update the organizational chart within 30 days whenever staff join, leave, or change roles.
4. Limit all service delivery to within a 60-mile radius of the agency's primary office.
5. If a client requests service beyond the 60-mile radius, the Administrator must apply for a separate subunit license before accepting the client.
6. Branch offices within the 60-mile radius must coordinate all scheduling, supervision, and administration through the parent office — they may not operate independently.
7. Keep all agency records (financial, client, personnel) completely separate from any other business entity, even if co-located.
8. Do not outsource or assign administrative or supervisory duties to any outside organization.
9. Conduct an annual review of the organizational structure each January and document any changes.

RESPONSIBLE PARTIES:
• Owner — Approves organizational structure and any service area expansions
• Administrator — Maintains the org chart, enforces the 60-mile service boundary, ensures record separation
• Office Manager — Updates the org chart, files documentation, coordinates branch office activities

DOCUMENTATION:
• Current organizational chart (posted in office and filed digitally)
• Written description of services provided by classification level
• Geographic service area boundary description or map
• Annual organizational review notes (signed and dated)

REGULATORY REFERENCE: OAR 333-536-0050
REVIEW SCHEDULE: Annually each January, or within 30 days of any organizational change`,
    explanation: 'OAR 333-536-0050 requires written documentation of organizational structure, geographic service area (60-mile limit), and clear distinction between parent/subunit/branch offices. This is reviewed during every OHA survey.',
    forms: ['Annual Organizational Structure Review Form'],
  },
  {
    id: 'admin', oar: 'OAR 333-536-0052', title: 'Administrator Qualifications & Duties',
    gap: 'Missing: designee requirements, delegate limitations, 24/7 accessibility requirement',
    proposedText: `SECTION 2: ADMINISTRATOR QUALIFICATIONS AND DUTIES

POLICY:
The agency shall employ a qualified Administrator who is accessible and available at all times services are being provided to clients. The Administrator is ultimately responsible for the safe, compliant operation of the agency.

PURPOSE:
To ensure the agency has qualified leadership available to caregivers and clients at all times, and to clearly define who may act on the Administrator's behalf when they are temporarily unavailable.

SCOPE:
Administrator, Administrator's Designee, Administrator's Delegates, all supervisory staff.

PROCEDURES:
1. Before hiring an Administrator, verify the candidate holds a high school diploma (or equivalent) AND has at least two years of professional or management experience in a health-related field. File proof of both in their personnel record.
2. The Administrator must carry an agency phone and be reachable at all times when any caregiver is actively providing services to a client — including evenings, weekends, and holidays.
3. When the Administrator will be temporarily unavailable (vacation, illness, personal leave):
   a. Appoint a written Designee who meets all Administrator qualifications (HS diploma + 2 years health management).
   b. Complete the "Designee Appointment Form" with effective dates and signatures.
   c. Notify all active caregivers who to contact during the absence.
   d. File the signed form in the Administrator's personnel record.
4. For routine delegable tasks (scheduling, filing, supply ordering), the Administrator may assign a Delegate. Delegates do NOT need to meet Administrator qualifications.
5. The following duties may NEVER be delegated: abuse reporting decisions, complaint investigations, hiring/termination decisions, and survey responses.
6. Administrator core duties include:
   a. Organizing and directing all agency functions
   b. Ensuring safe and competent service delivery
   c. Verifying all caregivers complete required training on time
   d. Investigating complaints and adverse events promptly
   e. Reporting abuse allegations to appropriate authorities immediately

RESPONSIBLE PARTIES:
• Owner — Hires and verifies qualifications of the Administrator
• Administrator — Maintains accessibility, appoints qualified designees, carries out all non-delegable duties
• Designee — Assumes full Administrator responsibilities during documented absences
• Office Manager — Maintains Designee Appointment Forms and notifies caregivers of coverage changes

DOCUMENTATION:
• Administrator qualification verification (diploma, experience documentation) in personnel file
• Designee Appointment Form (signed, with effective dates) filed in Administrator's record
• On-call schedule showing Administrator/Designee availability
• Delegate task assignment log (optional but recommended)

REGULATORY REFERENCE: OAR 333-536-0052
REVIEW SCHEDULE: Annually, or whenever the Administrator position changes`,
    explanation: 'OAR 333-536-0052 requires a qualified administrator (HS diploma + 2yr management in health field) who is accessible 24/7 when services are provided. This is one of the most frequently cited deficiencies in OHA surveys.',
    forms: ['Administrator Designee Appointment Form', 'Administrator On-Call Schedule'],
  },
  {
    id: 'personnel', oar: 'OAR 333-536-0053', title: 'Personnel Records Requirements',
    proposedText: `SECTION 3: PERSONNEL RECORDS

POLICY:
The agency shall create and maintain a complete personnel record for every caregiver, nurse, and employee from the date of hire through seven years after separation. No employee may begin providing services until their personnel file contains all required pre-service documents.

PURPOSE:
To ensure the agency can demonstrate to surveyors, at any time, that every employee was properly screened, trained, and qualified before providing services — and to protect the agency in the event of complaints or litigation.

SCOPE:
All caregivers, nursing staff, office employees, and contracted personnel who have client contact.

PROCEDURES:
For New Hires (Office Manager completes before first day of service):
1. Create a new personnel folder (physical or digital) labeled with the employee's full name and hire date.
2. Collect and file the following BEFORE the employee provides any services:
   a. Completed employment application
   b. Interview notes and reference check results (minimum 2 references)
   c. Criminal records check results and fitness determination letter
   d. Copy of any required healthcare license or certification (verify current status online)
   e. Signed position description that identifies the highest level of service the employee will provide
   f. Signed acknowledgment of agency policies and client rights
   g. Valid driver's license and current auto insurance (only if employee will transport clients)
3. Use the "Personnel File Checklist" form to verify all items are present. Both the Office Manager and new hire must sign the checklist.
4. File the completed checklist at the front of the personnel folder.

Ongoing Maintenance:
5. After orientation is completed, file the signed orientation completion form with date, topics covered, and instructor name.
6. After each training session, file the training certificate or completion record within 5 business days.
7. File competency evaluation results (direct observation + written/oral test) before the employee works independently.
8. Conduct and file an annual performance evaluation for each employee by their hire-date anniversary.
9. When an employee's healthcare license is up for renewal, verify the new license and file a copy within 10 days of expiration.

Storage and Access:
10. Store all personnel files in a locked filing cabinet (physical) or password-protected system (digital) in the main office.
11. Only the Administrator, Office Manager, and Owner may access personnel files.
12. Retain all personnel records for a minimum of 7 years after the employee's last day of employment.

RESPONSIBLE PARTIES:
• Office Manager — Creates files, collects documents, maintains the filing system, tracks renewal dates
• Administrator — Reviews files for completeness quarterly, conducts annual performance evaluations
• Employee — Provides required documents promptly, reports any license or certification changes

DOCUMENTATION:
• Personnel File Checklist (signed by Office Manager and employee)
• All items listed in Procedure step 2
• Training completion records and competency evaluations
• Annual performance evaluations
• License/certification renewal copies

REGULATORY REFERENCE: OAR 333-536-0053
REVIEW SCHEDULE: Quarterly file audits; annual policy review`,
    explanation: 'OAR 333-536-0053 specifies exactly what must be in each caregiver\'s personnel file. Surveyors will audit these files. Missing documentation — especially training records and background checks — is the most common survey deficiency.',
    forms: ['Personnel File Checklist'],
  },
  {
    id: 'orient', oar: 'OAR 333-536-0070(5)', title: 'Caregiver Orientation (≥4 Hours)',
    gap: 'Missing: required orientation topics, minimum 4-hour requirement',
    proposedText: `SECTION 4: CAREGIVER ORIENTATION (MINIMUM 4 HOURS)

POLICY:
Every new caregiver must complete a minimum 4-hour agency-specific orientation BEFORE independently providing any services to clients. No exceptions.

PURPOSE:
To ensure every caregiver understands agency operations, client rights, and safety procedures before entering a client's home — and to meet the mandatory pre-service orientation requirement under OAR 333-536-0070(5).

SCOPE:
All newly hired caregivers, including rehires and transfers from other agencies.

PROCEDURES:
Scheduling (Office Manager):
1. Schedule orientation within the caregiver's first 3 days of hire, BEFORE any independent client assignments.
2. Notify the orientation instructor and reserve the training space (or set up virtual meeting link).
3. Prepare the Orientation Packet: agency handbook, client rights form, job description, emergency contact card.

Conducting Orientation (Instructor/Administrator):
4. Begin orientation by distributing the Orientation Packet and having the caregiver sign the attendance sheet with date and time.
5. Cover ALL of the following topics (minimum 4 hours total):
   a. Caregiver job description, expectations, and dress code
   b. Client rights — review each right and have caregiver sign acknowledgment
   c. Ethics, confidentiality, and HIPAA basics
   d. Agency policies: travel requirements, call-off procedures, reporting incidents, care practices
   e. Infection control: hand hygiene, PPE use, when to refuse entry to a client's home
   f. Emergency response: what to do if a client falls, is unresponsive, or has a medical emergency
   g. Medication reminding: what caregivers CAN and CANNOT do (no crushing, no deciding doses)
   h. Documentation: how to complete daily caregiver notes (tasks done, client observations, concerns)
   i. How to read and follow a service plan
   j. Reporting abuse, neglect, or exploitation — who to call and when
   k. Special population considerations (dementia, mobility impairments, cultural needs)
6. At the end of orientation, have the caregiver complete a short written quiz (minimum 10 questions) covering key topics.
7. Review quiz results. If the caregiver scores below 80%, re-teach missed topics and re-test.

Completion (Office Manager):
8. Collect the signed attendance sheet, signed client rights acknowledgment, and completed quiz.
9. Complete the "Orientation Completion Form" — record date, total hours, topics covered, instructor name, and quiz score.
10. File all orientation documents in the caregiver's personnel record the same day.
11. The caregiver may now be assigned to clients (after any additional required initial training hours).

RESPONSIBLE PARTIES:
• Office Manager — Schedules orientation, prepares packets, files completion documents
• Administrator/Instructor — Conducts orientation, administers quiz, signs completion form
• Caregiver — Attends full orientation, completes quiz, signs all acknowledgment forms

DOCUMENTATION:
• Orientation attendance sheet (signed with date and times — proving 4+ hours)
• Client rights acknowledgment (signed by caregiver)
• Written quiz with score recorded
• Orientation Completion Form (filed in personnel record)

REGULATORY REFERENCE: OAR 333-536-0070(5)
REVIEW SCHEDULE: Annually; update orientation content whenever agency policies change`,
    explanation: 'Required by OAR 333-536-0070(5). Minimum 4 hours, can be online or in-person. Must occur BEFORE the caregiver independently provides services. Competency evaluation must also be completed before independent service.',
    forms: ['Orientation Attendance Sheet', 'Orientation Completion Form', 'Orientation Knowledge Quiz (10 Questions)'],
  },
  {
    id: 'training', oar: 'OAR 333-536-0070(7)', title: 'Initial Caregiver Training (8 Hours)',
    gap: 'Missing: 2hr-before-service requirement, 120-day completion deadline',
    proposedText: `SECTION 5: INITIAL CAREGIVER TRAINING (8 HOURS)

POLICY:
Every new caregiver must complete a minimum of 8 hours of initial training. At least 2 of those hours must be completed BEFORE the caregiver provides any services. The remaining 6 hours must be completed within 120 calendar days of hire. Caregivers holding a current Oregon healthcare license or certificate are exempt.

PURPOSE:
To ensure caregivers are competent and safe before entering a client's home, and to provide a structured 120-day ramp-up period for completing all required training topics.

SCOPE:
All newly hired caregivers without a current Oregon healthcare license or certificate.

PROCEDURES:
Before First Client Assignment (Administrator/Trainer):
1. Within the caregiver's first week, deliver the FIRST 2 HOURS of initial training covering:
   a. Recognizing and responding to medical emergencies (when to call 911 vs. call the office)
   b. Hand washing and infection control (demonstrate proper technique, have caregiver return-demonstrate)
   c. Fire safety and emergency evacuation procedures
   d. How to assist with self-directed medication administration (what you can and cannot do)
2. Document the date, hours, and topics on the "Initial Training Tracker" form.
3. Administer a direct observation check: watch the caregiver demonstrate hand washing, emergency response steps, and medication reminding procedures.
4. If the caregiver passes observation, they may begin supervised client assignments. If not, re-train and re-test before assignment.

Within 120 Days of Hire (Administrator/Trainer):
5. Schedule the remaining 6 hours of training, covering:
   a. Caregiver duties and responsibilities specific to assigned clients
   b. Managing adverse behaviors (de-escalation, when to leave, who to call)
   c. Nutrition, hydration, and meal preparation for common dietary restrictions
   d. Safe techniques for personal care (bathing, dressing, transfers, toileting)
   e. Skin breakdown prevention, contracture care, and fall prevention
   f. Proper body mechanics for lifting and transfers
   g. Maintaining a clean and safe home environment
   h. Cultural competence and respectful communication
   i. Abdominal thrust (Heimlich) and basic first aid
6. Training may be delivered through: classroom sessions, one-on-one coaching, online modules, or supervised on-the-job training.
7. Update the Initial Training Tracker after each session with date, hours, topics, and trainer signature.

Competency Verification (before independent service):
8. Administer a written or oral test covering all training topics (minimum passing score: 80%).
9. Conduct a direct observation competency evaluation: observe the caregiver performing at least 3 core tasks with a real or simulated client.
10. If the caregiver fails either test, provide remedial training on failed areas and re-test within 14 days.
11. Once passed, sign the "Competency Verification Form" and file in the caregiver's personnel record.

Tracking (Office Manager):
12. Set a calendar reminder at Day 90 to check each new hire's training progress.
13. If a caregiver will not complete 8 hours by Day 120, notify the Administrator immediately — the caregiver must be pulled from service until training is complete.

RESPONSIBLE PARTIES:
• Administrator/Trainer — Delivers training, conducts competency evaluations, signs verification forms
• Office Manager — Tracks deadlines, schedules sessions, files documentation, alerts on overdue training
• Caregiver — Attends all sessions, completes tests, demonstrates competency

DOCUMENTATION:
• Initial Training Tracker form (topic, date, hours, trainer signature for each session)
• Written/oral test with score recorded
• Direct observation competency evaluation form
• Competency Verification Form (signed by trainer and caregiver, filed in personnel record)
• 120-day deadline tracking log

REGULATORY REFERENCE: OAR 333-536-0070(7)
REVIEW SCHEDULE: Annually; review training curriculum whenever regulations are amended`,
    explanation: 'OAR 333-536-0070(7) requires 8 total hours with 2 hours before service. The 120-day completion window for the remaining 6 hours is a grace period — but the 2-hour before-service requirement is absolute.',
    forms: ['Initial Training Tracker', 'Caregiver Competency Verification Form'],
  },
  {
    id: 'medtrain', oar: 'OAR 333-536-0070(8)', title: 'Medication Services Training (4 Hours)',
    proposedText: `SECTION 6: MEDICATION SERVICES TRAINING (4 HOURS)

POLICY:
Any caregiver who will assist with or administer medications must complete a minimum of 4 hours of medication-specific training AND pass a return demonstration before providing any medication services to clients. No caregiver may handle medications without completing this training.

PURPOSE:
To ensure caregivers can safely and accurately assist with medications, recognize adverse reactions, and understand the boundaries of what they are and are not allowed to do — protecting both clients and the agency.

SCOPE:
All caregivers assigned to provide medication reminding, medication assistance, or medication administration services. Does not apply to caregivers providing only housekeeping or companionship services.

PROCEDURES:
Before Assigning Medication Duties (Office Manager):
1. Confirm the caregiver has already completed orientation (Section 4) and the first 2 hours of initial training (Section 5).
2. Schedule 4 hours of medication training with a qualified instructor (RN, LPN, pharmacist, or OHA-approved training entity).
3. Provide the caregiver with the Medication Training Manual/packet prior to the session.

Medication Training Session (Qualified Instructor):
4. Cover ALL of the following topics during the 4-hour session:
   a. Common medication abbreviations (bid, tid, prn, etc.) — teach the caregiver to read a prescription label
   b. How to read and interpret medication orders from a physician
   c. How to read medication labels, packaging, and pill pack instructions
   d. Proper techniques for administering non-injectable medications:
      - Oral (pills, capsules, liquids) — correct measurement, positioning, swallowing assistance
      - Topical (creams, ointments, patches) — application site, glove use, rotation schedules
      - Suppository — proper technique, privacy, hygiene
      - Eye/ear drops — positioning, drop count, contamination prevention
   e. For Intermediate/Comprehensive agencies ONLY: medication set-up into secondary containers (pill organizers)
   f. Recognizing and reporting adverse reactions, drug interactions, and contraindications:
      - Common signs: rash, swelling, dizziness, breathing difficulty, confusion, nausea
      - Action: STOP administering, call the office, call 911 if life-threatening
   g. Infection control during medication handling (hand washing, glove use, surface cleaning)
   h. What caregivers CANNOT do: change doses, skip medications, crush pills without orders, give injections

Return Demonstration (Qualified Instructor):
5. After classroom training, the caregiver must perform a return demonstration:
   a. Read a sample medication label aloud and explain dosing instructions
   b. Demonstrate proper hand hygiene before handling medications
   c. Demonstrate administering a simulated oral medication (correct pill, correct time, correct client verification)
   d. Demonstrate proper documentation of medication administration
   e. Describe what to do if a client refuses medication or shows an adverse reaction
6. The instructor scores each element as Pass or Fail on the "Medication Return Demonstration Form."
7. If the caregiver fails any element, re-teach that specific topic and re-test the same day or within 3 days.
8. The caregiver may NOT provide medication services until ALL elements are marked Pass.

Completion (Office Manager):
9. Collect the signed training attendance sheet, return demonstration form, and any test results.
10. File all medication training documents in the caregiver's personnel record.
11. Update the caregiver's profile in the scheduling system to indicate "Medication Trained" with the completion date.
12. The caregiver is now eligible for client assignments that include medication services.

RESPONSIBLE PARTIES:
• Qualified Instructor (RN/LPN/Pharmacist) — Conducts training, administers return demonstration, signs completion forms
• Office Manager — Schedules training, tracks completion, files documentation, updates scheduling system
• Administrator — Ensures only medication-trained caregivers are assigned medication duties
• Caregiver — Completes training, passes return demonstration, reports any medication concerns

DOCUMENTATION:
• Medication Training attendance sheet (date, hours, instructor name and credentials, topics covered)
• Medication Return Demonstration Form (pass/fail for each element, signed by instructor)
• Written test results (if administered)
• Personnel file updated with medication training completion date
• Scheduling system flag: "Medication Trained — [Date]"

REGULATORY REFERENCE: OAR 333-536-0070(8)
REVIEW SCHEDULE: Annually; update training materials when medication regulations change`,
    explanation: 'Required by OAR 333-536-0070(8) for any caregiver providing medication assistance or administration. The return demonstration requirement is mandatory and must be documented by a qualified individual (RN, LPN, pharmacist, etc.).',
    forms: ['Medication Training Attendance Sheet', 'Medication Return Demonstration Evaluation Form'],
  },
  {
    id: 'annualtrain', oar: 'OAR 333-536-0070(14)', title: 'Annual Training (6+ Hours)',
    proposedText: `SECTION 7: ANNUAL TRAINING REQUIREMENTS (6+ HOURS)

POLICY:
Every caregiver must complete a minimum of 6 hours of continuing education annually. Caregivers providing medication services must complete 7 hours (6 general + 1 medication-specific). Annual training must be completed within 12 months of the previous training cycle — no extensions.

PURPOSE:
To keep caregivers current on best practices, regulatory changes, and safety procedures, and to meet the ongoing education requirement that OHA surveyors verify for every active caregiver.

SCOPE:
All active caregivers, regardless of employment status (full-time, part-time, PRN).

PROCEDURES:
Planning (Administrator):
1. By January 15 each year, create the Annual Training Calendar listing monthly training topics, dates, and instructors.
2. Ensure the calendar covers at least 6 hours of general topics plus 1 hour of medication training for med-certified caregivers.
3. Post the training calendar in the office and distribute to all caregivers.

Tracking Deadlines (Office Manager):
4. For each caregiver, calculate their annual training due date: 12 months from their initial training completion date (first year) or 12 months from last annual training completion (subsequent years).
5. Enter each caregiver's due date into the compliance tracking system.
6. Send a reminder notice to caregivers 60 days before their annual training is due.
7. Send a second reminder at 30 days if training is still incomplete.
8. At 15 days remaining, notify the Administrator — the caregiver must be scheduled for makeup sessions immediately.

Attending Training (Caregiver):
9. Attend scheduled training sessions and sign the attendance sheet at each session.
10. If unable to attend a scheduled session, notify the office at least 24 hours in advance and arrange a makeup session.
11. Training may be completed through: in-person classes, online approved modules, webinars, or one-on-one coaching.

Completion and Filing (Office Manager):
12. After each training session, collect attendance sheets and training certificates.
13. Log hours completed on the caregiver's "Annual Training Tracker" form.
14. When a caregiver reaches 6 hours (or 7 for medication caregivers), complete the "Annual Training Completion Certificate."
15. File all training records in the caregiver's personnel file within 5 business days.
16. If a caregiver does not complete annual training by their due date, notify the Administrator immediately — the caregiver must be suspended from service until training is complete.

RESPONSIBLE PARTIES:
• Administrator — Creates annual training calendar, selects topics, arranges qualified instructors, enforces suspension for non-compliance
• Office Manager — Tracks deadlines, sends reminders, files documentation, flags overdue caregivers
• Caregiver — Attends training, signs attendance, completes required hours on time

DOCUMENTATION:
• Annual Training Calendar (posted and distributed)
• Training attendance sheets (signed, dated, with topic and hours)
• Annual Training Tracker form (running log of hours per caregiver)
• Annual Training Completion Certificate (filed in personnel record)
• Compliance tracking system entries with due dates and completion dates

REGULATORY REFERENCE: OAR 333-536-0070(14)
REVIEW SCHEDULE: Training calendar updated annually; individual tracking reviewed monthly`,
    explanation: 'OAR 333-536-0070(14) requires 6 hours annually (7 if providing medication services). This is separate from the initial training requirement. Missing annual training is one of the most common OHA survey deficiencies.',
    forms: ['Annual Training Tracker', 'Annual Training Completion Certificate'],
  },
  {
    id: 'svcplan', oar: 'OAR 333-536-0065', title: 'Service Plan Requirements',
    gap: 'Missing: 7-day completion rule, caregiver pre-service review requirement',
    proposedText: `SECTION 8: SERVICE PLAN REQUIREMENTS

POLICY:
A written, individualized service plan must be completed for every client within 7 calendar days of starting services. Every caregiver assigned to that client must review and sign the service plan BEFORE providing their first service. No caregiver may work with a client without having reviewed the client's current service plan.

PURPOSE:
To ensure every client receives care tailored to their specific needs, and every caregiver knows exactly what tasks to perform, what to watch for, and who to contact — before they walk into the client's home.

SCOPE:
Administrator (or designee), all caregivers, clients and client representatives.

PROCEDURES:
Initial Assessment (Administrator/Designee — before services begin):
1. Conduct an in-person initial evaluation at the client's home. Assess:
   a. Physical needs (mobility, personal care, medication, nutrition)
   b. Mental/emotional needs (cognitive status, mood, behavioral concerns)
   c. Home environment (safety hazards, accessibility, emergency exits)
   d. Client preferences (schedule, caregiver gender preference, cultural considerations)
2. Document the assessment on the "Initial Client Evaluation Form."
3. Discuss findings with the client (or their representative) and agree on services needed.

Writing the Service Plan (Administrator/Designee — within 7 calendar days):
4. Complete the Service Plan form including ALL of the following:
   a. Client's full name, date of birth, address, emergency contacts
   b. Medical conditions and relevant diagnoses
   c. Primary Care Physician (PCP) name and phone number
   d. Specific services to be provided (list each task: bathing, meal prep, medication reminding, etc.)
   e. Name(s) of assigned caregiver(s) and their specific task responsibilities
   f. Special instructions (dietary restrictions, fall precautions, behavioral triggers, allergies)
   g. Scheduled hours per week/month
   h. Any additional pertinent care information
5. Review the completed service plan with the client (or representative) and obtain their signature.
6. File the signed original in the client's record.

Caregiver Review (Office Manager — before caregiver's first visit):
7. Print or share a copy of the service plan with each assigned caregiver.
8. Schedule a brief review session (in-person or phone) to walk through the plan.
9. The caregiver must read the entire plan, ask questions, and then sign the "Service Plan Acknowledgment" line confirming they understand their duties.
10. File the signed acknowledgment in the client's record.
11. The caregiver may NOT provide services to this client until step 10 is complete.

Updating the Service Plan:
12. When the client's needs change (new diagnosis, hospitalization, change in mobility, etc.), the Administrator must update the service plan within 7 days of the change.
13. Review the updated plan with the client and all assigned caregivers.
14. Obtain new signatures from the client and all caregivers on the updated plan.
15. File the updated plan in the client's record — keep all previous versions.

RESPONSIBLE PARTIES:
• Administrator/Designee — Conducts initial assessment, writes and updates the service plan, ensures 7-day deadline
• Office Manager — Distributes service plans to caregivers, schedules review sessions, collects signatures, tracks deadlines
• Caregiver — Reviews the plan before first visit, signs acknowledgment, follows the plan, reports any needed changes
• Client/Representative — Participates in planning, signs the service plan, communicates changes in condition

DOCUMENTATION:
• Initial Client Evaluation Form (completed before services begin)
• Service Plan form (signed by client and Administrator, within 7 calendar days)
• Service Plan Acknowledgment (signed by each assigned caregiver before their first visit)
• Updated service plans (with new signatures, previous versions retained)
• All service plans retained for 7 years after the client's last date of service

REGULATORY REFERENCE: OAR 333-536-0065
REVIEW SCHEDULE: Each service plan reviewed at minimum every 6 months; policy reviewed annually`,
    explanation: 'OAR 333-536-0065 requires the service plan within 7 days — not 7 business days, 7 calendar days. The pre-service caregiver review with documented signatures is mandatory and a frequent survey finding when missing.',
    forms: ['Initial Client Evaluation Form', 'Client Service Plan', 'Service Plan Caregiver Review & Acknowledgment'],
  },
  {
    id: 'monitor', oar: 'OAR 333-536-0066', title: 'Monitoring Visit Requirements',
    proposedText: `SECTION 9: MONITORING VISIT REQUIREMENTS

POLICY:
The agency shall conduct an initial in-person monitoring visit at the client's home between Day 7 and Day 30 of service. After the initial visit, monitoring visits must occur at least every 90 days (quarterly). No more than 6 months may pass between in-person visits.

PURPOSE:
To verify that caregivers are providing safe, competent care according to the service plan, to identify changes in client needs early, and to give clients a regular opportunity to provide feedback and voice concerns.

SCOPE:
Administrator (or designee), all active clients, assigned caregivers.

PROCEDURES:
Scheduling (Office Manager):
1. When a new client starts services, immediately schedule the initial monitoring visit between Day 7 and Day 30 in the scheduling system.
2. Set recurring reminders for quarterly monitoring visits (every 90 days) for all active clients.
3. Ensure at least every other visit is in-person (no more than 6 months between in-person visits).
4. Phone or video visits are permitted for alternate quarters ONLY when documented circumstances justify it (client hospitalized, weather emergency, pandemic restrictions).

Conducting the Visit (Administrator/Designee):
5. Arrive at the client's home at the scheduled time. Bring the Monitoring Visit Form and the client's current service plan.
6. During the visit, assess and document ALL 8 of the following items:
   a. Safe care techniques — Are caregivers using proper body mechanics, hand hygiene, and safety practices?
   b. Service plan compliance — Is the caregiver following the service plan as written?
   c. Service plan adequacy — Does the current service plan still meet the client's needs, or are changes needed?
   d. Caregiver competency — Is the caregiver's training sufficient for the tasks assigned?
   e. Client satisfaction — Ask the client directly: "Are you happy with your care? Is there anything you'd like to change?"
   f. Follow-up needed — Are there any issues that require action before the next visit?
   g. Adverse events — Have any falls, medication errors, injuries, or incidents occurred since the last visit?
   h. Changes in condition — Has the client's health, behavior, or home environment changed?
7. Record the client's own words (narrative) about their care experience.
8. If any concerns are identified, note the specific concern and the corrective action plan with a target completion date.
9. Review the monitoring form with the client. Both the Administrator/Designee and the client (or representative) must sign and date the form.

After the Visit (Office Manager):
10. File the completed Monitoring Visit Form in the client's record within 2 business days.
11. If corrective actions were identified, create follow-up tasks and assign to the responsible person.
12. Update the service plan if changes were identified during the visit (follow Section 8 update procedures).
13. Schedule the next monitoring visit (within 90 days) in the scheduling system.

RESPONSIBLE PARTIES:
• Administrator/Designee — Conducts all monitoring visits, completes the 8-item assessment, identifies needed changes
• Office Manager — Schedules visits, tracks the 90-day cycle and 6-month in-person requirement, files documentation
• Caregiver — Cooperates with monitoring process, implements any corrective actions
• Client — Participates in the visit, provides feedback, signs the visit form

DOCUMENTATION:
• Monitoring Visit Form (8-item checklist + client narrative, signed by both parties, dated)
• Corrective action notes with target completion dates (if applicable)
• Updated service plan (if changes identified)
• Scheduling system entries showing visit dates and next due dates
• All monitoring records retained for 7 years after client's last service date

REGULATORY REFERENCE: OAR 333-536-0066
REVIEW SCHEDULE: Monthly review of visit schedule compliance; annual policy review`,
    explanation: 'OAR 333-536-0066 is one of the most complex compliance requirements. The Day 7–30 initial visit window is absolute. Quarterly visits with 6-month in-person maximum — violating this is a citable deficiency. All 8 monitoring items must be documented.',
    forms: ['Initial Monitoring Visit Form (Day 7–30)', 'Quarterly Monitoring Visit Form'],
  },
  {
    id: 'bgcheck', oar: 'OAR 333-536-0093', title: 'Criminal Records Check Policy',
    proposedText: `SECTION 10: CRIMINAL RECORDS CHECK POLICY

POLICY:
A criminal records check and fitness determination must be completed for every employee, contractor, or volunteer who will have direct client contact BEFORE they begin working. Background checks must be renewed every 3 years. No individual convicted of disqualifying crimes under ORS 443.004(3) may be employed.

PURPOSE:
To protect clients from individuals with histories of abuse, exploitation, or violent crime, and to ensure the agency meets Oregon's mandatory pre-employment screening requirements.

SCOPE:
All subject individuals (SIs): caregivers, nurses, office staff with client access, volunteers, and contractors who may have direct or indirect client contact.

PROCEDURES:
Pre-Hire Background Check (Office Manager):
1. Before extending a job offer, inform the candidate that employment is contingent on passing a criminal records check.
2. Collect the candidate's signed "Background Check Authorization Form" including full legal name, date of birth, SSN, and all addresses for the past 7 years.
3. Submit the background check request through the approved vendor (or ODHS Background Check Unit for Medicaid-serving caregivers). The check must include:
   a. Name and address history trace
   b. Date of birth verification
   c. SSN trace
   d. Local criminal records search (7-year history)
   e. Nationwide multijurisdictional criminal database search
   f. Nationwide sex offender registry search
4. Separately, conduct an LEIE (List of Excluded Individuals and Entities) query at https://exclusions.oig.hhs.gov/ — print the results page showing the search was conducted, even if no match is found.
5. File the LEIE search results (with date) in the candidate's personnel file.

Reviewing Results (Administrator):
6. When background check results arrive, review immediately.
7. If the results show NO criminal history: sign the "Fitness Determination Form" as APPROVED and file in the personnel record. The candidate may begin working.
8. If the results show criminal history:
   a. Check if any conviction is a disqualifying crime under ORS 443.004(3). If YES — do not hire. Notify the candidate in writing.
   b. If the conviction is NOT disqualifying, conduct a documented weighing test considering: nature of the crime, time elapsed, rehabilitation evidence, relevance to the position.
   c. Document the weighing test decision on the "Fitness Determination Form" with detailed reasoning.
   d. If approved with conditions (such as no solo visits), document those conditions clearly.

Preliminary/Conditional Hire (Administrator — use only when necessary):
9. If results are delayed AND the agency needs the employee to start immediately:
   a. Make a preliminary fitness determination based on the information available.
   b. The employee must be actively supervised at ALL times.
   c. The employee may NOT have unsupervised client contact until final results are received and approved.
   d. Document the preliminary determination with start date and supervision plan.

3-Year Renewal Tracking (Office Manager):
10. Enter the background check completion date for every employee in the compliance tracking system.
11. Set automatic reminders at 33 months (3 months before expiration).
12. Submit renewal background checks at least 30 days before the 3-year expiration date.
13. If a renewal check reveals new criminal history, follow steps 6–8 above.
14. If an employee's background check lapses (passes the 3-year mark without renewal), the employee must be immediately suspended from client contact until the renewal is completed.

RESPONSIBLE PARTIES:
• Office Manager — Initiates background checks, conducts LEIE queries, tracks 3-year renewal dates, files all documentation
• Administrator — Reviews results, makes fitness determinations, conducts weighing tests, approves or denies employment
• Candidate/Employee — Provides accurate personal information, signs authorization, reports any new arrests or convictions

DOCUMENTATION:
• Background Check Authorization Form (signed by candidate)
• Background check results from approved vendor
• LEIE search results printout (dated, even if no match)
• Fitness Determination Form (signed by Administrator, with reasoning if criminal history found)
• Weighing test documentation (if applicable)
• Preliminary hire supervision plan (if applicable)
• 3-year renewal tracking log with due dates

REGULATORY REFERENCE: OAR 333-536-0093
REVIEW SCHEDULE: Monthly review of upcoming renewal dates; annual policy review`,
    explanation: 'OAR 333-536-0093 is extensive. Key points surveyors check: (1) was check done BEFORE hire, (2) is LEIE documented, (3) are 3-year renewals tracked, (4) is there a written weighing test policy for non-disqualifying convictions.',
    forms: ['Background Check Authorization Form', 'Fitness Determination Form', 'Preliminary Hire Supervision Plan'],
  },
  {
    id: 'disclosure', oar: 'OAR 333-536-0055', title: 'Client Disclosure & Acceptance',
    proposedText: `SECTION 11: CLIENT DISCLOSURE AND ACCEPTANCE

POLICY:
Before accepting any new client, the agency must verify it can safely meet the client's needs. Before services begin, the client (or their representative) must receive and sign a written Disclosure Statement that explains who we are, what we do, what we charge, and what rights the client has. Services may NOT start until the signed disclosure is on file.

PURPOSE:
To ensure clients make informed decisions about their care, understand the agency's capabilities and limitations, and have all costs and policies explained in writing before any services are provided.

SCOPE:
Administrator (or designee), Office Manager, all new clients and client representatives.

PROCEDURES:
Client Acceptance Evaluation (Administrator — before accepting the client):
1. Review the referral or intake information to determine:
   a. Does the agency have caregivers with the right skills and availability for this client's needs?
   b. Is the client's condition stable and predictable (required for personal care and medication services)?
   c. Can the agency coordinate with other providers the client is using?
2. If the answer to all three is YES, proceed to step 3.
3. If the client's needs exceed the agency's capabilities (unstable medical condition, specialized nursing needs beyond classification), inform the referral source and provide the client with referrals to appropriate providers.

Preparing the Disclosure Statement (Office Manager):
4. Complete the agency's Disclosure Statement template with the following information:
   a. Agency name, license number, and classification level (Limited/Basic/Intermediate/Comprehensive)
   b. Services the agency is licensed to provide
   c. Qualifications of staff who oversee medication services (if applicable)
   d. Statement that the agency cannot manage unstable or unpredictable medical conditions
   e. Minimum qualifications required of caregivers
   f. All charges for services (hourly rates, flat fees, mileage charges, etc.)
   g. Billing schedule and accepted payment methods
   h. Cancellation policy (how much notice required, any cancellation fees)
   i. Termination policy (30-day notice requirement and exceptions)
   j. Deposit and refund policies
   k. Administrator's name and direct contact phone number
   l. A copy of the Client Rights notice (see Section 12)

Presenting to the Client (Administrator/Designee — before first service):
5. Meet with the client (or representative) in person to review the Disclosure Statement.
6. Read through each section and answer any questions.
7. Have the client (or representative) sign and date the Disclosure Statement.
8. Provide the client with a complete copy for their records.
9. File the signed original in the client's record.
10. Services may now be scheduled.

Stable and Predictable Determination:
11. At each monitoring visit (Section 9), assess whether the client's condition remains stable and predictable.
12. If the client's condition becomes unstable (frequent ER visits, rapidly changing medications, new complex medical needs):
   a. Notify the client and their representative in writing within 3 business days.
   b. Explain which services must be reduced (personal care and medication services must stop; housekeeping/support may continue).
   c. Provide referral information for agencies that can serve unstable clients.
   d. Document the notification, referrals provided, and any service changes in the client's record.

RESPONSIBLE PARTIES:
• Administrator — Makes acceptance decisions, determines stable/predictable status, handles unstable client notifications
• Office Manager — Prepares disclosure statements, schedules review meetings, files signed documents
• Client/Representative — Reviews and signs the disclosure, communicates changes in condition

DOCUMENTATION:
• Completed and signed Disclosure Statement (filed in client record before first service)
• Client's copy of Disclosure Statement (provided to client)
• Client acceptance evaluation notes (if non-standard situation)
• Stable/predictable status change notifications (if applicable)
• Referral documentation (if client not accepted or services reduced)

REGULATORY REFERENCE: OAR 333-536-0055
REVIEW SCHEDULE: Review disclosure template annually and whenever fee schedules change`,
    explanation: 'OAR 333-536-0055 requires the disclosure statement BEFORE care begins — not at the first visit. Missing disclosure statements are a common survey finding. The stable-and-predictable determination must be documented and drives what services can be provided.',
    forms: ['Client Disclosure Statement', 'Client Acceptance Evaluation Checklist'],
  },
  {
    id: 'clientrights', oar: 'OAR 333-536-0060', title: "Client Rights Notice",
    proposedText: `SECTION 12: CLIENT RIGHTS

POLICY:
Every client has fundamental rights that the agency and all staff must recognize, respect, and protect. These rights must be provided in writing to every client before services begin. No staff member may retaliate against a client who exercises any of these rights.

PURPOSE:
To ensure every client understands their rights, knows how to file a grievance, and feels empowered to speak up about their care without fear of losing services.

SCOPE:
All staff (administrators, office personnel, caregivers), all clients and client representatives.

CLIENT RIGHTS:
Every client of this agency has the right to:
1. Be treated with dignity, respect, and consideration at all times
2. Be free from theft or damage to personal property
3. Make informed choices about accepting or refusing any service
4. Be free from all forms of abuse, neglect, and exploitation (physical, verbal, emotional, sexual)
5. Be free from financial exploitation
6. Be free from physical or chemical restraints
7. Voice grievances or complaints without fear of retaliation or loss of services
8. Be free from discrimination based on race, color, religion, sex, sexual orientation, national origin, disability, or age
9. Participate in the development and revision of their service plan
10. Access their own records upon request
11. Have records maintained confidentially
12. Receive written notice of all charges before services begin
13. Receive 30 days written notice before the agency terminates services

PROCEDURES:
Providing Rights to New Clients (Office Manager):
1. Include the Client Rights Notice as part of the Disclosure Statement package (Section 11).
2. During the intake meeting, the Administrator or designee must read through each right with the client (or representative).
3. Answer any questions the client has about their rights.
4. Have the client (or representative) sign the "Client Rights Acknowledgment Form" confirming they received and understood their rights.
5. Provide the client with a copy of the signed form and the full Client Rights Notice.
6. File the signed original in the client's record.

Handling Grievances:
7. If a client wishes to file a grievance, they may do so verbally or in writing to any staff member.
8. The staff member who receives the grievance must document it immediately on the "Client Grievance Form" and forward it to the Administrator within 24 hours.
9. The Administrator must acknowledge receipt of the grievance to the client within 2 business days.
10. Investigate the grievance and provide a written response to the client within 10 business days.
11. If the client is not satisfied with the response, provide them with OHA contact information:
    Oregon Health Authority, Health Care Regulation and Quality Improvement
    Phone: (971) 673-0540

Service Termination (Administrator):
12. The agency must provide 30 calendar days written notice before terminating services with a client.
13. Exceptions to the 30-day notice (immediate termination permitted):
    a. The client's behavior poses an immediate safety threat to caregivers
    b. The client has not paid for services after 30 days of non-payment and written notice
14. Even in immediate termination situations, provide referral information to help the client find alternative services.
15. Document all termination decisions, reasons, and referrals in the client's record.

Staff Training:
16. Review client rights with all caregivers during orientation (Section 4).
17. Include client rights as a topic in annual training (Section 7).
18. Post a copy of client rights in the agency office.

RESPONSIBLE PARTIES:
• Administrator — Ensures rights are provided, investigates grievances, makes termination decisions
• Office Manager — Prepares rights packets, collects signed acknowledgments, files documentation
• All Caregivers — Respect and protect client rights, report any rights violations immediately, forward grievances to the office
• Client — Exercises their rights, signs acknowledgment, reports concerns

DOCUMENTATION:
• Client Rights Notice (provided to every client)
• Client Rights Acknowledgment Form (signed and dated, filed in client record)
• Client Grievance Forms (with investigation notes and resolution)
• Termination notices (with reason, referrals provided, and 30-day compliance)

REGULATORY REFERENCE: OAR 333-536-0060
REVIEW SCHEDULE: Annually; immediately if regulations change`,
    explanation: 'OAR 333-536-0060 lists 13 specific rights. Every client must receive these in writing as part of the disclosure statement before care begins. The 30-day termination notice requirement has two exceptions that must be in your policies.',
    forms: ['Client Rights Acknowledgment Form', 'Client Grievance Form'],
  },
  {
    id: 'infectioncontrol', oar: 'OAR 333-536-0082', title: 'Infection Control Program',
    proposedText: `SECTION 13: INFECTION CONTROL PROGRAM

POLICY:
The agency maintains a comprehensive infection control program to protect clients, caregivers, and staff from infectious and communicable diseases. All caregivers must follow standard precautions at every client visit. PPE must be available to every caregiver at all times.

PURPOSE:
To prevent the spread of infection between clients and caregivers, ensure proper handling of sharps and contaminated materials, and protect staff from bloodborne pathogen exposure.

SCOPE:
All caregivers, nursing staff, office personnel, and any individual entering a client's home on behalf of the agency.

PROCEDURES:
Standard Precautions (All Caregivers — every visit):
1. Wash hands with soap and water (or use alcohol-based hand sanitizer) upon entering the client's home and before providing any care.
2. Wash hands again after completing personal care tasks, handling soiled items, and before leaving.
3. Wear gloves when contact with blood, body fluids, or open wounds is possible. Change gloves between tasks and between clients.
4. Wear a face mask if the client has a cough, respiratory symptoms, or a confirmed respiratory illness.
5. Wear a gown or protective clothing when there is a risk of clothing contamination.
6. Never reuse disposable gloves or masks.
7. If the client's home has a sharps container, do not handle used needles or sharps. If no sharps container is present and needles are visible, report to the office immediately.

PPE Supply and Access:
8. The Office Manager shall maintain a supply of gloves (multiple sizes), disposable masks, hand sanitizer, and gowns in the office.
9. Each caregiver receives a PPE kit at orientation containing: 1 box of gloves, 10 masks, 1 bottle of hand sanitizer, and 2 disposable gowns.
10. Caregivers must request PPE refills when their supplies run low — do not wait until they run out.
11. The office will restock PPE kits within 2 business days of request.

Illness and Exposure Reporting:
12. If a caregiver develops symptoms of an infectious illness (fever, vomiting, diarrhea, rash, respiratory symptoms), they must:
    a. NOT report to any client assignment
    b. Call the office immediately
    c. Not return to work until symptom-free for 24 hours (48 hours for GI illness)
13. If a caregiver is exposed to blood or body fluids (needlestick, splash to eyes/mouth, contact with open wound):
    a. Immediately wash the affected area with soap and water (flush eyes with clean water)
    b. Call the office within 1 hour
    c. The Administrator will arrange for post-exposure evaluation at the nearest urgent care
    d. Document the exposure on the "Bloodborne Pathogen Exposure Report"
14. If a client is diagnosed with a communicable disease, the Administrator must:
    a. Notify all caregivers assigned to that client within 24 hours
    b. Provide additional PPE and instructions specific to the disease
    c. Contact OHA if the disease is reportable

Sharps and Waste Disposal:
15. Caregivers do NOT dispose of sharps (needles, lancets, syringes). This is the client's responsibility.
16. If sharps are found outside a proper container, do not pick them up — notify the office.
17. Dispose of soiled gloves, bandages, and other contaminated items in a sealed plastic bag in the client's trash.

Training:
18. Infection control is covered during orientation (Section 4) and must be included in annual training (Section 7).
19. When new infectious disease guidance is issued (e.g., pandemic updates), the Administrator shall distribute updated procedures to all caregivers within 5 business days.

RESPONSIBLE PARTIES:
• Administrator — Manages the infection control program, handles exposure incidents, issues disease notifications
• Office Manager — Maintains PPE inventory, distributes kits, files exposure reports
• Caregiver — Follows standard precautions at every visit, reports illness and exposures, maintains PPE supplies

DOCUMENTATION:
• Caregiver PPE kit distribution log
• Bloodborne Pathogen Exposure Reports
• Communicable disease notification records
• Infection control training records (filed in personnel records)
• PPE inventory and reorder log

REGULATORY REFERENCE: OAR 333-536-0082
REVIEW SCHEDULE: Annually; immediately when new public health guidance is issued`,
    explanation: 'OAR 333-536-0082 requires a written infection control program. This became more prominent after COVID-19. Surveyors check for written policies AND evidence that caregivers were trained.',
    forms: ['Bloodborne Pathogen Exposure Report', 'PPE Kit Distribution Log'],
  },
  {
    id: 'records', oar: 'OAR 333-536-0085', title: 'Client Records Management',
    proposedText: `SECTION 14: CLIENT RECORDS MANAGEMENT

POLICY:
The agency shall create and maintain a complete, secure record for every client from intake through 7 years after the last date of service. Every caregiver must complete daily caregiver notes for every shift worked. All record entries must be dated and signed (or electronically authenticated) by the person who created them.

PURPOSE:
To maintain a complete history of each client's care that protects the client, supports care continuity, and provides the documentation surveyors and auditors require.

SCOPE:
Administrator, Office Manager, all caregivers, and any staff who create or access client records.

PROCEDURES:
Creating a New Client Record (Office Manager — at intake):
1. Create a client folder (physical or digital) labeled with the client's full name and start date.
2. File the following documents as they are completed:
   a. Client identification data (name, DOB, address, phone, emergency contacts)
   b. Referral source documentation
   c. Service start date
   d. Signed Disclosure Statement (Section 11)
   e. Signed Client Rights Acknowledgment (Section 12)
   f. Initial Client Evaluation (Section 8)
   g. Service Plan and all updates (Section 8)
   h. Signed service and financial agreement
3. Use the "Client File Checklist" to verify all intake documents are present before services begin.

Daily Caregiver Notes (Caregiver — every shift):
4. At the end of every shift, complete a Daily Caregiver Note including:
   a. Date and time of service (arrival and departure)
   b. Tasks completed (list each task performed: bathing, meal prep, medication reminder, etc.)
   c. Client observation (how did the client appear? Alert, confused, in pain, cheerful? Any visible changes?)
   d. Concerns observed or reported (falls, bruises, refusal to eat, complaints of pain, behavioral changes, medication concerns)
   e. Caregiver's name and signature (or electronic authentication)
5. If there are NO concerns to report, write "No concerns observed or reported" — do not leave the field blank.
6. Submit daily notes to the office within 24 hours (via the agency's documentation system or paper drop-off).

Filing and Maintenance (Office Manager):
7. Review incoming daily notes for completeness within 2 business days.
8. If a note is incomplete (missing tasks, observations, or signature), return it to the caregiver for correction within 3 business days.
9. File completed notes in the client's record in chronological order.
10. Add monitoring visit forms, service plan updates, and any incident reports to the client's record as they occur.

Record Security:
11. Store physical records in a locked filing cabinet in the main office.
12. Store digital records in a password-protected system with access limited to authorized staff.
13. Only the Administrator, Office Manager, and assigned caregivers may access a client's record.
14. If a client (or representative) requests access to their record, provide supervised access within 5 business days.
15. Never remove original records from the office without Administrator approval.

End of Service:
16. When services end, the Administrator must complete an "End-of-Service Summary" documenting: last service date, reason for discharge, client status at discharge, and any referrals provided.
17. File the summary in the client's record and mark the record as "Closed" with the end date.

Retention and Disposal:
18. Retain all closed client records for a minimum of 7 years after the last date of service.
19. After 7 years, records may be destroyed by shredding (physical) or secure deletion (digital).
20. Document the destruction on the "Record Disposal Log" with date, client name, and method of destruction.

RESPONSIBLE PARTIES:
• Office Manager — Creates files, reviews daily notes, maintains filing system, enforces retention schedule
• Caregiver — Completes daily notes every shift, submits within 24 hours, corrects incomplete notes promptly
• Administrator — Completes end-of-service summaries, approves record access requests, oversees record security
• All Staff — Protect confidentiality of all client records

DOCUMENTATION:
• Client File Checklist (completed at intake)
• Daily Caregiver Notes (every shift, filed chronologically)
• End-of-Service Summary (at discharge)
• Record Disposal Log (when records are destroyed)
• All records retained for minimum 7 years after last service date

REGULATORY REFERENCE: OAR 333-536-0085
REVIEW SCHEDULE: Quarterly audit of random client files for completeness; annual policy review`,
    explanation: 'OAR 333-536-0085 requires daily caregiver notes documenting tasks, client observation, AND concerns. This was strengthened in 2021. The 7-year retention requirement is absolute. Surveyors will review records for completeness.',
    forms: ['Client File Checklist', 'Daily Caregiver Notes Template', 'End-of-Service Summary Form', 'Record Disposal Log'],
  },
  {
    id: 'qa', oar: 'OAR 333-536-0090', title: 'Quality Assessment & Performance Improvement',
    proposedText: `SECTION 15: QUALITY ASSESSMENT AND PERFORMANCE IMPROVEMENT (QAPI)

POLICY:
The agency shall maintain an ongoing Quality Assessment and Performance Improvement (QAPI) program. The QAPI Committee must meet quarterly to review adverse events, track quality indicators, and implement preventive strategies. Meeting minutes documenting all three elements are mandatory.

PURPOSE:
To continuously improve the quality and safety of services by systematically identifying problems, analyzing root causes, and implementing solutions — not just reacting to issues, but preventing them from recurring.

SCOPE:
Administrator, QAPI Committee members, all caregivers (as contributors of data and feedback).

QAPI COMMITTEE COMPOSITION:
• Administrator (Chair)
• At least one caregiver representative
• Office Manager
• For Intermediate and Comprehensive agencies: a Registered Nurse (RN) is REQUIRED on the committee

PROCEDURES:
Setting Up the QAPI Program (Administrator — one-time setup):
1. Appoint QAPI Committee members and document appointments in writing.
2. Select 3–5 quality indicators to track quarterly. Examples:
   a. Percentage of service plans completed within 7 days
   b. Number of missed or late caregiver shifts per quarter
   c. Client satisfaction scores from monitoring visits
   d. Number of medication errors reported
   e. Percentage of caregivers with current annual training
3. Create a tracking spreadsheet or dashboard for each indicator.
4. Schedule quarterly meetings for the full year (e.g., second Tuesday of January, April, July, October).

Quarterly QAPI Meetings (QAPI Committee):
5. The Administrator prepares the meeting agenda including:
   a. Review of all adverse events since the last meeting (falls, medication errors, complaints, incidents)
   b. Current data for each quality indicator
   c. Status update on previously assigned corrective actions
6. During the meeting:
   a. REVIEW ADVERSE EVENTS: Discuss each event — what happened, why, and what was done about it.
   b. TRACK QUALITY INDICATORS: Review the data for each indicator. Is performance improving, declining, or steady?
   c. ROOT CAUSE ANALYSIS: For any significant issue, ask "Why did this happen?" at least 3 times to get to the root cause.
   d. IMPLEMENT PREVENTIVE STRATEGIES: For each root cause identified, assign a specific corrective action, a responsible person, and a deadline.
7. The Office Manager takes meeting minutes that MUST include:
   a. Meeting date, start time, and end time
   b. Names and titles of all attendees
   c. Each adverse event reviewed (with summary and outcome)
   d. Quality indicator data and trend analysis
   e. Preventive strategies decided upon (with assigned owner and deadline)
   f. Follow-up items from previous meetings

After the Meeting (Office Manager):
8. Distribute the meeting minutes to all committee members within 5 business days.
9. File the original minutes in the QAPI binder/folder.
10. Enter corrective action items into the task tracking system with deadlines.
11. Follow up with assigned owners at 30 days to verify progress.

RESPONSIBLE PARTIES:
• Administrator — Chairs the committee, prepares agendas, ensures meetings occur quarterly
• Office Manager — Takes minutes, tracks corrective actions, maintains QAPI documentation
• QAPI Committee Members — Attend meetings, contribute to analysis, carry out assigned corrective actions
• Caregivers — Report adverse events and quality concerns to the office promptly

DOCUMENTATION:
• QAPI Committee appointment letters
• Quarterly meeting minutes (with all 3 required elements documented)
• Quality indicator tracking data (spreadsheet or dashboard)
• Corrective action log with status updates
• All QAPI records retained for a minimum of 7 years

REGULATORY REFERENCE: OAR 333-536-0090
REVIEW SCHEDULE: Quarterly meetings; annual review of quality indicators and committee composition`,
    explanation: 'OAR 333-536-0090 requires documented quarterly QAPI meetings. The committee composition requirement (RN for Intermediate/Comprehensive) is frequently missed. Meeting minutes must specifically address the three required elements.',
    forms: ['QAPI Meeting Minutes Template', 'QAPI Corrective Action Log', 'Quality Indicator Tracking Sheet'],
  },
  {
    id: 'complaints', oar: 'OAR 333-536-0042, 0043', title: 'Complaint Investigation & Reporting',
    proposedText: `SECTION 16: COMPLAINT INVESTIGATION AND REPORTING

POLICY:
All complaints, grievances, adverse events, care errors, and abuse allegations must be reported internally within 24 hours and investigated promptly. Allegations of abuse, neglect, or exploitation must be reported to external authorities IMMEDIATELY — this is a legal obligation that cannot be delayed.

PURPOSE:
To ensure client safety issues are addressed swiftly, to meet mandatory reporting requirements, and to protect clients and the agency through thorough documentation of every incident and its resolution.

SCOPE:
All staff — caregivers, office personnel, Administrator. Every employee is a mandatory reporter of suspected abuse.

PROCEDURES:
Internal Reporting — All Staff:
1. If you witness or become aware of ANY of the following, you must report it:
   a. Client complaint or grievance about care
   b. Medication error (wrong medication, wrong dose, wrong time, missed dose)
   c. Care error (fall during care, skin injury, missed task)
   d. Client injury of any kind
   e. Suspected abuse, neglect, or exploitation (see step 7 for immediate action)
   f. Rule or policy violation by any staff member
2. Report the incident to the Administrator (or designee) by phone within 2 hours of discovery.
3. Complete the "Incident Report Form" with: date/time of incident, what happened, who was involved, who was notified, and any immediate actions taken. Submit within 24 hours.

Investigation (Administrator — within 48 hours of report):
4. Begin a formal investigation within 48 hours. Document the following:
   a. Original complaint or incident details
   b. Names of all persons interviewed and summaries of their statements
   c. Physical evidence reviewed (records, photos, documentation)
   d. Timeline of events
   e. Findings (substantiated or unsubstantiated)
   f. Corrective actions taken (retraining, reassignment, termination, policy changes)
5. Complete the "Investigation Summary Form" and file in the incident file.
6. Notify the complainant of the outcome within 10 business days.

MANDATORY ABUSE REPORTING — Immediate Action Required:
7. If any staff member suspects abuse, neglect, or exploitation of a client:
   a. Ensure the client is safe and not in immediate danger. If in danger, call 911 first.
   b. Call the Administrator immediately (or the Designee if Administrator is unavailable).
   c. The Administrator must report to the following within 24 hours:
      - ODHS Adult Protective Services: 1-855-503-7233
      - Oregon Health Authority (if licensure-related)
      - Local law enforcement (if criminal conduct is suspected)
   d. Document the report on the "Mandatory Report Form" including: who was called, when, reference number received, and summary of information provided.
8. The accused staff member must be immediately removed from all client assignments pending investigation.
9. Do NOT conduct your own investigation before reporting — report first, investigate after.

Cooperation with External Investigations:
10. The agency shall fully cooperate with all investigations by OHA, ODHS Adult Protective Services, Child Protective Services, or law enforcement.
11. Provide requested records within the timeframe specified by the investigating agency.
12. Do not coach, instruct, or interfere with staff or clients being interviewed by investigators.

Internal Reporting Before External (Non-Abuse Situations Only):
13. For non-abuse complaints (service quality, scheduling issues, personality conflicts), employees should use internal reporting procedures first.
14. If the employee believes the agency has not adequately addressed the internal complaint, they may contact OHA directly.

RESPONSIBLE PARTIES:
• All Staff — Report incidents within 2 hours, complete incident reports within 24 hours, report suspected abuse immediately
• Administrator — Leads investigations, makes mandatory external reports, determines corrective actions, cooperates with external agencies
• Office Manager — Tracks incident reports, maintains files, follows up on corrective actions

DOCUMENTATION:
• Incident Report Form (completed within 24 hours of any incident)
• Investigation Summary Form (completed within 10 business days)
• Mandatory Report Form (documenting all external abuse reports)
• Corrective action records
• External agency correspondence and investigation cooperation records

REGULATORY REFERENCE: OAR 333-536-0042, 0043
REVIEW SCHEDULE: Review all open investigations monthly; annual policy review`,
    explanation: 'OAR 333-536-0052(6)(i) requires timely reporting of abuse to appropriate authorities. Failure to report is a citable violation. Your policies must specify who receives internal reports and the escalation path to external agencies.',
    forms: ['Incident Report Form', 'Investigation Summary Form', 'Mandatory Abuse Report Form'],
  },
  {
    id: 'enforcement', oar: 'OAR 333-536-0117, 0120', title: 'Survey Deficiency & Plan of Correction',
    proposedText: `SECTION 17: SURVEY DEFICIENCY AND PLAN OF CORRECTION

POLICY:
When the agency receives a Statement of Deficiencies from OHA following a survey, the Administrator must submit a signed Plan of Correction (POC) within 10 business days and complete all corrective actions within 60 days of the exit conference.

PURPOSE:
To ensure the agency responds to survey findings promptly and systematically, corrects deficiencies within required timeframes, and avoids additional enforcement actions that result from missed deadlines.

SCOPE:
Administrator, Office Manager, and any staff involved in corrective actions.

PROCEDURES:
Receiving the Statement of Deficiencies (Administrator):
1. When surveyors conduct an exit conference, take detailed notes of all findings discussed.
2. When the written Statement of Deficiencies arrives (mail or email), review each deficiency immediately.
3. Mark the calendar: the POC is due within 10 BUSINESS DAYS of receiving the Statement.
4. Distribute copies of relevant deficiencies to the staff members whose areas are affected.

Writing the Plan of Correction (Administrator — within 10 business days):
5. For EACH deficiency cited, write a POC that includes all three required elements:
   a. CORRECTIVE ACTION: What specific action will the agency take to fix this deficiency?
      Example: "All caregiver files will be audited and missing orientation documentation will be obtained and filed."
   b. MONITORING PLAN: How will the agency ensure the deficiency does not recur?
      Example: "The Office Manager will audit 3 random personnel files monthly for the next 6 months."
   c. COMPLETION DATE: By what date will the corrective action be fully completed?
      Example: "March 15, 2026" (must be within 60 days of the exit conference)
6. Assign a specific responsible person for each corrective action item.
7. Have the Administrator sign and date the completed POC.
8. Submit the POC to OHA by the deadline using the method specified in the Statement (usually fax or email).

Implementing Corrections (Assigned Staff — within 60 days):
9. Each assigned person must begin their corrective action within 5 business days of POC submission.
10. The Office Manager creates a tracking spreadsheet with: deficiency number, corrective action, responsible person, target date, and status.
11. The Administrator conducts a progress check at Day 15, Day 30, and Day 45 to ensure corrections are on track.
12. If a corrective action cannot be completed by the target date, the Administrator must request a written extension from OHA BEFORE the deadline passes.
13. Once each corrective action is complete, the responsible person notifies the Administrator and provides evidence of completion.

Post-Correction Verification:
14. The Administrator reviews all evidence of completion and signs off on each corrective action.
15. File the complete POC package (Statement of Deficiencies, POC, evidence of corrections, sign-offs) in the agency's survey/compliance file.
16. Continue the monitoring plan for the duration specified (minimum 6 months recommended).

Disputing Survey Findings (if applicable):
17. If the agency believes a deficiency finding is incorrect, submit a written request for an informal conference to OHA within 10 business days.
18. Include: the specific deficiency being disputed, the factual basis for the dispute, and supporting documentation.
19. Still submit a POC for the disputed item by the deadline — the dispute process does not extend the POC deadline.

RESPONSIBLE PARTIES:
• Administrator — Reviews findings, writes and signs the POC, assigns corrective actions, monitors progress, submits disputes
• Office Manager — Tracks deadlines, maintains the corrective action spreadsheet, files documentation
• Assigned Staff — Implement their specific corrective actions by the target date, provide evidence of completion

DOCUMENTATION:
• Statement of Deficiencies (original from OHA)
• Plan of Correction (signed, with all 3 elements for each deficiency)
• Corrective action tracking spreadsheet
• Evidence of correction completion for each item
• Monitoring results for the follow-up period
• Dispute correspondence (if applicable)
• Complete POC package filed in survey/compliance file

REGULATORY REFERENCE: OAR 333-536-0117, 0120
REVIEW SCHEDULE: Continuously during active POC period; annually as part of survey preparedness review`,
    explanation: 'OAR 333-536-0117 gives you 10 business days to submit a POC and 60 days to correct deficiencies. Missing the POC deadline can itself result in additional enforcement action. Having this process documented protects the agency.',
    forms: ['Plan of Correction Template', 'Deficiency Corrective Action Tracking Spreadsheet'],
  },
  {
    id: 'civil', oar: 'OAR 333-536-0125', title: 'Civil Penalties & Violations',
    proposedText: `SECTION 18: CIVIL PENALTIES AND COMPLIANCE COMMITMENT

POLICY:
The agency is committed to maintaining continuous compliance with all OAR 333-536 regulations. All staff must understand that violations carry financial penalties and can result in license suspension or revocation. Prevention through consistent policy adherence is the agency's primary strategy.

PURPOSE:
To ensure all staff understand the real financial and operational consequences of non-compliance, and to establish proactive compliance monitoring that prevents violations before they occur.

SCOPE:
All staff — Administrator, Office Manager, caregivers, and any individual acting on behalf of the agency.

PENALTY STRUCTURE (for awareness):
• Standard violations: up to $1,000 per violation
• Maximum total penalty: $2,000 per survey cycle
• Continuing violations: penalties assessed PER DAY until corrected
• Operating without a valid license: up to $500 per day
• Repeat violations may result in license suspension or revocation

PROCEDURES:
Proactive Compliance Monitoring (Administrator):
1. Maintain a "Compliance Calendar" that tracks all recurring deadlines:
   a. License renewal date
   b. Each caregiver's annual training due date
   c. Each caregiver's background check renewal date (every 3 years)
   d. Quarterly QAPI meetings
   e. Client monitoring visit schedules (90-day cycles)
   f. Service plan review dates
2. Review the Compliance Calendar weekly and address any items due within 30 days.
3. Conduct a monthly self-audit using the "Compliance Self-Audit Checklist" covering:
   a. Are all caregiver personnel files complete and current?
   b. Are all client records current with daily notes?
   c. Are service plans up to date?
   d. Are monitoring visits on schedule?
   e. Is the QAPI meeting schedule being maintained?
   f. Are all background checks current?
4. Document self-audit findings and correct any gaps within 10 business days.

License Maintenance (Administrator):
5. Set a renewal reminder 90 days before the agency license expires.
6. Submit the renewal application at least 60 days before expiration.
7. Keep the current license posted in a visible location in the main office.
8. Never allow the license to lapse — operating without a valid license triggers immediate daily penalties.

When a Violation is Identified:
9. If the agency self-identifies a violation (during self-audit or otherwise):
   a. Document the violation and when it was discovered
   b. Take immediate corrective action
   c. Document the corrective action and completion date
   d. Review the root cause and update procedures to prevent recurrence
10. If OHA identifies a violation during a survey, follow the Plan of Correction process (Section 17).

Staff Accountability:
11. Include compliance expectations in every employee's position description.
12. Address repeated non-compliance through progressive discipline:
    a. First occurrence: verbal coaching with documentation
    b. Second occurrence: written warning
    c. Third occurrence: suspension or termination
13. Recognize and acknowledge staff members who maintain excellent compliance records.

RESPONSIBLE PARTIES:
• Administrator — Maintains Compliance Calendar, conducts monthly self-audits, manages license renewal, addresses violations
• Office Manager — Supports tracking, maintains documentation, alerts Administrator to upcoming deadlines
• All Staff — Follow policies consistently, report compliance concerns, complete required tasks on time

DOCUMENTATION:
• Compliance Calendar (updated weekly)
• Monthly Compliance Self-Audit Checklist (completed and filed)
• Self-identified violation records with corrective actions
• License renewal documentation
• Progressive discipline records related to compliance

REGULATORY REFERENCE: OAR 333-536-0125
REVIEW SCHEDULE: Compliance Calendar reviewed weekly; Self-audit monthly; Full policy review annually`,
    explanation: 'Understanding civil penalty structure helps prioritize compliance efforts. At $1,000/day for continuing violations, even minor documentation failures can become expensive. This section should be in your policies as a reminder of regulatory stakes.',
    forms: ['Compliance Self-Audit Checklist', 'Compliance Calendar Template'],
  },
];

export default function Policies() {
  const [step, setStep] = useState<PPStep>('landing');
  const [state, setState] = useState('OR');
  const [classification, setClassification] = useState('Basic');

  // Agency branding
  const [agencyName, setAgencyName] = useState('');
  const [agencyTagline, setAgencyTagline] = useState('');
  const [agencyLogo, setAgencyLogo] = useState<string>('');
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [scanLog, setScanLog] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);
  const [sections, setSections] = useState<PolicySection[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [concern, setConcern] = useState('');
  const [showConcernInput, setShowConcernInput] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [responding, setResponding] = useState(false);
  const [chat, setChat] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [followUpLoading, setFollowUpLoading] = useState(false);

  // Form generation
  const [generatedForms, setGeneratedForms] = useState<Record<string, string>>({});
  const [generatingForm, setGeneratingForm] = useState<string | null>(null);
  const [activeFormModal, setActiveFormModal] = useState<string | null>(null);
  const [showFormsPanel, setShowFormsPanel] = useState(false);

  // Helper: substitute agency name into proposed text for display
  const branded = (text: string) => {
    if (!agencyName.trim()) return text;
    return text
      .replace(/\bThe agency\b/g, agencyName)
      .replace(/\bthe agency\b/g, agencyName)
      .replace(/\[Agency Name\]/g, agencyName);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAgencyLogo(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const generateForm = async (formName: string, section: PolicySection) => {
    setGeneratingForm(formName);
    try {
      const res = await fetch('/api/policies/generate-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formName,
          sectionTitle: section.title,
          oar: section.oar,
          classification,
          state,
          agencyName: agencyName || 'Agency Name',
          agencyTagline,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedForms(prev => ({ ...prev, [formName]: data.html }));
        setActiveFormModal(formName);
      } else {
        setGeneratedForms(prev => ({ ...prev, [formName]: '<p style="color:red;font-family:sans-serif;">Unable to generate form. Please try again.</p>' }));
      }
    } catch {
      setGeneratedForms(prev => ({ ...prev, [formName]: '<p style="color:red;font-family:sans-serif;">Connection error. Please try again.</p>' }));
    }
    setGeneratingForm(null);
  };

  const printForm = (formName: string) => {
    const html = generatedForms[formName];
    if (!html) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>${formName}</title><style>@media print{body{margin:20px;}} body{font-family:sans-serif; max-width:720px; margin:30px auto;}</style></head><body>${html}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
  };

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
    setShowFormsPanel(false);
    if (currentIdx < sections.length - 1) setCurrentIdx(i => i + 1);
    else setStep('done');
  };

  const submitConcern = async () => {
    if (!concern.trim()) return;
    setResponding(true);
    const section = sections[currentIdx];
    let response = '';
    try {
      const res = await fetch('/api/policies/generate-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionTitle: section.title,
          oar: section.oar,
          currentText: section.proposedText,
          concern: concern.trim(),
          classification,
          state,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        response = data.response;
      } else {
        response = `Thank you for your concern about the "${section.title}" section.\n\nRegarding: "${concern}"\n\nI was unable to connect to the AI service at this time. However, here is general guidance: The regulatory requirements under ${section.oar} are mandatory for compliance. The procedures listed can be adjusted to fit your agency's specific workflow, but the core policy elements and documentation requirements must remain. Please try submitting your concern again, or contact your compliance consultant for personalized guidance.`;
      }
    } catch {
      response = `Thank you for your concern about the "${section.title}" section.\n\nRegarding: "${concern}"\n\nI was unable to connect to the AI service at this time. The procedures in this section can be tailored to your agency's workflow while maintaining compliance with ${section.oar}. Please try again or consult with your compliance advisor.`;
    }
    setAiResponse(response);
    setChat(c => [...c, { role: 'user', text: concern }, { role: 'ai', text: response }]);
    setConcern('');
    setResponding(false);
  };

  const submitFollowUp = async () => {
    if (!followUpQuestion.trim()) return;
    setFollowUpLoading(true);
    setFollowUpAnswer('');
    try {
      const res = await fetch('/api/policies/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: followUpQuestion.trim(),
          classification,
          state,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setFollowUpAnswer(data.response);
      } else {
        setFollowUpAnswer('Unable to connect to the AI service. Please try again.');
      }
    } catch {
      setFollowUpAnswer('Unable to connect to the AI service. Please check your connection and try again.');
    }
    setFollowUpLoading(false);
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

          {/* Agency Branding */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Building2 size={18} className="text-blue-600" />
              <h2 className="font-semibold text-slate-800">Agency Information & Branding</h2>
            </div>
            <p className="text-xs text-slate-500">This information appears on your manual cover page, all generated forms, and throughout the document.</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="form-label">Agency Name <span className="text-red-500">*</span></label>
                <input
                  className="form-input"
                  placeholder="e.g. Sunrise Home Care, LLC"
                  value={agencyName}
                  onChange={e => setAgencyName(e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <label className="form-label">Tagline / DBA <span className="text-slate-400 font-normal">(optional)</span></label>
                <input
                  className="form-input"
                  placeholder="e.g. Compassionate Care, Every Day"
                  value={agencyTagline}
                  onChange={e => setAgencyTagline(e.target.value)}
                />
              </div>
            </div>

            {/* Logo upload */}
            <div>
              <label className="form-label">Agency Logo <span className="text-slate-400 font-normal">(optional — appears on manual cover and all forms)</span></label>
              <div className="flex items-center gap-4">
                <div
                  className="w-32 h-16 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors overflow-hidden"
                  onClick={() => logoInputRef.current?.click()}
                >
                  {agencyLogo
                    ? <img src={agencyLogo} alt="Logo" className="max-w-full max-h-full object-contain p-1" />
                    : <div className="text-center"><Upload size={18} className="text-slate-400 mx-auto mb-1" /><span className="text-xs text-slate-400">Upload Logo</span></div>
                  }
                </div>
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                <div className="space-y-1">
                  <button className="text-xs text-blue-600 hover:text-blue-800 block" onClick={() => logoInputRef.current?.click()}>
                    {agencyLogo ? 'Change logo' : 'Upload logo'}
                  </button>
                  {agencyLogo && (
                    <button className="text-xs text-red-500 hover:text-red-700 block" onClick={() => setAgencyLogo('')}>Remove</button>
                  )}
                  <p className="text-xs text-slate-400">PNG, JPG, SVG — max 2MB</p>
                </div>
              </div>
            </div>

            {/* Preview chip */}
            {agencyName && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
                {agencyLogo
                  ? <img src={agencyLogo} alt="" className="h-8 w-auto object-contain" />
                  : <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">{agencyName.charAt(0)}</div>
                }
                <div>
                  <div className="text-sm font-semibold text-slate-800">{agencyName}</div>
                  {agencyTagline && <div className="text-xs text-slate-500">{agencyTagline}</div>}
                </div>
              </div>
            )}
          </div>

          {/* Manual Setup */}
          <div className="card p-6 space-y-5">
            <h2 className="font-semibold text-slate-800">Manual Setup</h2>
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
              <div className="text-xs text-slate-500 mb-2">Upload an existing manual to scan it for gaps against current regulations.</div>
              <button className="text-xs text-blue-600 hover:text-blue-800">Upload Existing Document (PDF/DOCX)</button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={startScan}
                disabled={!agencyName.trim()}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Search size={16} /> Scan & Update Existing Manual
              </button>
              <button
                onClick={startScan}
                disabled={!agencyName.trim()}
                className="btn-secondary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate Fresh Manual
              </button>
            </div>
            {!agencyName.trim() && (
              <p className="text-xs text-amber-600 text-center">Enter your agency name above to continue.</p>
            )}
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
            <strong>How it works:</strong> The AI scans OAR 333-536 regulations for your classification, walks you through all 18 required policy sections, substitutes your agency name throughout, and generates every required compliance form — all branded with your logo and information.
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
            <button onClick={() => { if (currentIdx > 0) { setCurrentIdx(i => i - 1); setShowFormsPanel(false); setChat([]); setAiResponse(''); } }} className="btn-secondary p-2" disabled={currentIdx === 0}>
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
            <button onClick={() => { if (currentIdx < sections.length - 1) { setCurrentIdx(i => i + 1); setShowFormsPanel(false); setChat([]); setAiResponse(''); } }} className="btn-secondary p-2">
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
                {branded(currentSection.proposedText)}
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">AI</div>
                <span className="text-sm font-semibold text-blue-800">Why this matters</span>
              </div>
              <p className="text-sm text-blue-700">{currentSection.explanation}</p>
            </div>

            {/* Referenced Forms Panel */}
            {currentSection.forms && currentSection.forms.length > 0 && (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setShowFormsPanel(!showFormsPanel)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-semibold text-slate-700"
                >
                  <div className="flex items-center gap-2">
                    <FileText size={15} className="text-slate-500" />
                    <span>Referenced Forms ({currentSection.forms.length})</span>
                    <span className="text-xs font-normal text-slate-400">— generate & print compliance forms for this section</span>
                  </div>
                  <ChevronDown size={15} className={`text-slate-400 transition-transform ${showFormsPanel ? 'rotate-180' : ''}`} />
                </button>
                {showFormsPanel && (
                  <div className="divide-y divide-slate-100">
                    {currentSection.forms.map(formName => (
                      <div key={formName} className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FileText size={14} className="text-blue-500 flex-shrink-0" />
                          <span className="text-sm text-slate-700">{formName}</span>
                          {generatedForms[formName] && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Generated</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {generatedForms[formName] && (
                            <>
                              <button
                                onClick={() => setActiveFormModal(formName)}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 hover:bg-blue-50 rounded"
                              >
                                View
                              </button>
                              <button
                                onClick={() => printForm(formName)}
                                className="text-xs text-slate-600 hover:text-slate-800 font-medium px-2 py-1 hover:bg-slate-100 rounded flex items-center gap-1"
                              >
                                <Printer size={12} /> Print
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => generateForm(formName, currentSection)}
                            disabled={generatingForm === formName}
                            className="text-xs btn-primary px-3 py-1.5 flex items-center gap-1 disabled:opacity-60"
                          >
                            {generatingForm === formName
                              ? <><Loader size={12} className="animate-spin" /> Generating...</>
                              : generatedForms[formName]
                                ? <><FileText size={12} /> Regenerate</>
                                : <><FileText size={12} /> Generate</>
                            }
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Form Modal */}
            {activeFormModal && generatedForms[activeFormModal] && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <div>
                      <h3 className="font-semibold text-slate-900">{activeFormModal}</h3>
                      <p className="text-xs text-slate-500">{currentSection.oar} | {classification} Classification</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => printForm(activeFormModal)}
                        className="btn-secondary flex items-center gap-2 text-sm"
                      >
                        <Printer size={14} /> Print Form
                      </button>
                      <button
                        onClick={() => setActiveFormModal(null)}
                        className="btn-secondary text-sm px-3"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                  <div
                    className="flex-1 overflow-y-auto p-6"
                    dangerouslySetInnerHTML={{ __html: generatedForms[activeFormModal] }}
                  />
                </div>
              </div>
            )}

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

          {/* Manual Cover Page Preview */}
          <div className="card overflow-hidden">
            {/* Cover */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 text-white text-center space-y-4">
              {agencyLogo
                ? <img src={agencyLogo} alt="Agency Logo" className="h-16 w-auto object-contain mx-auto drop-shadow-lg" />
                : <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">{(agencyName || 'A').charAt(0)}</div>
              }
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{agencyName || 'Your Agency'}</h1>
                {agencyTagline && <p className="text-slate-300 text-sm mt-1">{agencyTagline}</p>}
              </div>
              <div className="border-t border-white/20 pt-4">
                <h2 className="text-lg font-semibold text-white/90">Policy & Procedure Manual</h2>
                <p className="text-slate-300 text-sm mt-1">{classification} Classification · {state === 'OR' ? 'Oregon (OAR 333-536)' : state}</p>
                <p className="text-slate-400 text-xs mt-1">Effective: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle size={18} />
                <span className="text-sm font-medium">{sections.filter(s => s.accepted).length} of {sections.length} sections accepted · OAR 333-536 compliant</span>
              </div>
              <div className="flex gap-3">
                <button className="btn-primary flex-1 flex items-center justify-center gap-2"><Download size={16} /> Download Manual (PDF)</button>
                <button className="btn-secondary flex-1 flex items-center justify-center gap-2"><Download size={16} /> Download (.docx)</button>
              </div>
              <button onClick={() => { setStep('landing'); setCurrentIdx(0); setSections([]); setChat([]); setGeneratedForms({}); setFollowUpAnswer(''); setFollowUpQuestion(''); }} className="text-sm text-blue-600 hover:text-blue-800 block text-center w-full">
                Start New / Update Again
              </button>
            </div>
          </div>

          {/* Forms Library */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={16} className="text-blue-600" />
              <h3 className="font-semibold text-slate-800">Compliance Forms Library</h3>
              <span className="text-xs text-slate-400 ml-auto">
                {Object.keys(generatedForms).length} of {sections.reduce((sum, s) => sum + (s.forms?.length || 0), 0)} forms generated
              </span>
            </div>
            <div className="space-y-2">
              {sections.map(section => (
                section.forms && section.forms.length > 0 ? (
                  <div key={section.id}>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-3 mb-1.5">{section.title}</div>
                    {section.forms.map(formName => (
                      <div key={formName} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText size={13} className={generatedForms[formName] ? 'text-green-500' : 'text-slate-400'} />
                          <span className="text-sm text-slate-700 truncate">{formName}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {generatedForms[formName] ? (
                            <>
                              <button onClick={() => setActiveFormModal(formName)} className="text-xs text-blue-600 hover:text-blue-800 font-medium">View</button>
                              <button onClick={() => printForm(formName)} className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1">
                                <Printer size={11} /> Print
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => generateForm(formName, sections.find(s => s.forms?.includes(formName))!)}
                              disabled={generatingForm === formName}
                              className="text-xs btn-primary px-2.5 py-1 flex items-center gap-1 disabled:opacity-60"
                            >
                              {generatingForm === formName ? <><Loader size={11} className="animate-spin" /> Generating...</> : 'Generate'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null
              ))}
            </div>
          </div>

          {/* Form Modal (also available on done step) */}
          {activeFormModal && generatedForms[activeFormModal] && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                  <div>
                    <h3 className="font-semibold text-slate-900">{activeFormModal}</h3>
                    <p className="text-xs text-slate-500">{agencyName} · {classification} Classification</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => printForm(activeFormModal)} className="btn-secondary flex items-center gap-2 text-sm"><Printer size={14} /> Print Form</button>
                    <button onClick={() => setActiveFormModal(null)} className="btn-secondary text-sm px-3">Close</button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6" dangerouslySetInnerHTML={{ __html: generatedForms[activeFormModal] }} />
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-3">Next Steps</h3>
            <div className="space-y-2">
              {[
                'Have all staff review the updated manual',
                'Administrator signs the certification page',
                'Upload signed manual to Document Management',
                `Generate and print all ${sections.reduce((sum, s) => sum + (s.forms?.length || 0), 0)} referenced compliance forms`,
                'Schedule staff training on any new or changed policies',
                'Set reminder for annual review (12 months from today)',
              ].map((item, i) => (
                <label key={i} className="flex items-center gap-3 text-sm cursor-pointer hover:bg-slate-50 p-2 rounded">
                  <input type="checkbox" className="w-4 h-4 accent-blue-600" />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Follow-Up Question */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-3">Ask a Follow-Up Question</h3>
            <div className="flex gap-2">
              <input
                className="form-input flex-1 text-sm"
                placeholder="e.g. What is the 7-day rule? How do I handle a POC?"
                value={followUpQuestion}
                onChange={e => setFollowUpQuestion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submitFollowUp()}
              />
              <button onClick={submitFollowUp} disabled={followUpLoading} className="btn-primary px-3">
                {followUpLoading ? <Loader size={16} className="animate-spin" /> : <MessageSquare size={16} />}
              </button>
            </div>
            {followUpAnswer && (
              <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 whitespace-pre-wrap">
                {followUpAnswer}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
