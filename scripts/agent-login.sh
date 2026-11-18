#!/usr/bin/env bash
#
# agent-login.sh — bootstrap an authenticated agent-browser session for
# testing the Salt Rim client (assumed running on http://localhost:5173).
#
# Usage:
#   export SR_ADMIN_EMAIL="..."
#   export SR_ADMIN_PASSWORD="..."
#   ./scripts/agent-login.sh
#
# The script uses a stable agent-browser session derived from the current
# git worktree, so auth state is reused across runs. On subsequent runs it
# short-circuits instead of logging in again — the backend rate-limits
# login to ~10 attempts per window.
#
# Auth is a Sanctum bearer token stored in localStorage under `_salt_rim`,
# so `--restore` persistence survives daemon restarts. The script also
# validates the token against the API, because the Vue router guard only
# checks that a user id exists in stored state — it cannot detect an
# expired token.
set -euo pipefail

FRONTEND_URL="${SR_FRONTEND_URL:-http://localhost:5173}"
API_URL="${SR_API_URL:-http://localhost:8000}"

if [[ -z "${SR_ADMIN_EMAIL:-}" || -z "${SR_ADMIN_PASSWORD:-}" ]]; then
    echo "ERROR: SR_ADMIN_EMAIL and SR_ADMIN_PASSWORD must be set." >&2
    echo "  export SR_ADMIN_EMAIL=\"...\"" >&2
    echo "  export SR_ADMIN_PASSWORD=\"...\"" >&2
    exit 1
fi

SESSION="$(agent-browser session id --scope worktree --prefix salt-rim)"
export AGENT_BROWSER_SESSION="$SESSION"

ab() {
    agent-browser --session "$SESSION" --restore "$@"
}

echo "agent-browser session: $SESSION"

# Probe a protected route. If the router guard bounces us to /login, the
# session is not authenticated and we perform a real UI login.
ab open "$FRONTEND_URL/bars"
ab wait --load networkidle >/dev/null 2>&1 || true
CURRENT_URL="$(ab get url || true)"

if [[ "$CURRENT_URL" != *"login"* ]]; then
    # Stored state passed the router guard, but the token may have expired.
    # Verify it against the API before trusting this session.
    TOKEN="$(ab eval --stdin <<'EOF'
(() => {
    try {
        return JSON.parse(localStorage.getItem("_salt_rim") ?? "{}").token ?? "";
    } catch (e) {
        return "";
    }
})()
EOF
)" || TOKEN=""

    if [[ -n "$TOKEN" ]] && curl -sf -o /dev/null -H "Authorization: Bearer $TOKEN" "$API_URL/api/profile"; then
        echo "Already authenticated with a valid token (url: $CURRENT_URL). Nothing to do."
        echo "For further commands, export:"
        echo "  export AGENT_BROWSER_SESSION=\"$SESSION\""
        exit 0
    fi

    echo "Stored state exists but the token is invalid or expired — logging in again."
    ab open "$FRONTEND_URL/login"
fi

# Wait for the login form to render. If it never appears, the frontend is
# down or the API server behind it is unreachable.
if ! ab wait "#email" >/dev/null 2>&1; then
    echo "ERROR: Login form did not appear on $FRONTEND_URL." >&2
    echo "The dev server may be down, or the API server ($API_URL) is unreachable." >&2
    exit 1
fi

ab fill "#email" "$SR_ADMIN_EMAIL"
ab fill "#password" "$SR_ADMIN_PASSWORD"
ab click "button[type=submit]"

# Post-login redirect goes to / (single bar) or /bars (no/multiple bars).
if ! ab wait --fn "window.location.pathname.indexOf('/login') !== 0" >/dev/null 2>&1; then
    echo "ERROR: Login did not complete. Check credentials and whether the account exists." >&2
    echo "Note: the backend rate-limits login attempts — do not retry more than ~10 times per window." >&2
    exit 1
fi

ab wait --load networkidle >/dev/null 2>&1 || true
CURRENT_URL="$(ab get url || true)"
echo "Login successful. Current URL: $CURRENT_URL"
echo "For further commands, export:"
echo "  export AGENT_BROWSER_SESSION=\"$SESSION\""
