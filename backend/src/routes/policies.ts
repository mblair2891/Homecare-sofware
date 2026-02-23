import { Router, Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();

const getClient = () => new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// POST /api/policies/generate-section
// Called when a user submits a concern about a policy section
router.post('/generate-section', async (req: Request, res: Response) => {
  try {
    const { sectionTitle, oar, currentText, concern, classification, state } = req.body;

    if (!sectionTitle || !oar || !concern) {
      return res.status(400).json({ error: 'sectionTitle, oar, and concern are required' });
    }

    const message = await getClient().messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `You are an expert policy and procedure manual writer for ${state || 'Oregon'} in-home care agencies, specifically knowledgeable about OAR 333-536.

IMPORTANT: You write POLICIES AND PROCEDURES — not regulation summaries. A policy is a company rule (what and why). A procedure is step-by-step instructions for how staff carry out that policy (the recipe).

You are helping a ${classification || 'Basic'} classified in-home care agency refine their Policy & Procedure manual.

Section: ${sectionTitle}
Regulatory Reference: ${oar}
Current Proposed Policy & Procedure Text:
${currentText}

The agency coordinator has the following concern or question:
"${concern}"

Please:
1. Address their concern directly and clearly
2. If the regulatory requirement is non-negotiable, explain WHY (what surveyors look for, real consequences)
3. If the language can be adjusted, provide a REVISED version that:
   - Keeps a clear Policy Statement (the company rule)
   - Keeps step-by-step Procedures (how staff actually do it day-to-day)
   - Keeps Responsible Parties identified
   - Maintains full regulatory compliance
4. Write in plain, actionable language that a new employee could follow
5. Be concise (3-5 paragraphs maximum)

Format your response as plain text without markdown headers.`
        }
      ]
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : 'Unable to generate response';

    res.json({ response: responseText, tokensUsed: message.usage.input_tokens + message.usage.output_tokens });
  } catch (err) {
    console.error('Policy generation error:', err);
    res.status(500).json({ error: 'Failed to generate policy response' });
  }
});

// POST /api/policies/chat
// Follow-up questions after manual is complete
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { question, classification, state, manualContext } = req.body;

    if (!question) return res.status(400).json({ error: 'question is required' });

    const message = await getClient().messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1200,
      messages: [
        {
          role: 'user',
          content: `You are an expert policy and procedure consultant for ${state || 'Oregon'} in-home care agencies (OAR 333-536).

Agency classification: ${classification || 'Basic'}

The agency has completed their Policy & Procedure manual and has a follow-up question:
"${question}"

Answer practically and clearly. Where relevant:
- Reference the specific OAR section
- Explain what the agency should DO (step-by-step procedures), not just what the law says
- Identify who is responsible for the action
- Note what documentation is needed
Keep response to 2-3 paragraphs.`
        }
      ]
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : 'Unable to generate response';
    res.json({ response: responseText });
  } catch (err) {
    console.error('Policy chat error:', err);
    res.status(500).json({ error: 'Failed to process question' });
  }
});

// POST /api/policies/generate-full-section
// Generates a complete P&P section from scratch in proper format
router.post('/generate-full-section', async (req: Request, res: Response) => {
  try {
    const { sectionTitle, oar, classification, state, agencyName } = req.body;

    if (!sectionTitle || !oar) {
      return res.status(400).json({ error: 'sectionTitle and oar are required' });
    }

    const message = await getClient().messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `You are an expert policy and procedure manual writer for ${state || 'Oregon'} in-home care agencies.

Write a COMPLETE Policy & Procedure section for a ${classification || 'Basic'} classified in-home care agency.

Section: ${sectionTitle}
Regulatory Reference: ${oar}
Agency Name: ${agencyName || 'The Agency'}

IMPORTANT: Write an actual POLICY AND PROCEDURE — NOT a regulation summary. Follow this exact format:

POLICY:
[A clear, 1-3 sentence company rule statement — what the agency requires and why]

PURPOSE:
[Why this policy exists — compliance need + operational benefit, 1-2 sentences]

SCOPE:
[Who this policy applies to — list the roles]

PROCEDURES:
[Numbered step-by-step instructions that tell an employee EXACTLY what to do, when, and how. These should be actionable "recipes" — like "1. Open the personnel file in the filing cabinet..." not "The agency shall maintain records..."]

RESPONSIBLE PARTIES:
[Bullet list of who does what — Administrator, Office Manager, Caregiver, etc.]

DOCUMENTATION REQUIREMENTS:
[What forms/records to create, where to store them, how long to keep them]

REGULATORY REFERENCE: ${oar}
REVIEW SCHEDULE: [When to review this policy]

Write in plain language a new hire could understand. Be specific and practical. Use "${agencyName || 'The Agency'}" as the company name.`
        }
      ]
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    res.json({ content: responseText, tokensUsed: message.usage.input_tokens + message.usage.output_tokens });
  } catch (err) {
    console.error('Full section generation error:', err);
    res.status(500).json({ error: 'Failed to generate policy section' });
  }
});

