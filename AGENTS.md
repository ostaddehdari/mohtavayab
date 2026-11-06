# AGENTS.md

## Project context

You are working on هادی / mohtavayab, a multi-tenant platform for authorized social-content extraction, monitoring, search, analysis, editing, scheduling, and cross-network publishing.

## Mandatory repository rules

1. Use the IDs in `roadmap/roadmap.json`. Every branch, PR and commit must mention at least one `Sxx-Wxx-Txx` task ID.
2. Keep tasks small: 0.5–2 person-days. Split larger work before implementation.
3. Preserve strict tenant isolation. Every persisted domain record and query must be scoped by `tenant_id` where applicable.
4. Provider adapters never access Core databases directly. They communicate through versioned contracts and typed errors.
5. Raw content is immutable. Editing, rules and AI create versioned derivatives with provenance.
6. Never log secrets, session cookies, OTP values, access tokens or raw credentials.
7. UI is RTL-first, Persian-first, keyboard accessible and must support reduced motion.
8. The production web base path is `/mohtavayab`; no route or asset may assume deployment at `/`.
9. Every feature includes tests, telemetry, permissions, error states, documentation and a rollback/runbook path.
10. No unofficial provider reaches production without capability certification, a kill switch and an explicit risk label.

## Frontend rules

- Next.js, React and TypeScript.
- Vazirmatn is self-hosted; Font Awesome icons use the React SVG packages.
- Right-hand collapsible sidebar: 280px expanded, 80px compact, mobile drawer below 1024px.
- Motion is the default dashboard animation layer. GSAP/ScrollTrigger, Lenis, Three.js and Rive are lazy-loaded only where they add product value.
- Respect `prefers-reduced-motion`; never animate essential content in a way that blocks use.

## Completion gate

A task is done only when implementation, automated tests, migration if needed, telemetry, docs and acceptance evidence are present in the same PR.

