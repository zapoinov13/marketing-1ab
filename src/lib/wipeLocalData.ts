/** Bump this to wipe local demo/progress caches once after deploy. */
export const DATA_RESET_VERSION = "2026-07-16-zero-v2";

const VERSION_KEY = "aml-data-reset-version";

const KEYS_TO_CLEAR = [
  "aml-demo-avatar",
  "aml-demo-profile",
  "aml-notify-prefs",
  "aml-homework-tasks-v2",
  "aml-homework-tasks-v3",
  "aml-mission-checklist",
  "aml-cloud-progress-reset",
];

/** Clears stale localStorage once per DATA_RESET_VERSION. */
export function wipeLocalDataIfNeeded() {
  if (typeof window === "undefined") return;
  try {
    const current = localStorage.getItem(VERSION_KEY);
    if (current === DATA_RESET_VERSION) return;
    for (const key of KEYS_TO_CLEAR) {
      localStorage.removeItem(key);
    }
    // also clear any leftover aml-* keys except the version marker we set next
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith("aml-") && key !== VERSION_KEY) {
        localStorage.removeItem(key);
      }
    }
    localStorage.setItem(VERSION_KEY, DATA_RESET_VERSION);
  } catch {
    /* ignore */
  }
}
