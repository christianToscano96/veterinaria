# Skill Registry

**Delegator use only.** Any agent that launches sub-agents reads this registry to resolve compact rules, then injects them directly into sub-agent prompts. Sub-agents do NOT read this registry or individual SKILL.md files.

See `_shared/skill-resolver.md` for the full resolution protocol.

## User Skills

| Trigger | Skill | Path |
|---------|-------|------|
| When writing TypeScript code | typescript | file:///Users/chrsitiantoscano/.config/opencode/skills/typescript/SKILL.md |
| When styling with Tailwind | tailwind-4 | file:///Users/chrsitiantoscano/.config/opencode/skills/tailwind-4/SKILL.md |
| When creating Pull Requests | github-pr | file:///Users/chrsitiantoscano/.config/opencode/skills/github-pr/SKILL.md |
| When writing Go tests | go-testing | file:///Users/chrsitiantoscano/.config/opencode/skills/go-testing/SKILL.md |
| When using Python tests | pytest | file:///Users/chrsitiantoscano/.config/opencode/skills/pytest/SKILL.md |
| When writing React 19 | react-19 | file:///Users/chrsitiantoscano/.config/opencode/skills/react-19/SKILL.md |
| When using Zustand | zustand-5 | file:///Users/chrsitiantoscano/.config/opencode/skills/zustand-5/SKILL.md |
| When using Zod validation | zod-4 | file:///Users/chrsitiantoscano/.config/opencode/skills/zod-4/SKILL.md |
| When creating PRs | branch-pr | file:///Users/chrsitiantoscano/.config/opencode/skills/branch-pr/SKILL.md |
| When creating GitHub issues | issue-creation | file:///Users/chrsitiantoscano/.config/opencode/skills/issue-creation/SKILL.md |
| When doing adversarial review | judgment-day | file:///Users/chrsitiantoscano/.config/opencode/skills/judgment-day/SKILL.md |
| When writing E2E tests | playwright | file:///Users/chrsitiantoscano/.config/opencode/skills/playwright/SKILL.md |
| When building React Native apps | react-native | file:///Users/chrsitiantoscano/.config/opencode/skills/react-native/SKILL.md |
| When working with Next.js 15 | nextjs-15 | file:///Users/chrsitiantoscano/.config/opencode/skills/nextjs-15/SKILL.md |
| When building NestJS apps | nestjs-best-practices | file:///Users/chrsitiantoscano/.agents/skills/nestjs-best-practices/SKILL.md |
| When creating AI skills | skill-creator | file:///Users/chrsitiantoscano/.config/opencode/skills/skill-creator/SKILL.md |

## Compact Rules

Pre-digested rules per skill. Delegators copy matching blocks into sub-agent prompts as `## Project Standards (auto-resolved)`.

### typescript
- ALWAYS use const objects for enum-like values, then extract type with `typeof`
- ALWAYS use flat interfaces — nested objects need dedicated interfaces
- NEVER use `any` — use `unknown` for truly unknown types, generics for flexibility
- Use utility types: Pick, Omit, Partial, Required, Record
- Use type guards with `value is Type` pattern

### tailwind-4
- NEVER use var() in className — use Tailwind semantic classes
- NEVER use hex colors in className — use Tailwind color classes
- Use cn() for conditional classes, NOT for static ones
- Dynamic values go in style prop, not className
- Theme variables via CSS, not inline

### github-pr
- Use conventional commits format: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
- PR title should match commit convention
- Include summary: 1-3 bullet points of what changed
- Link related issues

### zod-4
- Use .schema for validation, .input for inference
- Use .transform() for data transformation
- Use discriminated unions for type narrowing
- Custom refinements with .refine()

### react-19
- No useMemo/useCallback needed — React Compiler handles memoization
- Use use() hook for promises/context, replaces useEffect
- Server Components by default, add 'use client' only for interactivity
- ref is a regular prop — no forwardRef needed

### zustand-5
- Use create with generic: create<Type>()
- No need for useStore selector — auto-subscribes
- Use set() for state updates, get() for current state

---

## Project Conventions

| File | Path | Notes |
|------|------|-------|
| AGENTS.md | /Users/chrsitiantoscano/Desktop/veterinaria/AGENTS.md | Full project spec - tech stack, DB schema, API endpoints, features |

Read the convention files listed above for project-specific patterns and rules. All referenced paths have been extracted — no need to read index files to discover more.