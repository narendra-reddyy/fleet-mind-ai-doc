FleetMind AI — Project Plan

An AI-powered Fleet Operations Assistant that centralizes trucking documents and answers operator questions in plain English.

---

## 1. Product Requirements Document (PRD)

**Vision.** Replace email threads, shared drives, and filing cabinets with a single document hub where any operator can type "When does Truck 14's insurance expire?" and get an instant, sourced answer.

**Target users.**

- Fleet owners / operations managers (5–200 trucks)
- Dispatchers and compliance officers
- Drivers (light read-only access via mobile)
- Accountants / bookkeepers (invoices, fuel, tax)

**Core problems solved.**

1. Documents scattered across email, Google Drive, Dropbox, and paper.
2. No fast way to know what's expiring (registration, insurance, DOT inspections, driver CDLs).
3. Manual tax/IFTA prep from shoeboxes of fuel receipts.
4. Slow lookup during roadside stops or audits.

**MVP scope.**

- Upload PDFs, images, scans (drag-drop + mobile camera).
- Automatic OCR + AI classification into document types.
- Auto-extracted metadata: truck/trailer ID, driver, vendor, dates, amounts, policy/VIN numbers.
- Vehicle, Driver, and Document libraries with filters.
- Expiration dashboard with traffic-light alerts (red/amber/green).
- Conversational assistant (RAG) grounded only in the company's documents.
- Role-based access (Owner, Manager, Dispatcher, Driver, Accountant).

**Out of scope (MVP).** ELD/telematics integration, route planning, payroll, load board, e-signature.

**Success metrics.**

- < 5 s median answer time from chat
- 90%+ correct auto-classification
- 100% of expiring docs surfaced ≥ 30 days early
- Time-to-find-document reduced from minutes to seconds

**Non-functional.** Mobile-first responsive, RLS-secured multi-tenant, audit log on every document access, GDPR/SOC2-friendly storage layout.

---

## 2. User Stories

**Owner / Manager**

- As an owner, I upload a stack of mixed PDFs and the system files each one to the right truck/driver automatically.
- As a manager, I see a dashboard of every document expiring in the next 60 days so nothing lapses.
- As a manager, I ask "Which trucks are missing a current annual DOT inspection?" and get a list.

**Dispatcher**

- As a dispatcher, I pull up Truck 14 and see registration, insurance, IFTA sticker, and last maintenance in one view.
- As a dispatcher, I forward a current insurance certificate to a broker in two taps.

**Driver**

- As a driver, I snap a photo of a fuel receipt on my phone and it's filed to my truck and trip automatically.
- As a driver, I ask "Show my CDL and medical card" during a roadside stop.

**Accountant**

- As an accountant, I ask "Total fuel spend in Q2 by truck" and export the answer to CSV.
- As an accountant, I download every invoice from vendor X for tax year 2025.

**Compliance Officer**

- As a compliance officer, I get alerted 30/14/3 days before any driver's medical card or any truck's insurance expires.
- As a compliance officer, I export a complete audit packet for one vehicle in one click.

---

## 3. Database Schema

Multi-tenant Postgres (Lovable Cloud). Every table carries `organization_id`. RLS scopes rows to the caller's org; roles enforced via a separate `user_roles` table + `has_role()` security-definer function.

**organizations** — id, name, dot_number, mc_number, created_at
**profiles** — id (=auth.users.id), organization_id, full_name, phone, avatar_url
**user_roles** — id, user_id, organization_id, role (`owner|manager|dispatcher|driver|accountant`)
**vehicles** — id, organization_id, unit_number, vin, make, model, year, plate, plate_state, type (`tractor|trailer|straight_truck|van`), status (`active|out_of_service|sold`)
**drivers** — id, organization_id, user_id (nullable), full_name, cdl_number, cdl_state, cdl_class, dob, hire_date, status
**vendors** — id, organization_id, name, category (`fuel|maintenance|insurance|tolls|parts|other`), contact
**trips** — id, organization_id, vehicle_id, driver_id, started_at, ended_at, origin, destination, miles
**documents** — id, organization_id, storage_path, original_filename, mime_type, size_bytes, uploaded_by, uploaded_at, source (`upload|email|mobile_capture`), ocr_text, doc_type (`registration|insurance|cdl|medical_card|ifta|invoice|fuel_receipt|maintenance|inspection|bill_of_lading|tax_form|other`), confidence, status (`processing|ready|review_needed|archived`)
**document_links** — id, document_id, vehicle_id?, driver_id?, trip_id?, vendor_id? (one document can link to multiple entities)
**document_metadata** — document_id (pk), issue_date, expiration_date, policy_number, amount_total, currency, tax_amount, gallons, odometer, jurisdiction, extra (jsonb of model-extracted fields)
**document_chunks** — id, document_id, chunk_index, content, embedding (vector(3072)), token_count — for RAG
**alerts** — id, organization_id, document_id, entity_type, entity_id, kind (`expiring|expired|missing`), due_date, severity, acknowledged_at
**conversations** — id, organization_id, user_id, title, created_at
**messages** — id, conversation_id, role (`user|assistant|tool`), content, citations (jsonb of document_ids + chunk refs), created_at
**audit_log** — id, organization_id, actor_id, action, entity_type, entity_id, ip, user_agent, created_at

