# ShopBoard Codex Skills

This directory contains complete copies of the installed Vercel skill bundles:

- `vercel-react-best-practices` — version 1.0.0, 76 files.
- `vercel-composition-patterns` — version 1.0.0, 14 files.

Upstream: [Vercel Agent Skills](https://github.com/vercel-labs/agent-skills).

Each bundle preserves its original `SKILL.md`, compiled `AGENTS.md`, metadata, README, and individual rule files. The copied files were verified against the installed originals with SHA256 hashes. Replace a whole bundle when updating it so references remain complete.

Codex discovers project skills under `.agents/skills/`. Apply the rules relevant to the repository's React and Vite client stack; server-only and Next.js examples are reference material rather than requirements to change the stack.

The third-party bundles are excluded from project Prettier and Oxlint checks. Repository engineering conventions remain in the root `AGENTS.md`, mirrored in `CLAUDE.md`.
