# Skill Registry — soomosnova_oficial
Generated: 2026-04-14

## User Skills

| Name | Trigger | Description |
|------|---------|-------------|
| sdd-init | user says /sdd-init, "sdd init", "iniciar sdd", "openspec init" | Initialize SDD context; detects stack, bootstraps persistence |
| sdd-explore | user says /sdd-explore or wants to investigate a topic | Explores codebase, compares approaches; no files created |
| sdd-propose | orchestrator launches to create/update a change proposal | Creates structured proposal with intent, scope, and approach |
| sdd-spec | orchestrator launches to write/update specs for a change | Writes delta specs — requirements and scenarios |
| sdd-design | orchestrator launches to write/update technical design | Creates technical design doc with architecture decisions |
| sdd-tasks | orchestrator launches to create/update task breakdown | Breaks change into concrete actionable implementation steps |
| sdd-apply | user says /sdd-apply or orchestrator launches to implement | Implements tasks in batches; TDD cycle if strict_tdd enabled |
| sdd-verify | user says /sdd-verify or orchestrator launches to validate | Validates implementation against specs; reports CRITICAL/WARNING/SUGGESTION |
| sdd-archive | user says /sdd-archive or orchestrator launches to close | Merges delta specs into main specs; archives completed change |
| judgment-day | user says "judgment day", "judgment-day", "review adversarial", "dual review", "doble review", "juzgar", "que lo juzguen" | Parallel adversarial review: two blind judges review simultaneously |
| branch-pr | creating a pull request, opening a PR, preparing changes for review | PR creation workflow following issue-first enforcement |
| issue-creation | creating a GitHub issue, reporting a bug, requesting a feature | Issue creation workflow following issue-first enforcement |
| git-github | creating branches, writing commit messages, opening PRs, doing code review | Git and GitHub workflow standards — branching, commits, PRs |
| skill-creator | user asks to create a new skill or document patterns for AI | Creates new AI agent skills following the Agent Skills spec |
| go-testing | writing Go tests, using teatest, adding test coverage | Go testing patterns including Bubbletea TUI testing |

## Project Conventions

| File | Notes |
|------|-------|
| AGENTS.md | Next.js 16 agent rules — read BEFORE touching any Next.js code; APIs may differ from training data |
| CLAUDE.md | References AGENTS.md; same Next.js agent rules apply |

## Compact Rules

### sdd-init
- Triggered by: /sdd-init, "sdd init", "iniciar sdd"
- Does: detects stack, testing capabilities, saves to engram, writes .atl/skill-registry.md
- Phase model: sonnet
- persistence mode: engram (do NOT create openspec/ directory)

### sdd-explore
- Triggered by: /sdd-explore <topic>, or orchestrator launches for investigation
- Does: reads codebase, compares approaches, returns exploration report — no project files created
- Phase model: sonnet
- Engram artifact key: `sdd/{change-name}/explore` or `sdd/explore/{topic-slug}` if standalone

### sdd-propose
- Triggered by: orchestrator after exploration; or /sdd-new
- Does: produces structured proposal (intent, scope, risk, approach)
- Phase model: opus
- Reads: `sdd/{change-name}/explore` (optional), `sdd-init/{project}` (optional)
- Engram artifact key: `sdd/{change-name}/proposal`

### sdd-spec
- Triggered by: orchestrator after proposal
- Does: writes delta specs — what is ADDED, MODIFIED, or REMOVED from system behavior
- Phase model: sonnet
- Reads: `sdd/{change-name}/proposal` (required)
- Engram artifact key: `sdd/{change-name}/spec`

### sdd-design
- Triggered by: orchestrator after proposal (can run parallel with sdd-spec)
- Does: architecture decisions, data flow, file changes, technical rationale
- Phase model: opus
- Reads: `sdd/{change-name}/proposal` (required), `sdd/{change-name}/spec` (optional)
- Engram artifact key: `sdd/{change-name}/design`