Indexes: `documents(organization_id, doc_type, status)`, `document_metadata(expiration_date)`, HNSW on `document_chunks.embedding`, full-text GIN on `documents.ocr_text`.

Storage: private bucket `fleet-docs/{org_id}/{yyyy}/{mm}/{document_id}.{ext}` with signed URLs only.

---

## 4. Application Architecture

**Stack.** TanStack Start (React 19 + Vite 7) on Cloudflare Workers · Tailwind v4 · Lovable Cloud (Postgres + Auth + Storage) · Lovable AI Gateway (Gemini for chat/extraction, Gemini embeddings for RAG) · pgvector for semantic search.

```text
┌─────────────────────────────────────────────────────┐
│  Web / Mobile-web client (TanStack Start, SSR)      │
│  Routes · React Query · shadcn UI · Chat UI         │
└──────────────┬──────────────────────────────────────┘
               │ typed RPC (createServerFn)  +  /api/* routes
┌──────────────▼──────────────────────────────────────┐
│  Server functions (Worker runtime)                  │
│  • upload-intake     • doc-classifier               │
│  • metadata-extract  • embed-and-index              │
│  • chat-orchestrator (tool-calling agent)           │
│  • alerts-scheduler  • export/report                │
└──────┬───────────────┬─────────────────┬────────────┘
       │               │                 │
┌──────▼─────┐  ┌──────▼──────┐  ┌───────▼──────────┐
│ Postgres   │  │ Object      │  │ Lovable AI       │
│ + pgvector │  │ storage     │  │ Gateway          │
│ (RLS)      │  │ (private)   │  │ (LLM + embed)    │
└────────────┘  └─────────────┘  └──────────────────┘
```

**Ingestion pipeline (async, idempotent).**

