# CareAxis — Homecare Agency Management System

A comprehensive, Oregon-regulation-compliant homecare agency management platform for multi-location non-medical home care agencies.

## Features

### Core Modules
- **Dashboard** — Live KPIs, compliance alerts, EVV feed, location summary
- **Clients** — Full client files, compliance notices, 11 pre-populated Oregon forms
- **Caregivers** — Credential tracking, training compliance, personnel records
- **Scheduling & EVV** — Weekly schedule, GPS/telephony clock-in/out, open shift broadcasting
- **Billing & Payroll** — Oregon OT calculations, Medicaid/private billing, ADP/QuickBooks export
- **HR & Compliance** — Oregon labor law dashboard, cert tracker, incident reporting
- **Messaging** — In-app messaging, broadcast notifications
- **Locations** — Multi-location management, expansion pipeline tracking
- **Recruiting** — Kanban pipeline, job postings, Oregon onboarding checklist
- **Reports** — 12-report library, scheduled reports, data exports
- **OR Compliance** — Full OAR 333-536 compliance dashboard (10 sections)
- **Policy & Procedures** — AI-powered P&P generator with 18-section Oregon review
- **Settings** — Agency info, billing rates, users/roles, 10 integrations

### Oregon OAR 333-536 Compliance Coverage
- License classification and renewal (§0007, §0010, §0025)
- Service plans within 7 days (§0065)
- Monitoring visits: Day 7–30 initial + quarterly 90-day + 6-month in-person max (§0066)
- Caregiver training: 4hr orientation, 8hr initial, 4hr medication, 6hr annual (§0070)
- Criminal records checks every 3 years + LEIE (§0093)
- Client disclosure before service (§0055, §0060)
- Self-direction 90-day re-evaluations (§0045)
- QA quarterly meetings with committee requirements (§0090)
- Plan of Correction 10-day/60-day process (§0117)

### Fillable Oregon Forms (pre-populated from client data)
CF01 Disclosure · CF02 Rights · CF03 Assessment · CF04 Service Plan · CF05 Financial Agreement · CF06 Stable & Predictable · CF07 End of Service · CF08 Initial Visit · CF09 Quarterly Monitoring · CF10 Medication Self-Direction · CF11 90-Day Re-Evaluation

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| State | Zustand |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL + Prisma |
| AI (P&P Generator) | Anthropic Claude (claude-sonnet-4-6) |
| Frontend Hosting | Vercel |
| Backend Hosting | Railway |

## Getting Started

### Frontend
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

### Backend
```bash
cd backend
npm install
cp ../.env.example .env
# Edit .env with your values
npm run db:generate
npm run db:migrate
npm run dev
# API running on http://localhost:4000
```

### Environment Variables
See `.env.example` — key variables:
- `ANTHROPIC_API_KEY` — For AI-powered P&P Generator
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — Authentication secret

## Deployment

**Frontend → Vercel:** Connect GitHub repo, set `VITE_API_URL` to Railway backend URL.

**Backend → Railway:** Connect GitHub repo, Railway provides PostgreSQL. Add `ANTHROPIC_API_KEY` and `JWT_SECRET`.

## Architecture

```
careaxis/
├── frontend/src/
│   ├── modules/        # 13 feature modules
│   ├── components/     # Layout, Modal, UI
│   ├── store/          # Zustand + seed data
│   └── api/            # API client
├── backend/src/
│   ├── routes/         # 8 API route files
│   └── services/       # Business logic + AI
├── backend/prisma/
│   └── schema.prisma   # Full data model (14 tables)
└── .env.example        # All required variables
```