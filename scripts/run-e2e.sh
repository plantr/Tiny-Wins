#!/usr/bin/env bash
set -e

# Cleanup function to kill Expo on exit (success or failure)
cleanup() {
  if [ -n "$EXPO_PID" ]; then
    echo "[e2e] Stopping Expo dev server (PID $EXPO_PID)..."
    kill "$EXPO_PID" 2>/dev/null || true
    wait "$EXPO_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

echo "[e2e] Starting Expo dev server..."
npx expo start --dev-client --ios &
EXPO_PID=$!

echo "[e2e] Waiting for Expo dev server to be ready..."
npx wait-on http://localhost:8081 --timeout 60000

echo "[e2e] Seeding AsyncStorage with test data..."
node scripts/seed-e2e-data.js ios

echo "[e2e] Running Maestro E2E flows..."
maestro test .maestro/
E2E_EXIT=$?

echo "[e2e] Done. Cleaning up..."
exit $E2E_EXIT
