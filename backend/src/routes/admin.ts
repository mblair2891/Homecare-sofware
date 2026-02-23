import { Router, Request, Response } from 'express';

const router = Router();

// ─── Mock Oregon OHA In-Home Care Agency License Database ───────────────────
// Real implementation: POST to https://apps.health.oregon.gov/FacilityProfiles/Search/Facility
// parse HTML response for license details.
// Each state's database URL/API would be configured per state.

interface LicenseRecord {
  agencyName: string;
  classification: 'Limited' | 'Basic' | 'Intermediate' | 'Comprehensive';
  licenseType: string;
  status: 'Active' | 'Expired' | 'Suspended' | 'Pending' | 'Revoked';
  issuedDate: string;
  expiryDate: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  county: string;
  phone: string;
  directorName?: string;
  capacity?: number;
  conditions?: string[];
}

// TODO: Replace with real OHA state database call when API integration is available.
// See commented example below the verify-license route.
const OREGON_LICENSES: Record<string, LicenseRecord> = {};

// Oregon license format: IHC-YYYY-NNN  (In-Home Care – year – sequence)
const OR_LICENSE_REGEX = /^IHC-\d{4}-\d{3,4}$/i;

const STATE_FORMATS: Record<string, { regex: RegExp; label: string }> = {
  OR: { regex: OR_LICENSE_REGEX, label: 'IHC-YYYY-NNN (e.g. IHC-2024-001)' },
  WA: { regex: /^HCA-\d{6}$/i, label: 'HCA-NNNNNN' },
  CA: { regex: /^CA-IHSS-\d{5}$/i, label: 'CA-IHSS-NNNNN' },
  // Add more states as needed
};

router.post('/verify-license', async (req: Request, res: Response) => {
  const { licenseNumber, state } = req.body as { licenseNumber: string; state: string };

  if (!licenseNumber || !state) {
    return res.status(400).json({ message: 'License number and state are required.' });
  }

  const normalized = licenseNumber.trim().toUpperCase();
  const format = STATE_FORMATS[state.toUpperCase()];

  if (format && !format.regex.test(normalized)) {
    return res.status(400).json({
      message: `Invalid license format for ${state}. Expected: ${format.label}`,
    });
  }

  // Simulate network latency hitting the state database
  await new Promise((r) => setTimeout(r, 1500));

  // TODO: Replace with real state database call
  // Example for Oregon:
  // const ohaRes = await fetch('https://apps.health.oregon.gov/FacilityProfiles/Search/Facility', {
  //   method: 'POST',
  //   body: new URLSearchParams({ LicenseNumber: normalized, FacilityType: 'InHomeCareAgency' }),
  // });
  // const html = await ohaRes.text();
  // const record = parseOHAFacilityProfile(html);

  const record = OREGON_LICENSES[normalized];

  if (!record) {
    // Valid format but not found in state database
    return res.status(404).json({
      message: `License ${normalized} was not found in the ${state} state database. Verify the number and try again.`,
    });
  }

  return res.status(200).json(record);
});

export default router;
