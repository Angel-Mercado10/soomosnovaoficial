# Skill Registry — soomosnova_oficial
Generated: 2026-04-17

## User Skills

| Name | Trigger | Description |
|------|---------|-------------|
| sdd-init | "sdd init", "iniciar sdd", "openspec init" | Initialize SDD context; detects stack, bootstraps persistence |
| sdd-explore | /sdd-explore, orchestrator launches for investigation | Explores codebase, compares approaches; no files created |
| sdd-propose | orchestrator launches to create/update a change proposal | Creates structured proposal with intent, scope, and approach |
| sdd-spec | orchestrator launches to write/update specs for a change | Writes delta specs — requirements and scenarios |
| sdd-design | orchestrator launches to write/update technical design | Creates technical design doc with architecture decisions |
| sdd-tasks | orchestrator launches to create/update task breakdown | Breaks change into concrete actionable implementation steps |
| sdd-apply | /sdd-apply or orchestrator launches to implement | Implements tasks in batches; TDD cycle if strict_tdd enabled |
| sdd-verify | /sdd-verify or orchestrator launches to validate | Validates implementation against specs; reports CRITICAL/WARNING/SUGGESTION |
| sdd-archive | /sdd-archive or orchestrator launches to close | Merges delta specs into main specs; archives completed change |
| sdd-onboard | orchestrator launches to walk through the SDD workflow | Guided end-to-end SDD walkthrough using the real codebase |
| judgment-day | "judgment day", "judgment-day", "review adversarial", "dual review", "doble review", "juzgar", "que lo juzguen" | Parallel adversarial review: two blind judges review simultaneously |
| branch-pr | creating a PR, opening a PR, preparing changes for review | PR creation workflow following issue-first enforcement |
| issue-creation | creating a GitHub issue, reporting a bug, requesting a feature | Issue creation workflow following issue-first enforcement |
| skill-creator | "create a new skill", "add agent instructions", "document patterns for AI" | Creates new AI agent skills following the Agent Skills spec |
| skill-registry | "update skills", "skill registry", "actualizar skills", "update registry" | Creates or updates the skill registry for the current project |
| prd | generating PRDs, product requirements document, feature spec doc | Generate high-quality PRDs with executive summaries, user stories, technical specs |
| prd-to-issues | "convert PRD to issues", "break down PRD", "create implementation tickets" | Break a PRD into independently-grabbable GitHub issues (tracer-bullet slices) |
| requirements-elicitation | "gather requirements", "elicitation session", "stakeholder interview", "trawl for requirements" | Facilitate structured requirements gathering |
| tech-spec:create | "create a tech spec", "technical specification", starting a new feature needing architecture docs | Create technical specification through interactive planning and expert review |
| doc-arch | "document architecture", "arch doc", "system architecture document" | Generate architecture documentation |
| go-testing | writing Go tests, using teatest, adding test coverage | Go testing patterns including Bubbletea TUI testing |

## Project Conventions

| File | Notes |
|------|-------|
| AGENTS.md | Next.js 16 agent rules — read BEFORE touching any Next.js code; APIs may differ from training data |
| CLAUDE.md | References AGENTS.md (@AGENTS.md) — same Next.js agent rules apply |

## Compact Rules

### sdd-init
- Triggered by: "sdd init", "iniciar sdd", "openspec init"
- Does: detects stack, testing capabilities, saves to engram, writes .atl/skill-registry.md
- Persistence mode: **engram** (do NOT create openspec/ directory)
- Topic key: `sdd-init/soomosnova_oficial`

### sdd-explore
- Triggered by: /sdd-explore <topic>, or orchestrator launches for investigation
- Does: reads codebase, compares approaches, returns exploration report — no project files created
- Engram artifact key: `sdd/{change-name}/explore` or `sdd/explore/{topic-slug}` if standalone

### sdd-propose
- Triggered by: orchestrator after exploration; or /sdd-new
- Does: structured proposal (intent, scope, risk, approach)
- Reads: `sdd/{change-name}/explore` (optional), `sdd-init/soomosnova_oficial` (optional)
- Engram artifact key: `sdd/{change-name}/proposal`

### sdd-spec
- Triggered by: orchestrator after proposal
- Does: delta specs — what is ADDED, MODIFIED, or REMOVED from system behavior
- Reads: `sdd/{change-name}/proposal` (required)
- Engram artifact key: `sdd/{change-name}/spec`