### sdd-tasks
- Triggered by: orchestrator after spec + design
- Does: concrete actionable implementation checklist organized by phase
- Phase model: sonnet
- Reads: proposal + spec + design (all required)
- Engram artifact key: `sdd/{change-name}/tasks`

### sdd-apply
- Triggered by: /sdd-apply [change], or orchestrator launches for implementation
- Does: implements tasks in batches; marks tasks complete via mem_update
- Phase model: sonnet
- TDD: RED→GREEN→REFACTOR mandatory (strict_tdd: true)
- Stack: Next.js 16 App Router + TypeScript strict + Tailwind v4 + Supabase + Cloudinary + Resend
- Test runner: vitest + @testing-library/react; run `vitest run` to verify
- IMPORTANT: read AGENTS.md before touching any Next.js code
- Engram artifact key: `sdd/{change-name}/apply-progress`

### sdd-verify
- Triggered by: /sdd-verify [change], or orchestrator launches for validation
- Does: proves implementation is correct — static analysis + execution evidence required
- Phase model: sonnet
- Reports: CRITICAL / WARNING / SUGGESTION severity levels
- Reads: spec + tasks + design + proposal (all required)
- Engram artifact key: `sdd/{change-name}/verify-report`

### sdd-archive
- Triggered by: /sdd-archive [change], or orchestrator launches to close
- Does: merges delta specs into main specs; closes change; records all observation IDs
- Phase model: haiku
- Reads: all change artifacts (all required)
- Engram artifact key: `sdd/{change-name}/archive-report`

### judgment-day
- Triggered by: "judgment day", "judgment-day", "review adversarial", "dual review", "doble review", "juzgar", "que lo juzguen"
- Does: two independent blind judge sub-agents review the same target simultaneously; synthesizes findings; applies fixes; re-judges up to 2 iterations
- Phase model: 2x sonnet (parallel judges)
- Use after: significant implementations before merging; when a single reviewer might miss edge cases

### branch-pr
- Triggered by: creating a PR, opening a PR, preparing changes for review
- Does: issue-first enforcement — checks issue exists before creating PR; follows standard PR template
- Convention: always link to an existing GitHub issue

### issue-creation
- Triggered by: creating a GitHub issue, reporting a bug, requesting a feature
- Does: structures issue with proper labels, description, and acceptance criteria
- Convention: issue must exist before creating a branch or PR

### git-github
- Triggered by: creating branches, writing commit messages, opening PRs, code review, merging
- Does: enforces branching strategy, conventional commits, PR standards
- Convention: conventional commits only — no "Co-Authored-By" or AI attribution

### skill-creator
- Triggered by: "create a skill", "add agent instructions", "document patterns for AI"
- Does: produces SKILL.md following the Agent Skills spec format with frontmatter + compact rules

### go-testing
- Triggered by: writing Go tests, using teatest, adding test coverage
- Does: Go unit tests, Bubbletea TUI testing with teatest, table-driven tests, golden file testing
- NOTE: not applicable to soomosnova_oficial (Next.js project) — only relevant for Go side projects

## Project-Specific Gotchas

- Next.js 16 App Router: ALWAYS read AGENTS.md before writing any Next.js code — APIs may differ from training data
- TypeScript strict: all code must pass strict TS checks; no `any` without explicit justification
- Tailwind v4: uses `@tailwindcss/postcss`, different config from v3 — check docs before applying classes
- Supabase SSR: uses `@supabase/ssr` (not legacy auth-helpers) — use `createServerClient`/`createBrowserClient`
- Image domains: Supabase storage and Cloudinary are whitelisted in next.config.ts
- Server actions: preferred over API routes for mutations; use `server-only` package for sensitive modules
- Testing: vitest + jsdom + @testing-library/react; no jest; run `npm test` (vitest run)
- No coverage tool configured: vitest is present but no `--coverage` flag or `@vitest/coverage-v8` in devDependencies
