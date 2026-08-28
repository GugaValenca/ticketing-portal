import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export const E2E_USERNAME = "e2e_user";
export const E2E_PASSWORD = "E2E-test-password-1";

const backendDir = path.resolve(dirname, "../../backend");
const backendPython =
  process.platform === "win32"
    ? path.join(backendDir, ".venv/Scripts/python.exe")
    : path.join(backendDir, ".venv/bin/python");

const env = {
  ...process.env,
  DJANGO_SECRET_KEY: "e2e-test-secret-not-for-production",
  DEBUG: "1",
  SQLITE_DB_NAME: "e2e.sqlite3",
  E2E_USERNAME,
  E2E_PASSWORD,
};

/** Runs migrations and creates the deterministic e2e user against the
 * disposable e2e.sqlite3 database, independent of whatever server process
 * has that file open (both just read/write the same sqlite file). */
export function seedE2eDatabase() {
  const run = (args: string[]) =>
    execFileSync(backendPython, ["manage.py", ...args], {
      cwd: backendDir,
      env,
      stdio: "inherit",
    });

  run(["migrate", "--noinput"]);
  run(["e2e_seed"]);
}
