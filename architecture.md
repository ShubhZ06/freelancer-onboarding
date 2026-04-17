# Freelancer Operating System Architecture

## 1. Architecture Summary

Freelancer Operating System (FOS) will be built as a monolith-first, modular full-stack application using:

- Next.js 16 App Router
- React 19
- Tailwind CSS 4
- MongoDB as the primary database
- Anthropic as the default AI provider
- Clerk for authenticated freelancer accounts
- Native in-house e-signature flow for client signing

This architecture intentionally replaces the PRD's suggested Express + GraphQL + PostgreSQL approach with a simpler Next.js-centered design that fits the current project stack better and reduces MVP delivery complexity. The goal is to keep the initial system easy to build, easy to operate, and cleanly extensible as the product grows.

The system will follow a modular monolith pattern:

- One deployable Next.js application
- Feature-based domain boundaries inside the codebase
- Shared infrastructure for auth, AI, queues, storage, and observability
- Async background processing for heavy or long-running workflows

This gives us fast iteration for v1 while preserving clear seams for future extraction if scale requires it later.

## 2. Core Architectural Principles

### 2.1 Monolith First, Modular by Domain

FOS should start as a single Next.js application with internal module boundaries, not as a distributed system. This is the best fit for an early-stage product because:

- product workflows are deeply connected across acquisition, contracts, signing, and expenses
- the team can ship faster without service orchestration overhead
- shared auth, audit, and data access are simpler to manage
- most MVP scale risks can be handled through background jobs and caching before service extraction is needed

Primary feature domains:

- `acquisition`
- `contracts`
- `signing`
- `expenses`
- `auth`
- `shared`

### 2.2 Server-First Next.js Design

The application should use Next.js App Router as the full-stack runtime for:

- server-rendered dashboards
- route handlers for APIs and webhooks
- server actions for authenticated mutations
- scheduled jobs and internal orchestration endpoints
- client-facing no-account signing routes

Use server components by default for:

- dashboards
- detail pages
- reports
- data-heavy layouts

Use client components only where interaction is essential:

- lead approval queue
- pitch editor
- signature capture canvas
- filters and charts
- budget threshold controls

### 2.3 Deterministic Business Logic, AI as an Enhancement Layer

AI should assist the system, not define the legal or financial truth of the system.

- Contracts must rely on vetted templates and structured variable injection.
- Lead summaries and pitch drafts can use AI, but lead records must remain normalized and reviewable.
- Expense categorization can use AI for enrichment, but the final stored category must be traceable and editable.

Anthropic is the default provider, but all model access should go through an internal AI service wrapper so prompts, retries, telemetry, and future provider expansion remain centralized.

## 3. System Overview

### 3.1 Logical System Diagram in Words

The system is composed of the following layers:

1. **UI Layer**
   Freelancer-facing dashboard, setup flows, contract review screens, expense views, and client-facing signing pages.

2. **Next.js Application Layer**
   App Router pages, layouts, route handlers, server actions, webhook receivers, and scheduled entrypoints.

3. **Domain Modules**
   Feature-specific services for acquisition, contracts, signing, expenses, auth, and shared infrastructure.

4. **Async Jobs and Queues**
   Background execution for lead ingestion, AI processing, PDF generation, reminders, sync tasks, and alerts.

5. **MongoDB**
   Primary operational database for application records, state transitions, and audit metadata.

6. **Object Storage**
   Storage for generated PDFs, signed artifacts, exports, and long-lived binary assets.

7. **Third-Party Integrations**
   Anthropic, Clerk, email providers, SMS providers, Plaid, Stripe, PayPal/Wise, and lead-source connectors.

### 3.2 Request and Processing Model

Synchronous requests should handle:

- authenticated dashboard reads
- user-approved state changes
- basic validations
- issuing signing links
- triggering jobs

Asynchronous jobs should handle:

- lead source syncing
- summarization and fit scoring
- pitch drafting and follow-up generation
- PDF rendering
- expense import and enrichment
- budget alert scheduling
- reminder automation

This keeps UI latency predictable while allowing heavier AI and integration work to scale independently.

## 4. Core Platform Services

