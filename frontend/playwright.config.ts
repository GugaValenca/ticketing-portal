import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const FRONTEND_URL = "http://localhost:5173";
const BACKEND_URL = "http://localhost:8001";

const backendDir = path.resolve(dirname, "../backend");
// Absolute path, platform-specific separator/extension - relative paths
// with forward slashes aren't reliably resolved as an executable by
// Windows' cmd.exe (the shell Playwright's webServer runs commands in).
const backendPython =
  process.platform === "win32"
    ? path.join(backendDir, ".venv", "Scripts", "python.exe")
    : path.join(backendDir, ".venv", "bin", "python");
const managePy = path.join(backendDir, "manage.py");

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: FRONTEND_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "npm run dev -- --port 5173",
      url: FRONTEND_URL,
      reuseExistingServer: !process.env.CI,
      env: { VITE_API_BASE_URL: BACKEND_URL },
    },
    {
      command: `"${backendPython}" "${managePy}" runserver localhost:8001`,
      url: `${BACKEND_URL}/`,
      reuseExistingServer: !process.env.CI,
      env: {
        DJANGO_SECRET_KEY: "e2e-test-secret-not-for-production",
        DEBUG: "1",
        SQLITE_DB_NAME: "e2e.sqlite3",
      },
    },
  ],
});
