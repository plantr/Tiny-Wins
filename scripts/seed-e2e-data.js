#!/usr/bin/env node
/**
 * E2E Data Seeder for Tiny Wins
 *
 * Writes test fixture data directly to the iOS simulator's AsyncStorage SQLite
 * database so Maestro flows start from a known, deterministic state.
 *
 * Usage:
 *   node scripts/seed-e2e-data.js [platform]
 *   node scripts/seed-e2e-data.js ios      (default)
 *   node scripts/seed-e2e-data.js --help
 *
 * Prerequisites (iOS):
 *   - Xcode + Command Line Tools installed
 *   - iOS Simulator booted with app installed
 *   - sqlite3 CLI available (built-in on macOS)
 *
 * AsyncStorage keys seeded:
 *   - tinywins_habits        (matches lib/habits-context.tsx HABITS_KEY)
 *   - tinywins_logs          (matches lib/habits-context.tsx LOGS_KEY)
 *   - tinywins_reviews       (matches lib/habits-context.tsx REVIEWS_KEY)
 *   - tinywins_identity      (identity area selections)
 *   - tinywins_fresh_v1      (skip fresh-install clear)
 *   - onboarding_completed   (skip onboarding)
 *   - app_theme_mode         (consistent dark theme for screenshots)
 *   - app_week_start_day     (week starts Monday)
 *
 * TODO: Android support — use adb to push SQLite file to emulator's
 *   /data/data/com.myapp/databases/RKStorage location.
 */

"use strict";

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const APP_BUNDLE_ID = "com.myapp";

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  console.log(`
Usage: node scripts/seed-e2e-data.js [platform]

Options:
  ios         Seed iOS simulator AsyncStorage (default)
  android     Not yet supported (TODO)
  --help      Show this help message

This script writes E2E test fixture data to the running iOS simulator's
AsyncStorage database so Maestro flows start from a clean, known state.
  `);
  process.exit(0);
}

const platform = args[0] || "ios";