### 4.1 Database: MongoDB

MongoDB will be the primary database for all operational product data. It is a good fit for FOS because:

- feature records are document-shaped and evolve quickly
- lead sources and expense sources have different raw payload shapes
- contract versions and signing events benefit from append-friendly storage
- early-stage iteration is faster with flexible schema evolution

MongoDB stores:

- users
- freelancer profiles
- clients
- lead sources and normalized leads
- pitch drafts and outreach events
- contract templates and clause configuration
- contract versions and summaries
- signature envelopes and signer events
- audit events
- subscriptions, transactions, usage snapshots, and alerts

Binary files should not be stored directly in MongoDB. Only metadata, references, hashes, and access policies should live there.

### 4.2 Object Storage

Use object storage for:

- generated contract PDFs
- signed final agreements
- plain-language summary exports
- tax export PDFs and CSVs
- uploaded signatures where allowed by policy

MongoDB should keep:

- storage key
- content type
- generation status
- version linkage
- SHA-256 hash
- retention metadata

### 4.3 Queue and Job System

Use Redis-backed queues for background processing. This is the main scalability mechanism for v1.

Jobs include:

- lead source sync
- lead normalization
- intent summarization
- fit scoring
- pitch generation
- spam analysis
- follow-up generation
- contract PDF rendering
- signature reminder scheduling
- countersign finalization
- expense import
- transaction categorization
- usage sync
- budget alert fanout
- waste detection

Every job should be:

- idempotent
- retry-safe
- traceable by job ID
- linked to a domain record

### 4.4 AI Service Wrapper

Anthropic is the default AI provider for v1. All AI access should flow through one internal service layer that handles:

- prompt templates
- model selection
- retry logic
- timeouts
- structured output validation
- moderation or policy checks
- cost telemetry

This wrapper protects feature code from provider-specific details and makes future provider expansion possible without rewriting each feature.

### 4.5 Authentication and Identity

Use Clerk for freelancer authentication, session management, and account security.

Freelancer capabilities:

- onboarding and profile management
- service configuration
- lead review and outreach approval
- contract generation and sending
- expense dashboard access
- alert management

Client signing flow must remain accountless:

- single-use signing tokens
- strict expiry
- no contract data in the URL
- server-side token validation

## 5. Shared Data Model

The following cross-feature entities should be standardized across the system:

- `User`
- `FreelancerProfile`
- `Client`
- `LeadSource`
- `Lead`
- `Pitch`
- `ContractTemplate`
- `ContractVersion`
- `SignatureEnvelope`
- `AuditEvent`
- `Subscription`
- `Transaction`
- `BudgetAlert`

Recommended modeling approach:

- stable domain identity fields for each entity
- append-only event collections for audits and lifecycle tracking
- status fields for current workflow state
- raw integration payload snapshots only where operationally useful
- explicit references between lead, client, contract, and signature records

## 6. Feature Architecture by Pillar

## 6.1 F1 Smart Contract Generator

### Purpose

Convert a qualified lead or approved client opportunity into a legally structured, customizable contract in under a minute.

### User Flow

1. Freelancer completes profile setup with legal and commercial defaults.
2. Freelancer selects a client or converted lead.
3. System chooses a service-category template.
4. Project-specific variables are extracted and normalized.
5. Contract content is assembled from structured template sections and optional clauses.
6. AI generates a plain-language summary for easier client review.
7. Contract version is saved.
8. PDF generation runs asynchronously.
9. Freelancer reviews and sends for signature.

### Major Components

- freelancer profile store
- service template library
- clause library
- contract assembly service
- variable extraction and mapping service
- contract versioning service
- summary generation service
- PDF rendering pipeline

### Data Model

Main records:

- `FreelancerProfile`
- `Client`
- `ContractTemplate`
- `ContractVersion`
- supporting clause configuration

Key stored fields:

- legal identity and business defaults
- pricing defaults
- payment terms
- revision policy
- jurisdiction
- scope and milestone variables
- clause selections
- rendered contract body
- summary body
- PDF generation status

### Sync vs Async Boundaries

Synchronous:

