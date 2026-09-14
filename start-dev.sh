#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")"

backend_pid=''
frontend_pid=''

stop_tree() {
    local process_id="$1" child
    for child in $(pgrep -P "$process_id" || true); do
        stop_tree "$child"
    done
    kill -TERM "$process_id" 2>/dev/null || true
}

cleanup() {
    trap - EXIT INT TERM
    printf '\nStopping demo services…\n'
    if [[ -n "$frontend_pid" ]]; then stop_tree "$frontend_pid"; fi
    if [[ -n "$backend_pid" ]]; then stop_tree "$backend_pid"; fi
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

for dependency in java npm curl pgrep; do
    if ! command -v "$dependency" >/dev/null; then
        printf 'Missing prerequisite: %s\n' "$dependency" >&2
        exit 1
    fi
done

# Refuse to report an already-running service as the process we just started.
for url in http://localhost:8080 http://localhost:3000; do
    if curl --silent --output /dev/null --max-time 2 "$url"; then
        printf 'A service is already running at %s. Stop it or use manual startup.\n' "$url" >&2
        exit 1
    fi
done

printf 'Installing frontend dependencies…\n'
(cd src/main/webui && npm ci)

printf 'Starting Quarkus…\n'
./mvnw quarkus:dev &
backend_pid=$!

wait_until_ready() {
    local url="$1" process_id="$2" attempt
    for ((attempt = 0; attempt < 120; attempt++)); do
        if ! kill -0 "$process_id" 2>/dev/null; then
            printf 'Service exited before becoming ready: %s\n' "$url" >&2
            return 1
        fi
        if curl --fail --silent --output /dev/null --max-time 2 "$url"; then
            return 0
        fi
        sleep 1
    done
    printf 'Timed out waiting for %s. Check the startup logs above.\n' "$url" >&2
    return 1
}
wait_until_ready http://localhost:8080/supervisor/pending "$backend_pid"

printf 'Starting the SPA…\n'
(cd src/main/webui && exec npm run dev) &
frontend_pid=$!
wait_until_ready http://localhost:3000 "$frontend_pid"
printf '\nDemo ready: http://localhost:3000\nBackend: http://localhost:8080\nPress Ctrl+C to stop both services.\n'

while kill -0 "$backend_pid" 2>/dev/null && kill -0 "$frontend_pid" 2>/dev/null; do
    sleep 1
done
printf 'A demo service stopped. Shutting down its companion.\n' >&2
exit 1