1. Client uploads file → server function stores blob, inserts `documents` row (`status=processing`).
2. OCR (PDF text layer first, fallback to vision OCR for scans/photos).
3. Classifier LLM call → `doc_type` + confidence.
4. Extractor LLM call with type-specific JSON schema → `document_metadata` + entity links (truck unit #, VIN, driver name fuzzy-matched).
5. Chunk + embed → `document_chunks`.
6. Alert generator computes expiration alerts.
7. `status=ready` (or `review_needed` if confidence < threshold).

**Chat (RAG + tools).** Agent has tools: `semantic_search(query)`, `lookup_vehicle(unit)`, `lookup_driver(name)`, `list_expiring(days)`, `aggregate_spend(filter)`, `get_document(id)`. Every assistant message stores citations to source document chunks; UI renders inline source pills.

**Security.** Supabase Auth, RLS everywhere, signed-URL storage, role checks via `has_role()`, audit log on document fetch and chat queries, server-only `LOVABLE_API_KEY`.

---

## 5. Screen List

1. **Auth** — Sign in / Sign up / Forgot password / Accept invite
2. **Onboarding** — Org setup, DOT/MC, add first vehicle, invite teammates
3. **Dashboard (Home)** — KPI tiles, expiring docs widget, recent uploads, quick chat box
4. **Inbox / Upload** — Drag-drop zone, mobile camera capture, email-to-fleet address, processing queue
5. **Documents Library** — Filter by type/vehicle/driver/date, table + preview pane, bulk actions
6. **Document Detail** — PDF/image viewer, extracted metadata panel, linked entities, version history, share/export
7. **Vehicles List** → **Vehicle Detail** (tabs: Overview, Documents, Maintenance, Fuel, Trips, Alerts)
8. **Drivers List** → **Driver Detail** (Overview, Licenses & Medical, Documents, Trips)
9. **Vendors List** → **Vendor Detail** (Documents, Spend)
10. **Alerts Center** — Expiring/expired/missing, severity filters, acknowledge & snooze
11. **Chat / Assistant** — Conversational UI with citations, conversation history, suggested prompts
12. **Reports & Exports** — IFTA quarterly, fuel spend, maintenance log, audit packet per vehicle
13. **Settings** — Organization, Users & roles, Notification rules, Integrations (email forwarding), Billing
14. **Audit Log** (admin only)
15. **404 / Error** boundaries

Mobile-condensed variants: Dashboard, Upload (camera-first), Chat, Vehicle Detail.

---

## 6. Navigation Flow

```text
                       ┌──────────┐
                       │  Auth    │
                       └────┬─────┘
                            ▼
                     ┌──────────────┐
                     │  Onboarding  │ (first login only)
                     └──────┬───────┘
                            ▼
   ┌──────────────────── Dashboard ───────────────────────┐
   │   │            │           │          │             │
   ▼   ▼            ▼           ▼          ▼             ▼
 Chat  Upload   Documents   Vehicles   Drivers       Alerts
                    │           │          │             │
                    ▼           ▼          ▼             ▼
              Doc Detail  Vehicle Det. Driver Det.   (ack/snooze)
                                │
                                ├─ Maintenance / Fuel / Trips tabs
                                └─ Documents tab → Doc Detail

  Sidebar (persistent on desktop, bottom-nav on mobile):
  Dashboard · Chat · Upload · Documents · Vehicles · Drivers · Alerts · Reports · Settings
```

Global elements: top search bar (semantic), "Ask FleetMind" floating button on every page, breadcrumb trail on detail screens.

---

## 7. AI Features

1. **Auto-classification** — every uploaded file tagged with one of 12 doc types + confidence.
2. **Structured extraction** — type-specific JSON schemas (insurance: carrier, policy #, effective/expiration, coverage; fuel receipt: vendor, date, gallons, price, total, odometer; CDL: number, state, class, expiration).
3. **Entity linking** — fuzzy match VIN / unit number / driver name against `vehicles` and `drivers`.
4. **Conversational assistant (RAG + tools)** — answers grounded in the org's documents, with citations.
5. **Semantic search** — natural-language search across OCR text using pgvector.
6. **Smart alerts** — generates expiration alerts and proactive "missing document" warnings (e.g., truck has registration but no current insurance).
7. **Receipt-to-ledger** — turns fuel/maintenance receipts into structured line items for IFTA and tax reports.
8. **Duplicate detection** — embedding + hash similarity to flag re-uploaded documents.
9. **Anomaly hints** — flags unusual fuel prices, mileage gaps, or coverage drops.
10. **Voice capture (stretch)** — drivers dictate "fueled up, 82 gallons, $312, odometer 412,650" on mobile.
11. **Auto-summarize** — one-paragraph summary on every document detail page.
12. **Report drafting** — generates IFTA quarterly and audit-packet narratives from underlying data.

Guardrails: assistant refuses to answer outside the org's data; every claim must cite ≥ 1 document chunk; low-confidence extractions route to a "Review needed" queue.

---

## 8. Sample Data Structure

**Vehicle**

```json
{
  "id": "veh_014",
  "unit_number": "14",
  "vin": "1FUJGLDR3CLBP1234",
  "make": "Freightliner", "model": "Cascadia", "year": 2021,
  "plate": "TX-7K42L9", "plate_state": "TX",
  "type": "tractor", "status": "active"
}
```

**Document (insurance certificate)**

```json
{
  "id": "doc_8821",
  "doc_type": "insurance",
  "status": "ready",
  "confidence": 0.97,
  "storage_path": "fleet-docs/org_42/2026/06/doc_8821.pdf",
  "links": { "vehicle_id": "veh_014" },
  "metadata": {
    "carrier": "Progressive Commercial",
    "policy_number": "CA-99812345",
    "issue_date": "2025-12-01",
    "expiration_date": "2026-12-01",
    "coverage_limit_usd": 1000000,
    "named_insured": "Acme Trucking LLC"
  }
}
```

**Fuel receipt**

```json
{
  "id": "doc_8990",
  "doc_type": "fuel_receipt",
  "links": { "vehicle_id": "veh_014", "driver_id": "drv_07", "vendor_id": "ven_loves" },
  "metadata": {
    "date": "2026-06-15",
    "vendor": "Love's Travel Stop #421",
    "gallons": 81.4,
    "price_per_gallon": 3.79,
    "total_usd": 308.51,
    "odometer": 412650,
    "jurisdiction": "OK"
  }
}
```

**Driver**

```json
{
  "id": "drv_07",
  "full_name": "Maria Gonzalez",
  "cdl_number": "TX-CDL-554120",
  "cdl_class": "A",
  "cdl_expiration": "2027-04-30",
  "medical_card_expiration": "2026-09-15",
  "status": "active"
}
```

**Alert**

```json
{
  "id": "alt_311",
  "kind": "expiring",
  "entity_type": "driver",
  "entity_id": "drv_07",
  "document_id": "doc_7710",
  "due_date": "2026-09-15",
  "severity": "amber",
  "message": "Medical card for Maria Gonzalez expires in 89 days."
}
```

**Chat message with citations**

```json
{
  "role": "assistant",
  "content": "Truck 14's insurance (Progressive policy CA-99812345) expires on Dec 1, 2026.",
  "citations": [
    { "document_id": "doc_8821", "chunk_ids": ["c_0", "c_2"] }
  ]
}
```

**Conversation seed prompts.** "What's expiring in 30 days?" · "Show all fuel receipts for Truck 14 in May" · "Total maintenance spend per truck this quarter" · "Find the bill of lading for load #BOL-7781" · "Which drivers have a medical card expiring before September?"

---

Approve this plan and I'll start building — beginning with Lovable Cloud setup, the schema + RLS, then the ingestion pipeline and chat assistant.