- select template
- validate required variables
- assemble structured contract version
- persist draft contract version

Asynchronous:

- generate plain-language summary
- render PDF
- brand document assets
- archive export

### Security and Compliance Notes

- legal core terms must come from vetted templates, not freeform AI drafting
- every template must include the legal disclaimer from the PRD
- contract versions must be immutable once sent for signing
- edits after send must create a new version

### MVP Scope

- service-category templates for the initial supported categories
- dynamic variable injection
- clause defaults by category
- summary generation
- PDF export
- version history

### Future Extension Path

- jurisdiction-aware clause packs
- attorney-reviewed update workflow
- collaborative redlining
- contract analytics

## 6.2 F2 Secure e-Signature Routing

### Purpose

Reduce contract turnaround from days to minutes by offering a secure, accountless, auditable signing experience.

### User Flow

1. Freelancer opens a contract version and clicks send for signature.
2. System creates a `SignatureEnvelope`.
3. A time-limited single-use token is issued.
4. Client receives a signing link by email, optionally SMS later.
5. Client opens the secure signing page without creating an account.
6. Client reviews the contract and signs using typed, drawn, or uploaded signature input.
7. System records signer evidence and marks the envelope signed.
8. Freelancer countersignature is applied automatically.
9. Final PDF is generated, hashed, stored, and archived.
10. Dashboard status updates to signed and verified.

### Major Components

- signature request service
- token issuance and validation service
- client signing portal
- signature capture components
- signer evidence collector
- countersignature service
- finalization and hash service
- verification endpoint
- reminder scheduler

### Data Model

Main records:

- `SignatureEnvelope`
- `ContractVersion`
- `AuditEvent`

Key stored fields:

- envelope status
- token metadata and expiry
- signer identity evidence
- viewed and signed timestamps
- IP address and device metadata
- final document hash
- countersign completion metadata
- archive location

### Sync vs Async Boundaries

Synchronous:

- create envelope
- dispatch signature request
- validate token
- capture sign action
- update visible status

Asynchronous:

- reminder scheduling
- final PDF generation
- hash verification persistence
- archive writes
- notification fanout

### Security and Compliance Notes

- single-use tokens only
- token expiry default 72 hours
- no contract content in URL parameters
- TLS in transit and encrypted storage at rest
- full audit record for viewed, signed, and finalized stages
- clearly document that legal enforceability depends on jurisdiction and implementation review

### MVP Scope

- email-based signing links
- typed, drawn, and uploaded signature support
- status tracking: sent, viewed, signed
- automatic countersignature
- SHA-256 hashing and verification endpoint
- reminder automation

### Future Extension Path

- SMS delivery
- stronger signer verification
- witness workflows
- third-party trust provider integration

## 6.3 F3 Lead Acquisition Engine

### Purpose

Automate discovery, summarization, scoring, and drafting of outreach while keeping approval control with the freelancer.

### User Flow

1. Freelancer configures service profile and preferred lead criteria.
2. Source connectors ingest raw lead data from LinkedIn, Upwork, and one social source.
3. Raw records are normalized into the shared lead schema.
4. AI summarizes project intent, skill requirements, budget signals, and timeline.
5. System computes fit score against freelancer profile and preferences.
6. Spam and deliverability checks run on the generated outreach.
7. Personalized pitch is drafted.
8. Lead and pitch appear in the approval queue.
9. Freelancer approves, edits, skips, or sends.
10. Follow-ups are drafted later if there is no response and routed back into approval.

### Major Components

- source connector layer
- normalization pipeline
- summarization service
- fit scoring service
- pitch generation service
- spam analysis gate
- approval queue
- outreach dispatch service
- follow-up scheduler
- lead activity timeline

### Data Model

Main records:

- `LeadSource`
- `Lead`
- `Pitch`
- outreach event logs linked to lead records

Key stored fields:

- source and source identity
- normalized client need summary
- fit score and rationale
- draft pitch content
- approval status
- send status
- reply/open events
- follow-up due timestamps

### Sync vs Async Boundaries

Synchronous:

- queue source sync
- approve/edit/skip/send actions
- read approval queue and status views

Asynchronous:

