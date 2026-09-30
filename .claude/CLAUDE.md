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

Absolutely no em dashes are to be employed within this repository. This is
enforced by a `PostToolUse` hook on `Write|Edit` in `.claude/settings.json`,
which greps the written or edited file for the em dash character (U+2014)
and blocks with exit code 2 if found; binary files are skipped via
`grep -I`.

While the initial purpose of this repository is for experimentation with
custom system prompt via the TypeScript SDK, it is expected to grow
further.

## Architecture

`src/index.ts` is the experimentation entry point. It calls `query()` from
`@anthropic-ai/claude-agent-sdk` with a custom `options.systemPrompt`
string (overriding Claude Code's default preset entirely, rather than
`{ type: 'preset', preset: 'claude_code', append: ... }`) and streams the
`text_delta` events of `stream_event` messages to stdout
(`includePartialMessages: true`). The package is ESM-only
(`"type": "module"` in `package.json`, ships no CJS build), so `tsconfig.json`
targets `module`/`moduleResolution: NodeNext`.

`query()` spawns the SDK's bundled native `claude` binary for every call,
so the exported `options` keep that subprocess lean: `tools: []` drops
roughly 32k input tokens of tool definitions, and `settingSources: []`
stops it from loading `~/.claude` and `.claude/` settings, which would
otherwise run this repo's `SessionStart` hook (a full `npm install`) and
every enabled plugin before the first token (measured at about 12s).
The CLI still prepends a fixed identity line ("You are a Claude agent,
built on Anthropic's Claude Agent SDK.") and injects environment context
(working directory, model name, date) regardless of `systemPrompt`; the
persona prompt handles that by telling the model to treat them as
incidental and not to volunteer its provenance. Only calling the Messages
API directly gives full control of the system prompt.

Build output goes to `dist/` (gitignored, rebuilt via `npm run build`);
never edit files there directly.

Auth for `query()` comes from the environment: `ANTHROPIC_API_KEY` (API
credits) or `CLAUDE_CODE_OAUTH_TOKEN` (Claude Pro/Max subscription, minted
via `claude setup-token`). Copy `.env.example` to `.env` and fill in one;
`.env` itself is gitignored. `npm run dev` and `npm start` load it
automatically via Node's `--env-file-if-exists` flag (no `dotenv`
dependency); it is a no-op if `.env` does not exist, so `npm run build`
and `npm run typecheck` need no such flag.

`src/index.test.ts` is colocated with the source it tests (Vitest
convention); `tsconfig.json` excludes `src/**/*.test.ts` from `npm run
build` since Vitest transpiles tests itself and does not need the `dist/`
output.

## Commands

- `mise.toml` pins Node.js and npm for local shells, CI (via
  `jdx/mise-action`) and the remote `SessionStart` hook
  (`.claude/hooks/install-deps.sh`, which installs mise if missing). Keep
  `"npm:npm"` listed before `node`: mise puts earlier tools first on
  `PATH`, otherwise node's bundled npm shadows it. `devEngines` in
  `package.json` makes every npm command (including `npm run` and `npx`)
  fail with `EBADDEVENGINES` on npm older than 12, so run npm through mise
  (`mise exec -- npm ...`) wherever mise is not activated.
- `npm ci` (or `npm install`): install dependencies. `node_modules/` is
  gitignored and not present by default. npm 12+ blocks dependency install
  scripts not listed in `allowScripts` in `package.json`; entries use bare
  package names (not `name@version`, which `npm install-scripts approve`
  writes) so version bumps do not reintroduce the warning.
- `npm run dev`: run `src/index.ts` directly via `tsx`, no build step.
  Extra argv after the script becomes the prompt, e.g.
  `npm run dev -- "What is your name?"`.
- `npm run build`: compile `src/` to `dist/` via `tsc`.
- `npm start`: run the compiled `dist/index.js` with Node directly.
- `npm run typecheck`: runs `tsc --noEmit`.
- `npm test`: runs `vitest run` (single pass, not watch mode).
- `npm run format` / `npm run format:check`: write or verify Biome
  formatting for JS/TS/JSON(C) (see `biome.json`).
- `npm run lint`: runs `biome lint .` against JS/TS/JSON(C).
- `npm run lint:md`: runs `remark . --frail` (fails on warnings) against
  every Markdown file.
- `npm run commit`: runs `cz` (Commitizen) using the
  `@chewygumxx/cz-commitlint` adapter (which wraps `@commitlint/cz-commitlint`
  to show enum titles instead of raw names in prompts, without patching it)
  to interactively build a conventional commit that satisfies
  `.commitlintrc.mts`.
- Every commit is checked by a Husky `commit-msg` hook
  (`.husky/commit-msg`), which runs `commitlint --edit`; non-conforming
  commit messages are rejected locally, not just in CI. It calls
  `commitlint` directly (Husky puts `node_modules/.bin` on `PATH`) rather
  than via `npx`, so `devEngines` cannot block commits.
- `.github/workflows/ci.yaml` runs install, typecheck, build,
  `format:check`, `lint`, `lint:md`, and the test suite on every push/PR.
  `.github/workflows/commitlint.yaml` separately lints commit messages.
  `.github/dependabot.yml` opens weekly update PRs for both npm
  dependencies and GitHub Actions versions.

## Commit message rules

Enforced by `.commitlintrc.mts` (extends `@commitlint/config-conventional`):

- Header max length: 50 characters.
- `type` must be one of: `feat`, `fix`, `tweak`, `chore`, `style`, `docs`,
  `ci`, `refactor`, `perf`, `build`, `test`, `revert`.
- `scope` is optional but, if present, must use `/` as a delimiter (multiple
  scopes may be combined, e.g. `feat(sdk/config): ...`) and each part must
  be one of the entries in the `scopes.enum` array in `.commitlintrc.mts`:
  `claude` (Claude Code assets: hooks, skills, agents, etc.), `sdk` (Agent
  SDK experimentation source under `src/`), or `config` (repository tooling
  configuration, e.g. `tsconfig.json`, `.editorconfig`). Add further scopes
  to that array before using them.
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
- `biome.json` formats and lints JS/TS/JSON(C) (`*.jsonc` files are
  formatted without trailing commas via an override); it defers to
  `.editorconfig` for indentation (`useEditorconfig: true`) rather than
  duplicating it, and respects `.gitignore` so `dist/` is skipped
  automatically. `typescript-eslint` was considered instead but is
  incompatible with this repo's `typescript@^7.0.2` (its peer range caps
  at `<6.1.0`); Biome has no dependency on the `typescript` package, so it
  sidesteps that entirely. It does **not** cover YAML (the GitHub Actions
  workflow files, `dependabot.yml`) or Markdown; those are hand-formatted
  and reviewed rather than auto-checked. `package-lock.json` is
  auto-protected by Biome and never reformatted.
- Markdown is linted via `remarkConfig` in `package.json`
  (`remark-preset-lint-recommended` + `remark-preset-lint-consistent`,
  `remark-frontmatter` for the YAML header blocks used throughout this
  repo, and `remark-gfm` so GitHub-flavored syntax, e.g. the `- [ ]` task
  lists in `.github/pull_request_template.md`, parses correctly instead of
  being mistaken for broken link references).
- `.github/pull_request_template.md` intentionally omits the file header
  convention: its content becomes the live, editable PR description body,
  so a persistent header would show up as text every contributor has to
  delete.
- `biome.json` also omits the file header convention: unlike
  `tsconfig.json`, Biome's own config parser does not treat `.json` as
  JSONC and errors on a leading comment block.
