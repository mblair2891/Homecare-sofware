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
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are an expert in ${state || 'Oregon'} in-home care agency regulations, specifically OAR 333-536.

You are helping a ${classification || 'Basic'} classified in-home care agency update their Policy & Procedure manual.

Section: ${sectionTitle}
Regulatory Reference: ${oar}
Current Proposed Policy Text:
${currentText}

The agency coordinator has the following concern or question:
"${concern}"

Please:
1. Address their concern directly and clearly
2. If the regulatory requirement is non-negotiable, explain why and what surveyors specifically look for
3. If the language can be adjusted, provide a revised version that still maintains compliance
4. Keep the response practical and actionable
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
      max_tokens: 800,
      messages: [
        {
          role: 'user',
          content: `You are an expert in ${state || 'Oregon'} in-home care agency regulations (OAR 333-536).

Agency classification: ${classification || 'Basic'}

Question: ${question}

Answer this question clearly and practically, referencing specific OAR sections where relevant. Keep response to 2-3 paragraphs.`
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

export default router;
