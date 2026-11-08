# Project Tooling Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task by task.

**Goal:** Finish commit protection, expose type and formatting checks, mirror engineering rules for Claude, and check in both requested Codex skills.

**Architecture:** Keep the existing Vite, TypeScript, Oxlint, Prettier, and Husky tooling. Use repository-scoped `.agents/skills/` for complete copies of the installed Vercel skills. Keep `AGENTS.md` authoritative and `CLAUDE.md` identical.

**Tech Stack:** npm, Git hooks, Husky, lint-staged, TypeScript, Oxlint, Prettier, Markdown.

**Spec:** The user's four tooling tasks in this conversation and repository `AGENTS.md`.

## Global Constraints

- Continue in the user's current checkout and preserve existing feature changes.
- Execute tasks in order, autonomously, without committing or publishing.
- Keep existing strict TypeScript settings and plain CSS.
- Add no dependencies: the required tools and full skill bundles are already installed.
- Use focused temporary workflow probes instead of introducing a test framework.

## Review Focus

- Commits with explicit `any` fail, while valid staged TypeScript passes.
- Bad formatting and type errors fail the new commands and commit hook.
- `typecheck` checks both referenced TypeScript projects without Vite output.
- Vendored skills retain their referenced rules and stay outside application formatting and linting.
- Verification leaves the user's staging area and feature behavior intact.

## Task 1: Commit protection

- [x] Inspect the saved hook, lint-staged configuration, and explicit-any rule.
- [x] Verify rejection and acceptance in a temporary Git repository using the real installed tools and copied project configuration.

## Task 2: Type and formatting commands

- [x] Confirm `typecheck` and `format:check` are missing.
- [x] Add `typecheck` (`tsc -b`), `format` (`prettier --write .`), and `format:check` (`prettier --check .`); have build reuse typecheck.
- [x] Check staged formatting with lint-staged and run project typecheck in the hook.
- [x] Format the existing files that fail Prettier, preserving their code behavior.
- [x] Document commands and commit behavior in README; verify lint, typecheck, formatting, tests, and build.

## Task 3: Mirrored engineering rules

- [x] Update AGENTS with the new tooling conventions and rule-file synchronization requirement.
- [x] Create `CLAUDE.md` as an exact copy and verify identical hashes.

## Task 4: Codex project skills

- [x] Copy both complete installed Vercel skill directories into `.agents/skills/` and verify every file against its source.
- [x] Document discovery and Vite-specific use; ignore third-party skill formatting/linting.
- [x] Re-run final checks and independently review the focused tooling changes.

## Execution Notes

- Baseline: Husky and lint-staged are installed; staged TypeScript runs Oxlint and explicit `any` is an error.
- Baseline: 19 files fail Prettier, including existing feature work. Only formatting changes are needed there.
- Task 1: complete. The actual copied Husky hook rejected explicit `any` and accepted valid staged TypeScript in an isolated fixture. The user's staging area was not used.
- Task 2: complete. Lint, typecheck, format check, 32 tests, and production build passed. Hook probes rejected explicit `any`, bad TypeScript/JSON formatting, and a type error; accepted valid and unsupported files; and preserved partially staged content after rejection.
- Windows finding: `core.autocrlf=true` restored CRLF files after lint-staged error recovery. Added `.gitattributes` with `* text=auto eol=lf`; the full error/recovery probe then passed.
- Task 3: complete. Updated conventions and created `CLAUDE.md`; SHA256 matches `AGENTS.md`.
- Task 4: both complete Vercel bundles installed in `.agents/skills/`; all 90 copied files match source hashes, and their skill names and compiled guides were checked.
- Review finding reproduced: a type check after lint-staged accepted a staged type error when the working copy had an unstaged correction. Moved typecheck into `lint-staged.config.mjs` as a filename-free function task so it runs before unstaged edits are restored.
- Git portability: the index originally tracked `Agents.md`; its case-only rename to the required `AGENTS.md` is staged. All content changes remain uncommitted.
- Final review: the one Important finding was reproduced as a failing hook probe and fixed. The staged type-error/unstaged-correction case now fails correctly, preserves both versions, and passes after the correction is staged. No Critical or Minor findings remain.
- Final validation: lint, standalone typecheck, formatting check, all 32 tests, production build, mirrored rule hashes, all 90 skill source hashes, and Git whitespace checks passed. The final hook probes also passed for explicit `any`, formatting, type errors, partial staging, unsupported files, and error recovery.
- Follow-up reproduction: the user's full 132-file staged commit exceeded Windows' command-line limit in a Prettier npm wrapper; the failing task also interrupted typecheck. Updated the hook to use relative paths and 4,096-character argument batches, leaving room for wrapper overhead.
- Follow-up verification: the real pre-commit hook passed on all 132 staged files with the new flags, including all Prettier batches and project typecheck. The hook restored the partially staged documentation and hook edits after checking them.