if (platform !== "ios") {
  console.error(`Error: Platform "${platform}" is not yet supported.`);
  console.error("Only iOS is supported. Android support is a TODO.");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Fixture data
// ---------------------------------------------------------------------------

/**
 * Returns an ISO date string (YYYY-MM-DD) for `daysAgo` days before today.
 */
function dateStr(daysAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

const NOW = Date.now();
const ONE_DAY = 86400000;

const habits = [
  {
    id: "e2e-habit-1",
    title: "Morning meditation",
    icon: "flower",
    iconColor: "#4DA6FF",
    gradientColors: ["#4DA6FF", "#7B61FF"],
    goal: 1,
    unit: "session",
    frequency: "daily",
    current: 0,
    streak: 3,
    bestStreak: 5,
    weekData: [1, 1, 1, 0, 0, 0, 0],
    createdAt: NOW - ONE_DAY * 7,
  },
  {
    id: "e2e-habit-2",
    title: "Read 10 pages",
    icon: "book",
    iconColor: "#00E5C3",
    gradientColors: ["#00E5C3", "#4DA6FF"],
    goal: 10,
    unit: "pages",
    frequency: "daily",
    current: 0,
    streak: 1,
    bestStreak: 3,
    weekData: [1, 0, 1, 0, 0, 0, 0],
    createdAt: NOW - ONE_DAY * 5,
  },
];

// Generate logs for the current week (last 7 days) covering both habits.
// Mix of done and missed statuses so the review scorecard shows data.
const logs = [
  // Morning meditation: done Mon, Tue, Wed; missed Thu
  { id: "e2e-log-1", habitId: "e2e-habit-1", date: dateStr(6), status: "done" },
  { id: "e2e-log-2", habitId: "e2e-habit-1", date: dateStr(5), status: "done" },
  { id: "e2e-log-3", habitId: "e2e-habit-1", date: dateStr(4), status: "done" },
  { id: "e2e-log-4", habitId: "e2e-habit-1", date: dateStr(3), status: "missed" },
  // Read 10 pages: done Mon, Wed; missed Tue
  { id: "e2e-log-5", habitId: "e2e-habit-2", date: dateStr(6), status: "done" },
  { id: "e2e-log-6", habitId: "e2e-habit-2", date: dateStr(5), status: "missed" },
  { id: "e2e-log-7", habitId: "e2e-habit-2", date: dateStr(4), status: "done" },
];

const reviews = [];

const identity = { selectedIds: ["health", "learning"] };

const seedData = {
  tinywins_habits: JSON.stringify(habits),
  tinywins_logs: JSON.stringify(logs),
  tinywins_reviews: JSON.stringify(reviews),
  tinywins_identity: JSON.stringify(identity),
  tinywins_fresh_v1: "true",
  onboarding_completed: "true",
  app_theme_mode: "dark",
  app_week_start_day: "monday",
};

// ---------------------------------------------------------------------------
// iOS seeding via sqlite3 CLI
// ---------------------------------------------------------------------------

function seedIOS() {
  console.log(`Seeding iOS simulator (bundle: ${APP_BUNDLE_ID})...`);

  // Step 1: Find the app data container on the booted simulator
  let appContainer;
  try {
    appContainer = execSync(
      `xcrun simctl get_app_container booted ${APP_BUNDLE_ID} data`,
      { encoding: "utf8" }
    ).trim();
  } catch (err) {
    console.error("Error: Could not find app container on booted simulator.");
    console.error("Make sure:");
    console.error("  1. An iOS simulator is booted (open Xcode > Simulator)");
    console.error(`  2. The app (${APP_BUNDLE_ID}) is installed on it`);
    console.error("  3. xcrun simctl is available (Xcode Command Line Tools)");
    console.error("");
    console.error("Run: xcode-select --install  (if xcrun is not found)");
    process.exit(1);
  }

  console.log(`App container: ${appContainer}`);

  // Step 2: Locate the AsyncStorage SQLite database
  // Expo's AsyncStorage on iOS uses catalystLocalStorage table in a SQLite DB
  // at <appContainer>/Documents/RCTAsyncLocalStorage_V1
  const dbDir = path.join(appContainer, "Documents", "RCTAsyncLocalStorage_V1");
  const dbPath = path.join(dbDir, "RCTAsyncLocalStorage.db");

  // Ensure the directory exists (app may not have created it yet on first install)
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log(`Created AsyncStorage directory: ${dbDir}`);
  }

  // Step 3: Create the table if it doesn't exist (sqlite3 will create the DB file)
  try {
    execSync(
      `sqlite3 "${dbPath}" "CREATE TABLE IF NOT EXISTS catalystLocalStorage (key TEXT PRIMARY KEY, value TEXT NOT NULL);"`,
      { encoding: "utf8" }
    );
  } catch (err) {
    console.error(`Error: Could not create/access SQLite database at ${dbPath}`);
    console.error(err.message);
    process.exit(1);
  }

  // Step 4: Upsert each key-value pair
  let insertedCount = 0;
  for (const [key, value] of Object.entries(seedData)) {
    // Escape single quotes in value for SQLite
    const escapedValue = value.replace(/'/g, "''");
    const escapedKey = key.replace(/'/g, "''");
    try {
      execSync(
        `sqlite3 "${dbPath}" "INSERT OR REPLACE INTO catalystLocalStorage (key, value) VALUES ('${escapedKey}', '${escapedValue}');"`,
        { encoding: "utf8" }
      );
      console.log(`  [OK] ${key}`);
      insertedCount++;
    } catch (err) {
      console.error(`  [FAIL] ${key}: ${err.message}`);
      process.exit(1);
    }
  }

  console.log(`\nSeeded ${insertedCount} keys into ${dbPath}`);
  console.log("Done. You can now run Maestro flows.");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

seedIOS();
