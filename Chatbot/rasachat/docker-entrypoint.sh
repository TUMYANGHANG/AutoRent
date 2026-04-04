#!/bin/sh
set -e

# Custom action server (must match endpoints.yml: localhost:5055)
rasa run actions --actions actions.actions --port 5055 &
ACTIONS_PID=$!

cleanup() {
  kill "$ACTIONS_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# Brief wait so the action server is ready before the first message
sleep 5

exec rasa run \
  --enable-api \
  --cors "*" \
  --port 5005 \
  "$@"
