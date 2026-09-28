#!/usr/bin/env sh
# vim:set expandtab shiftwidth=4 filetype=sh:
# SPDX-License-Identifier: GPL-3.0-only

#
#
# ~chewygumxx/claude-sysprompt.git
# ::: :/.claude/hooks/install-deps.sh
#
#

set -u

[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0

root=${CLAUDE_PROJECT_DIR:-}
[ -n "$root" ] || root=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
[ -n "$root" ] || exit 0

[ -f "$root/package.json" ] || exit 0
command -v npm >/dev/null 2>&1 || exit 0

cd "$root" || exit 0
npm install