### sdd-design
- Triggered by: orchestrator after proposal (can run parallel with sdd-spec)
- Does: architecture decisions, data flow, file changes, technical rationale
- Reads: `sdd/{change-name}/proposal` (required), `sdd/{change-name}/spec` (optional)
- Engram artifact key: `sdd/{change-name}/design`

### sdd-tasks
- Triggered by: orchestrator after spec + design
- Does: concrete actionable implementation checklist organized by phase
- Reads: proposal + spec + design (all required)
- Engram artifact key: `sdd/{change-name}/tasks`

### sdd-apply
- Triggered by: /sdd-apply [change], or orchestrator launches for implementation
- Does: implements tasks in batches; marks tasks complete via mem_update
- **TDD**: RED→GREEN→REFACTOR mandatory (strict_tdd: true)
- **Stack**: Next.js 16 App Router + TypeScript strict + Tailwind v4 + Supabase + Cloudinary + Resend + Framer Motion
- **Test runner**: vitest + @testing-library/react + jsdom; run `npm test` (`vitest run`)
- **CRITICAL**: read AGENTS.md BEFORE touching any Next.js code
- Engram artifact key: `sdd/{change-name}/apply-progress`

### sdd-verify
- Triggered by: /sdd-verify [change], or orchestrator launches for validation
- Does: proves implementation is correct — static analysis + execution evidence required
- Reports: CRITICAL / WARNING / SUGGESTION severity levels
- Reads: spec + tasks + design + proposal (all required)
- Engram artifact key: `sdd/{change-name}/verify-report`

### sdd-archive
- Triggered by: /sdd-archive [change], or orchestrator launches to close
- Does: merges delta specs into main specs; closes change; records all observation IDs
- Reads: all change artifacts (all required)
- Engram artifact key: `sdd/{change-name}/archive-report`

### judgment-day
- Triggered by: "judgment day", "judgment-day", "review adversarial", "dual review", "doble review", "juzgar", "que lo juzguen"
- Does: two independent blind judge sub-agents review the same target simultaneously; synthesizes; applies fixes; re-judges up to 2 iterations

### branch-pr
- Triggered by: creating a PR, opening a PR, preparing changes for review
- Does: issue-first enforcement — checks issue exists before creating PR

### issue-creation
- Triggered by: creating a GitHub issue, reporting a bug, requesting a feature
- Does: structures issue with proper labels, description, and acceptance criteria
- Convention: issue must exist before creating a branch or PR

### skill-creator
- Triggered by: "create a skill", "add agent instructions", "document patterns for AI"
- Does: produces SKILL.md following the Agent Skills spec format

## Project-Specific Gotchas

- **Next.js 16 App Router**: ALWAYS read AGENTS.md before writing any Next.js code — APIs may differ from training data
- **TypeScript strict**: all code must pass strict TS checks; no `any` without explicit justification
- **Tailwind v4**: uses `@tailwindcss/postcss`, different config from v3 — check docs before applying classes
- **Supabase SSR**: uses `@supabase/ssr` (not legacy auth-helpers) — use `createServerClient`/`createBrowserClient`
- **Image CDNs**: Supabase storage (`vnrspkiynlrioxpkheue.supabase.co`) and Cloudinary (`res.cloudinary.com`) whitelisted in next.config.ts
- **Server actions**: preferred over API routes for mutations; use `server-only` package for sensitive modules
- **Testing**: vitest + jsdom + @testing-library/react; NO jest; run `npm test` (vitest run)
- **Coverage**: NOT configured — no `@vitest/coverage-v8` in devDependencies; add it before enabling coverage reports
- **Slug regeneration BUG**: `src/app/actions/evento.ts` regenerates slug on every UPDATE — breaks existing invitation URLs
- **Schema drift**: `src/types/database.ts` has `template` field on `eventos` but SQL migrations don't — run `ALTER TABLE eventos ADD COLUMN template text NOT NULL DEFAULT 'clasica'`
- **RLS fix**: `supabase/rls_fix_fotos_dedicatorias.sql` may not have been applied — verify before deploying

## SDD Docs (PRDs)

Located in `sdd/` — reference material for architecture and planning:

| File | Description |
|------|-------------|
| soomosnova-prd.md | Main PRD — full product requirements |
| soomosnova-arquitectura-tecnica-prd.md | Technical architecture decisions |
| soomosnova-flujo-invitado-prd.md | Guest flow spec |
| soomosnova-modelo-datos-prd.md | Data model documentation |
| soomosnova-prompt-maestro-prd.md | Master prompt reference |
