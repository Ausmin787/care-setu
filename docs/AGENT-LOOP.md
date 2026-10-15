# Agent loop (D-060)

How Hermes drives the build loop. The decision and its limits are in D-060; this file is the working contract. Hermes is not part of
this codebase: its scripts live outside the repo, in `%LOCALAPPDATA%\hermes\agent-loop\`, so a worker editing the repo cannot edit the
gate that polices it.

## Who may do what
| Actor | May | May not |
|---|---|---|
| Codex / Claude workers | edit and **commit locally** in a worktree on an `agent/*` branch; run the green check | push directly, open PRs, merge, read the token |
| `agent-push.mjs` (run by Hermes, no model) | push the current `agent/*` branch, open or find its **draft** PR, report on Telegram | push anything else, force-push, touch governance files |
| `/merge N` (Hermes plugin `care-setu-merge`, no model) | merge PR N when `merge-gate.mjs` agrees | merge a draft, a failing or unreviewed PR |
| Sasanka | mark a PR ready for review; type `/merge N`; push governance changes himself | |

A worker "push" in D-060 means `agent-push.mjs` pushes the worker's committed `agent/*` branch on its behalf; the worker never holds or reads the token.

## Rules the scripts enforce
- **Branch:** only the checked-out branch, only names matching `agent/<a-z0-9._-/>`, pushed to the fixed care-setu URL with a plain refspec (a non-fast-forward is refused, no `+`), git hooks and credential helpers off.
- **Held back for a person:** `.github/`, `.claude/`, `.coderabbit.yaml`, `CLAUDE.md`, `AGENTS.md`, `docs/INVARIANTS.md`, checker configs (`knip`, `eslint`, `playwright`, `vitest`, `tsconfig*`), any `.env*`.
- **Refused diffs:** empty, or added lines that look like a secret (GitHub, OpenAI-style and Telegram tokens, private keys).
- **Merge:** the PR is open, **not a draft**, inside care-setu, the `green` check passed, CodeRabbit **reported and did not skip** (a skipped review also reads `success` on GitHub), nothing pending, and GitHub says `clean`. The merge is pinned to the checked commit, so a later push makes GitHub refuse it. GitHub's branch protection stays the real gate.
- **Why `/merge N` and not "merge #N":** plain text goes to the model, and Hermes exec quick commands take no arguments. A plugin slash command is the one deterministic path with an argument.
- **Why drafts:** a person marks the PR ready, which is the moment CodeRabbit reviews it.

## The token
`%LOCALAPPDATA%\hermes\secrets\care-setu-agent.token`, readable by Sasanka's account only, read by `askpass.mjs` (for git) and `lib.mjs` (for the GitHub API) and by nothing else. Workers run in the Codex sandbox (its restricted users cannot open the file, shown 2026-10-15) or with a narrow Claude tool list, never in `--dangerously-bypass-approvals-and-sandbox` or `-s danger-full-access`. Claude's deny rules for the path are a speed bump, not a wall: a shell glob walks around them.

## Worker rules
- Close stdin (`< /dev/null`) on `codex exec` or it waits forever. Its exit code is not evidence: judge by the diff and the green check.
- Audit log: `%LOCALAPPDATA%\hermes\agent-loop\audit.jsonl` (branches, ids and outcomes only).
- Messages to Telegram carry no personal data and no secrets.
