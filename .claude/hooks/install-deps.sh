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

root=${CLAUDE_PROJECT_DIR:-}
[ -n "$root" ] || root=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
[ -n "$root" ] || exit 0

[ -f "$root/package.json" ] || exit 0

cd "$root" || exit 0

if [ "${CLAUDE_CODE_REMOTE:-}" = "true" ]; then
    # The remote container may have no Bun, or not the one mise.toml pins,
    # so install mise and run the Bun it provides.
    PATH="$HOME/.local/bin:$PATH"
    if ! command -v mise >/dev/null 2>&1; then
        curl -fsSL https://mise.run | MISE_QUIET=1 sh >/dev/null || exit 1
    fi
    mise trust --quiet "$root/mise.toml" || exit 1
    mise install --quiet || exit 1
    mise exec -- bun install --frozen-lockfile
else
    command -v bun >/dev/null 2>&1 || exit 0
    bun install
fi
