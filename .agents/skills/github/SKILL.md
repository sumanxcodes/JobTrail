---
name: github
description: GitHub and software-development workflow for JobTrail. Use this skill when working with the JobTrail GitHub repository, branches, commits, pull requests, issues, reviews, CI, releases, or when coordinating development work that should be tracked through GitHub.
---

# JobTrail GitHub Engineering Skill

## Purpose

This skill defines how the coding agent should work with GitHub for the JobTrail project.

Repository:

- HTTPS: `https://github.com/sumanxcodes/JobTrail`
- SSH: `git@github-sumanxcodes:sumanxcodes/JobTrail.git`

Default branch:

main

JobTrail is a Next.js application using the App Router, React Server Components, Material Web, Supabase, and AI-assisted job application parsing.

The agent must treat GitHub as part of the engineering workflow, not merely as a place to store code.

The goal is to keep the repository:

- safe
- reviewable
- traceable
- easy to understand
- easy to revert
- aligned with the JobTrail specification
- free from unnecessary changes

---

# 1. Source of Truth

Before making a significant implementation decision, inspect the project specification.

The primary product/implementation specification is:

`job-tracker-agent-spec.md`

The specification defines:

- product requirements
- technology stack
- routes
- database requirements
- application workflow
- AI parsing behaviour
- security requirements
- build order
- non-goals
- constraints

Do not invent functionality that contradicts the specification.

Do not silently remove requirements from the specification.

Do not expand the product scope simply because a feature seems useful.

When the existing code conflicts with the specification:

1. inspect the existing implementation
2. identify the conflict
3. determine whether the task requires resolving it
4. avoid unrelated refactoring
5. ask the user before making a major architectural change

The current repository is the implementation reality.

The specification is the intended product behaviour.

Both must be considered.

---

# 2. Repository Context & SSH Configuration

The repository is:

`git@github-sumanxcodes:sumanxcodes/JobTrail.git` (or `https://github.com/sumanxcodes/JobTrail`)

Default branch:

`main`

### SSH Configuration

When interacting with GitHub (cloning, fetching, pulling, pushing, remote management), the agent must use the SSH host configuration from `~/.ssh/config`:

```ssh
# GitHub - sumanxcodes
Host github-sumanxcodes
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_lora
    IdentitiesOnly yes
```

- **Remote URL format**: `git@github-sumanxcodes:sumanxcodes/JobTrail.git`
- **Setting remote origin**:
  ```bash
  git remote add origin git@github-sumanxcodes:sumanxcodes/JobTrail.git
  # or if updating an existing remote:
  git remote set-url origin git@github-sumanxcodes:sumanxcodes/JobTrail.git
  ```

Never assume the repository structure is unchanged.

Before modifying files:

1. inspect the current branch
2. inspect the working tree
3. inspect relevant existing files
4. inspect recent commits when useful
5. inspect open PRs/issues when relevant
6. then make the smallest appropriate change

Do not rebuild existing functionality simply because the specification describes it.

Reuse existing implementation where appropriate.

---

# 3. Main Agent and Subagent Strategy

The main agent is responsible for:

- understanding the user's request
- deciding the implementation approach
- coordinating subagents
- resolving conflicting recommendations
- implementing or supervising implementation
- running validation
- reviewing the final diff
- managing GitHub workflow

Subagents are specialists.

They should provide information, analysis, review, or implementation assistance to the main agent.

The main agent remains responsible for the final result.

## Do not spawn subagents unnecessarily

For simple tasks, work directly.

Examples:

- changing text
- fixing a typo
- changing a small CSS value
- correcting a simple TypeScript error
- updating a single component
- adding a straightforward test

Do not create multiple subagents for trivial work.

## Use subagents when they provide meaningful value

Good reasons include:

- large feature implementation
- unfamiliar codebase area
- complex architecture
- security-sensitive work
- database/schema changes
- authentication
- AI integration
- significant UI work
- independent code review
- testing strategy
- CI investigation
- parallel investigation of unrelated parts of a feature

Example:

For a major application parsing feature, the main agent may delegate:

- architecture investigation
- Supabase/database investigation
- AI integration investigation
- security review
- testing strategy

The main agent must consolidate the results before making the final implementation decision.

---

# 4. Subagent Rules

Subagents must have a clearly defined objective.

Bad:

"Look at the project."

Good:

"Inspect the existing JobTrail application creation flow and identify where URL parsing should be integrated without changing the existing route structure."

Each subagent should return:

1. What it inspected
2. What it discovered
3. Relevant files
4. Recommended approach
5. Risks or trade-offs
6. Anything the main agent should verify

Do not allow subagents to independently introduce architectural changes without the main agent reviewing them.

Avoid multiple subagents making conflicting changes to the same files.

Prefer:

Research → Main agent decision → Implementation → Review

rather than:

Multiple agents independently rewriting the same feature.

---

# 5. Git Safety

Never directly modify `main` for feature work.

Before making changes, check:

```bash
git status
git branch --show-current
```