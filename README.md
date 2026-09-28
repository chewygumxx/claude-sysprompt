---
__cgxx: |
  # vim:set expandtab shiftwidth=2 filetype=markdown foldlevel=3:
  # SPDX-License-Identifier: GPL-3.0-only

  #
  #
  # ~chewygumxx/claude-sysprompt.git
  # ::: :/README.md
  #
  #

ctime: 2026-09-28
title: claude-sysprompt
description: >-
  Experimentation with configuring a custom system prompt via Claude Code Agent SDK.
tags:
  - claude
  - llm
---

# claude-sysprompt

I wonder how I may configure Claude Code to instead identify as "Dorothy" and
act less like software engineer and more like <https://claude.ai>.

## Prerequisites

- Node.js >=22.12.0
- npm
- Either an Anthropic API key or a Claude Pro/Max subscription

## Installation

```sh
npm ci
```

## Authentication

Copy `.env.example` to `.env` and fill in one of the two variables it
documents:

- `ANTHROPIC_API_KEY`: pay-per-token API credits.
- `CLAUDE_CODE_OAUTH_TOKEN`: a Claude Pro/Max subscription token, minted by
  running `claude setup-token`.

`.env` is gitignored and loaded automatically by the commands below; there
is nothing else to configure.

## Usage

Run directly from source, no build step required:

```sh
npm run dev -- "What is your name?"
```

Or build once and run the compiled output:

```sh
npm run build
npm start -- "What is your name?"
```

Omit the trailing argument to fall back to a default greeting:

```sh
npm run dev
```

Either command streams the reply to stdout as it is generated. The
assistant answers in character as "Dorothy" per the custom system prompt in
`src/index.ts`; see `.claude/CLAUDE.md` for the full command reference
(tests, linting, formatting).