- source fetch
- normalization
- summarization
- fit scoring
- pitch drafting
- spam checking
- follow-up scheduling
- event ingestion from email/platform providers

### Security and Compliance Notes

- outreach remains approval-required in v1
- each source connector must respect source-specific terms and rate limits
- outbound messages should pass spam checks before approval queue placement
- compliance obligations such as CAN-SPAM and GDPR must be enforced at send time

### MVP Scope

- three lead sources
- shared lead schema
- AI summary
- fit scoring
- personalized pitch drafts
- approval queue
- send and track basics
- queued follow-ups

### Future Extension Path

- trust-based autonomous sending
- richer CRM timeline
- multi-channel outreach
- portfolio matching optimization

## 6.4 F4 AI Expense Dashboard

### Purpose

Give freelancers a real-time operational cost view of AI and software subscriptions, plus alerts and waste detection.

### User Flow

1. Freelancer connects or imports payment data.
2. Transactions are normalized and scanned for recurring software spend.
3. Known vendors are matched against the subscription registry.
4. AI and rules-based categorization assign functional categories.
5. Dashboard shows current monthly burn, category breakdown, and projected spend.
6. Budget thresholds trigger in-app and email alerts.
7. Usage-enabled integrations enrich cost data with usage and cost-per-output metrics.
8. Inactive tools are flagged for review.
9. Tax exports are generated on demand.

### Major Components

- payment source adapter layer
- transaction normalization service
- subscription detection service
- registry enrichment service
- categorization service
- dashboard aggregation service
- alert engine
- usage sync service
- waste detection service
- export generator

### Data Model

Main records:

- `Transaction`
- `Subscription`
- `BudgetAlert`

Supporting concepts:

- registry matches
- category labels
- usage snapshots
- export jobs

Key stored fields:

- provider source
- transaction amount and period
- merchant and registry match
- category
- recurring status
- usage totals
- budget thresholds
- alert status

### Sync vs Async Boundaries

Synchronous:

- configure budgets
- review or override categorization
- read dashboard views
- request export

Asynchronous:

- provider sync
- normalization
- categorization
- registry enrichment
- usage pulls
- waste detection scans
- export generation
- alert fanout

### Security and Compliance Notes

- financial integration secrets must stay server-side only
- imported financial data should be minimized and encrypted at rest
- sensitive transaction source payloads should be stored only when necessary for debugging or reconciliation

### MVP Scope

- manual import plus phased direct integrations
- auto-categorization
- subscription registry matching
- burn dashboard
- budget alerts
- waste detection
- CSV and PDF export

### Future Extension Path

- full Plaid and billing integrations
- ROI metrics by tool and client workstream
- renewal prediction
- cancellation recommendations

## 7. Internal Interfaces and API Boundaries

The system should expose internal application actions around use cases, not generic CRUD.

Primary internal surfaces:

- profile setup and service template management
- lead source connection and sync kickoff
- approval queue actions: approve, edit, skip, send
- contract generation, review, versioning, export
- signature request dispatch, signer event capture, countersign, verify
- expense sync, categorization review, budget thresholds, export

Recommended interface pattern:

- server actions for authenticated dashboard mutations
- route handlers for webhooks, external callbacks, verification endpoints, and public signing routes
- domain services behind both action and route layers

This keeps business logic centralized and avoids leaking infrastructure concerns into UI code.

## 8. Cross-Cutting Architecture Concerns

## 8.1 Auth and Roles

Primary roles:

- authenticated freelancer
- accountless signing client
- internal system actor for scheduled and async work

Role separation matters:

- freelancer sessions are managed by Clerk
- client signing uses envelope-bound tokens only
- async jobs should run with explicit service context, not user session state

## 8.2 Audit Logging

Every critical workflow should produce audit events, especially:

- contract creation and version changes
- signature dispatch, view, sign, countersign
- lead send activity and follow-up activity
- expense sync runs and categorization overrides
- alert delivery

Audit logs should be append-only and linked to business entities.

## 8.3 Encryption and Token Handling

- use encrypted storage for sensitive artifacts and documents
- sign public tokens server-side
- enforce expiry and single-use semantics
- never embed sensitive document content in URLs
- hash final signed documents with SHA-256