// POST /api/policies/scan
// Scans existing policy text against current regulations
router.post('/scan', async (req: Request, res: Response) => {
  try {
    const { existingPolicyText, classification, state } = req.body;

    const message = await getClient().messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `You are an expert in ${state || 'Oregon'} in-home care agency regulations (OAR 333-536).

Review the following policy document for a ${classification || 'Basic'} classified agency against current Oregon regulations. Identify:
1. Sections that are missing or incomplete
2. Sections that need updating based on recent OAR amendments (PH 50-2023, PH 59-2024)
3. Sections that are compliant

Policy Document:
${existingPolicyText || '(No existing document uploaded)'}

Provide a structured gap analysis listing each required policy area and its current status. Be specific about which OAR sections apply.`
        }
      ]
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    res.json({ analysis: responseText });
  } catch (err) {
    console.error('Policy scan error:', err);
    res.status(500).json({ error: 'Failed to scan policy document' });
  }
});

// POST /api/policies/generate-form
// Generates a regulation-compliant printable form with agency branding
router.post('/generate-form', async (req: Request, res: Response) => {
  try {
    const { formName, sectionTitle, oar, classification, state, agencyName, agencyTagline } = req.body;

    if (!formName || !oar) {
      return res.status(400).json({ error: 'formName and oar are required' });
    }

    const brandName = agencyName || '[AGENCY NAME]';
    const brandTagline = agencyTagline ? `\n${agencyTagline}` : '';

    const message = await getClient().messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `You are creating a professional, printable compliance form for a ${state || 'Oregon'} in-home care agency.

Agency: ${brandName}${brandTagline}
Form Name: ${formName}
Related Policy Section: ${sectionTitle}
Regulatory Reference: ${oar}
Agency Classification: ${classification || 'Basic'}

Generate the form as an HTML document body (no <html>/<head>/<body> tags). Use ONLY inline styles.

REQUIRED STRUCTURE:
1. HEADER (centered):
   - Agency logo placeholder: <div style="border:2px solid #ccc; width:120px; height:60px; margin:0 auto 8px; display:flex; align-items:center; justify-content:center; font-size:11px; color:#999; font-family:sans-serif;">AGENCY LOGO</div>
   - Agency name: <h2 style="margin:0; font-family:sans-serif; font-size:18px; color:#1e3a5f;">${brandName}</h2>
   - Form title: <h1 style="margin:6px 0 2px; font-family:sans-serif; font-size:15px;">${formName}</h1>
   - Reference: <p style="margin:0 0 8px; font-size:11px; color:#555; font-family:sans-serif;">${oar} | ${classification || 'Basic'} Classification</p>
   - Horizontal rule

2. INSTRUCTIONS (small, italic, left-aligned):
   "Complete all fields. Print legibly. Retain in [appropriate record] for minimum [X] years per OAR requirements."

3. FORM FIELDS — use a clean table layout:
   - Each field: label (bold, left column ~35%), blank line input area (right column ~65%)
   - Use <table style="width:100%; border-collapse:collapse; margin-top:12px;"> with <tr> rows
   - Each cell: <td style="padding:6px 4px; font-family:sans-serif; font-size:12px;">
   - Input area: <td style="border-bottom:1px solid #333; padding:6px 4px; font-family:sans-serif; font-size:12px; min-width:200px;">&nbsp;</td>
   - Section headers (e.g., "CAREGIVER INFORMATION"): full-width row with bold text, light gray background
   - Checkboxes for yes/no or checklist items: ☐ label text

4. REQUIRED FIELDS — include EVERY field that ${oar} mandates for documenting "${formName}". Be comprehensive and specific to the regulation.

5. SIGNATURE BLOCK at bottom (separate table):
   - Signature line | Printed Name | Title | Date
   - Multiple signature rows if regulation requires multiple parties to sign

6. FOOTER:
   <p style="font-size:10px; color:#666; font-family:sans-serif; text-align:center; margin-top:20px; border-top:1px solid #ddd; padding-top:8px;">
   ${brandName} | ${formName} | Version 1.0 | ${oar} | Retain per agency record retention policy
   </p>

Make the form comprehensive and professional. All fields must satisfy the specific documentation requirements in ${oar} for this form type.

Return ONLY the HTML markup. No explanation text, no code fences.`
        }
      ]
    });

    const html = message.content[0].type === 'text' ? message.content[0].text : '';
    res.json({ html, tokensUsed: message.usage.input_tokens + message.usage.output_tokens });
  } catch (err) {
    console.error('Form generation error:', err);
    res.status(500).json({ error: 'Failed to generate form' });
  }
});

export default router;
