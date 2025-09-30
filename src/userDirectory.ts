import fs from "node:fs";
import path from "node:path";

export type UsernameToEmailIndex = Map<string, string>;

export function loadUserIndexFromFile(absoluteFilePath: string): UsernameToEmailIndex {
  const resolvedPath = path.resolve(absoluteFilePath);
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Users file not found at: ${resolvedPath}`);
  }

  const raw = fs.readFileSync(resolvedPath, "utf8");

  const usernameToEmail: UsernameToEmailIndex = new Map();

  for (const [lineNumber, rawLine] of raw.split("\n").entries()) {
    const line = rawLine.trim();
    if (!line) continue; // skip empty lines
    if (line.startsWith("#")) continue; // allow comment lines

    const parts = line.split(",");
    if (parts.length !== 2) {
      // Malformed line; skip it safely
      continue;
    }

    const [usernameRaw, emailRaw] = parts as [string, string];
    const username = usernameRaw.trim();
    const email = emailRaw.trim();

    if (!username || !email) {
      continue;
    }

    // Basic sanity check; keep it simple for the demo
    const hasAt = email.includes("@");
    if (!hasAt) {
      continue;
    }

    // Normalize username to lowercase for case-insensitive matching
    usernameToEmail.set(username.toLowerCase(), email);
  }

  return usernameToEmail;
}

export function getEmailByUsername(
    username: string,
    index: Map<string, string>
  ): string | null {
    if (!username) return null;
    const normalized = username.trim().toLowerCase();
    if (!normalized) return null;
    return index.get(normalized) ?? null;
  }