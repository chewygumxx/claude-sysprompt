---
__cgxx: |
  # vim:set expandtab shiftwidth=2 filetype=markdown foldlevel=3:
  # SPDX-License-Identifier: GPL-3.0-only

  #
  #
  # ~chewygumxx/claude-sysprompt.git
  # ::: :/.claude/CLAUDE.md
  #
  #

ctime: 2026-09-28
title: CLAUDE.md
description: >-
  Instruction file for the repository: 'chewygumxx/claude-sysprompt'
tags:
  - claude
  - llm
---

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working
with code in this repository.

Compose single-line commit messages for granular commits and continuously
commit.

Absolutely no em dashes are to be employed within this repository.

While the initial purpose of this repository is for experimentation with
custom system prompt via the TypeScript SDK, it is expected to grow
further.

## Repository state

This repository is currently a tooling scaffold, not yet an application.
There is no `src/`, no entry point, and no `tsconfig.json` despite
`typecheck` being wired up in `package.json`. Expect real Agent SDK code
to land under a new `src/`-style directory as the project grows.

## Commands

- `npm ci` (or `npm install`): install dependencies. `node_modules/` is
  gitignored and not present by default.
- `npm run typecheck`: runs `tsc`. Requires a `tsconfig.json` to be added
  once real source exists.
- `npm run commit`: runs `cz` (Commitizen) using the `@commitlint/cz-commitlint`
  adapter (patched via `patches/@commitlint/cz-commitlint@21.2.2.patch` to
  show enum titles instead of raw names in prompts) to interactively build a
  conventional commit that satisfies `.commitlintrc.mts`.
- Every commit is checked by a Husky `commit-msg` hook
  (`.husky/commit-msg`), which runs `commitlint --edit`; non-conforming
  commit messages are rejected locally, not just in CI.

## Commit message rules

Enforced by `.commitlintrc.mts` (extends `@commitlint/config-conventional`):

- Header max length: 50 characters.
- `type` must be one of: `feat`, `fix`, `tweak`, `chore`, `style`, `docs`,
  `ci`, `refactor`, `perf`, `build`, `test`, `revert`.
- `scope` is optional but, if present, must use `/` as a delimiter and the
  only currently allowed scope is `claude` (Claude Code assets: hooks,
  skills, agents, etc.). Add new scopes to the `scopes.enum` array in
  `.commitlintrc.mts` before using them.
- `subject` must be non-empty, in start-case or sentence-case.
- Body lines max 72 characters.

CI re-checks this on every push/PR via
`.github/workflows/commitlint.yaml` (`commitlint --last` on push,
`commitlint --from <base> --to <head>` on PRs).

## File header convention

Nearly every tracked file starts with a boilerplate header: a vim
modeline, an SPDX license identifier comment, and a repo-path breadcrumb
(e.g. `~chewygumxx/claude-sysprompt.git` / `::: :/path/to/file`). Keep
this header when editing existing files and follow the same pattern for
new files; it is kept in sync automatically by the
`sync-header-metadata` workflow (`.github/workflows/sync-header-metadata.yaml`),
which runs the `chewygumxx/sync-header-metadata` action on every push to
`main` and commits any corrections back.

## Repo metadata

`.repo-metadata.jsonc` is the source of truth for repository-level GitHub
settings (description, topics, license, default branch). Changes pushed
to `main` are applied live by
`.github/workflows/sync-repo-metadata.yaml` via the
`chewygumxx/sync-repo-metadata` action, authenticated as a GitHub App
(not the default `GITHUB_TOKEN`, since applying settings needs
`Administration: write`).

## Formatting

- `.editorconfig`: 4-space indentation, LF line endings, trimmed trailing
  whitespace, final newline on all files; Markdown files use 2-space
  indentation.
- Prettier is configured inline in `package.json` (`*.jsonc` files are
  formatted without trailing commas).
- Markdown is linted via `remarkConfig` in `package.json`
  (`remark-preset-lint-recommended` + `remark-preset-lint-consistent`,
  plus `remark-frontmatter` for the YAML header blocks used throughout
  this repo).