## 8.4 Observability

Observability should include:

- request tracing
- job tracing
- AI usage and cost metrics
- integration failure monitoring
- contract and signature funnel metrics
- alert delivery success rates

## 8.5 Rate Limiting and Retries

Rate limiting and retry policy is essential for:

- lead source sync
- email and SMS delivery
- AI requests
- payment data providers
- usage integrations

All integration retries should use exponential backoff and idempotent job semantics where possible.

## 8.6 Document Storage

Documents should move through clear states:

- draft
- rendered
- sent
- signed
- archived
- verified

Only object storage should hold large document binaries. MongoDB holds document metadata, hashes, status, and linkage.

## 8.7 Compliance and Jurisdiction Notes

Important product rules:

- the system is not a law firm and does not provide legal advice
- templates must carry a visible legal disclaimer
- e-signature enforceability varies by jurisdiction
- unsupported or high-risk jurisdictions should be flagged for fallback handling in later iterations

## 9. Recommended Repository Structure

Recommended structure for implementation:

```text
src/
  app/
    (marketing)/
    (dashboard)/
    sign/
    api/
  features/
    acquisition/
    contracts/
    signing/
    expenses/
    auth/
    shared/
  components/
    ui/
    charts/
    forms/
    signing/
  lib/
    ai/
    db/
    storage/
    queue/
    auth/
    observability/
    validation/
  server/
    actions/
    services/
    repositories/
    jobs/
    webhooks/
```

Structure intent:

- `src/app` holds routes, layouts, route handlers, and page composition
- `src/features` holds feature-specific business concepts and local UI composition
- `src/components` holds reusable UI primitives and specialized interactive components
- `src/lib` holds infrastructure adapters and cross-cutting utilities
- `src/server` holds server-only orchestration, repositories, jobs, and business services

## 10. Delivery Roadmap Alignment

### Alpha

Focus on F1 core:

- freelancer profile setup
- service template system
- clause defaults
- contract generation
- summary generation
- PDF export

Exit signal:

- internal users can generate and export contract drafts reliably

### Beta

Add F2 and manual F4:

- native e-sign flow
- signature envelope lifecycle
- countersign and archive pipeline
- manual expense import
- budget dashboard basics

Exit signal:

- contracts can move end-to-end from generation to signed archive
- users can track AI subscription spend manually in one dashboard

### v1 Launch

Add F3 and integrated F4:

- three-source acquisition engine
- approval queue
- lead tracking
- direct expense integrations
- alert automation
- waste detection

Exit signal:

- the product supports lead discovery through signed contract and operational cost visibility

## 11. Test and Acceptance Scenarios

### 11.1 Pillar Acceptance Scenarios

F3 acquisition flow:

- lead ingested -> summarized -> scored -> pitch queued

F1 contract flow:

- converted lead -> contract generated -> version saved -> PDF exported

F2 signing flow:

- signature request sent -> viewed -> signed -> countersigned -> verified

F4 expense flow:

- transactions synced or imported -> categorized -> dashboard updated -> alerts triggered

### 11.2 Non-Functional Verification

- async jobs are idempotent
- signing tokens expire correctly and cannot be reused
- document hashes verify successfully
- integration retries do not create duplicate business state
- audit logs are complete for critical workflows
- freelancer-auth and client-signing boundaries remain separate

### 11.3 Failure-Mode Scenarios

- AI extraction returns malformed or partial structured data
- lead-source integrations hit rate limits
- PDF generation fails after contract version creation
- signing token is expired or already consumed
- webhook or provider event is delivered twice
- expense transaction cannot be matched to a known subscription registry entry

## 12. Final Recommendation

This architecture gives FOS the best v1 path on the current stack:

- simple to build because everything lives inside one Next.js system
- safe to evolve because domains are separated internally
- scalable enough for MVP through queues, object storage, and modular services
- aligned with the PRD's four pillars without overengineering infrastructure too early

It is the right architecture for building a fast-moving, AI-assisted freelancer platform that starts practical and becomes more sophisticated over time.
