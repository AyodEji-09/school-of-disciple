# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary:** Prospective and enrolled students of the Redeemed Christian Church of God (RCCG) School of Disciples (SOD) in the Americas-1 region, registering for discipleship courses, completing intake onboarding, submitting payments, ordering manuals, and tracking their academic results.
- **Secondary:** Center coordinators (managing center students, manual orders, and coordinator reports) and regional/super-admins (managing centers, coordinators, fee/Zelle/registration configurations, payment approvals, remittances, exam appointments, results, and analytics).

## Product Purpose

Provide a single official portal for the entire RCCG Americas-1 School of Disciples lifecycle—from public discovery and student registration through intake onboarding, fee and Zelle payment verification, manual ordering, exam appointments, and academic results publication—so students progress smoothly and center leadership can operate without fragmented spreadsheets.

## Positioning

Purpose-built for RCCG Americas-1's multi-center discipleship structure, uniting student self-service with coordinator oversight, Zelle/manual payment approval and remittance workflows, and center-level academic result management in one connected system.

## Operating Context

- **Student journey:** Public landing & information (`Home`, `About`, `Team`) -> Registration & login -> Multi-step intake onboarding (`/onboarding/*`) -> Student dashboard (`/my-dashboard`), profile, payment submission, and result viewing (`/my-results`).
- **Coordinator & admin operations:** Role-gated dashboards (`/dashboard`), center and coordinator management (including invite acceptance), payment approvals and remittances, manual orders, registration/fee/Zelle configuration, exam appointments, bulk/single result uploads, and analytics/reports.
- **Technical runtime:** React + TypeScript + Vite SPA (`npm run dev`) with Redux Toolkit, React Router, Tailwind CSS, MUI/Joy, and Socket.IO real-time notifications.

## Capabilities and Constraints

- **Multi-center hierarchy:** Distinct role-based access for students (`user`), center coordinators, admins, and super-admins.
- **Payment & remittance workflow:** Supports configured fee structures and Zelle/manual payment submissions requiring admin approval and remittance tracking.
- **Academic lifecycle:** Supports exam appointment scheduling, single and bulk result uploads, result editing, analytics, and student-facing result details.
- **Intake gate:** Enrolled students must complete intake onboarding before accessing the full dashboard and profile.

## Brand Commitments

- Official identity: **RCCG School of Disciples | Americas-1** (`SOD`).
- Preserve official RCCG/SOD logos, leadership photography, and institutional assets in `public/images/` (e.g., `logo.png`, `sod-logo.png`, `rcg.png`, leadership portraits).
- Tone: Welcoming, reverent, clear, and trustworthy for church members and prospective disciples.

## Evidence on Hand

- Existing React/Vite web application in `src/` covering public pages (`src/pages/`), student portal, coordinator tools (`src/coordinator/`), and admin modules (`src/admin/`).
- Official brand and leadership imagery in `public/images/`.
- Do not fabricate student testimonials, enrollment statistics, or external accreditations not present in the codebase.

## Product Principles

1. **Clarity across the student journey:** Every step from registration to onboarding, payment, and viewing results should feel straightforward on mobile and desktop.
2. **Trustworthy financial and academic accountability:** Payment approvals, remittances, and exam results must remain transparent, auditable, and clearly communicated.
3. **Role-appropriate focus:** Keep student surfaces focused on discipleship progress while giving coordinators and admins dense, reliable operational tools.
4. **Preserve institutional identity:** Honor official RCCG Americas-1 School of Disciples branding, terminology, and leadership representation.

## Accessibility & Inclusion

- Target **WCAG AA** contrast, keyboard navigability, and clear form validation/feedback across all public, student, and admin flows.
- Maintain a responsive, mobile-friendly student experience for members registering and checking results from phones.
