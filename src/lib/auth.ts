import { cookies } from "next/headers";

export type SessionUser = {
  handle: string;
  displayName: string;
};

const COOKIE_NAME = "oneper_user";

export function normalizeHandle(input: string) {
  const raw = input.trim();
  const beforeAt = raw.includes("@") ? raw.split("@")[0] : raw;
  return beforeAt
    .toLowerCase()
    .replace(/[^a-z0-9_\-]/g, "")
    .slice(0, 24);
}

export function devLoginHandleFromEnv() {
  const env = process.env.DEV_LOGIN;
  if (!env) return null;
  if (env === "0" || env.toLowerCase() === "false") return null;
  if (env === "1" || env.toLowerCase() === "true") return "dev";
  return normalizeHandle(env) || "dev";
}

export function encodeUserCookie(user: SessionUser) {
  // Not a security boundary; this is for dev-mode UX only.
  return Buffer.from(JSON.stringify(user), "utf8").toString("base64url");
}

export function decodeUserCookie(value: string): SessionUser | null {
  try {
    const json = Buffer.from(value, "base64url").toString("utf8");
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed.handle !== "string") return null;
    const handle = normalizeHandle(parsed.handle);
    if (!handle) return null;
    return {
      handle,
      displayName:
        typeof parsed.displayName === "string" && parsed.displayName.trim()
          ? parsed.displayName.trim().slice(0, 64)
          : handle,
    };
  } catch {
    return null;
  }
}

export async function getServerUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const c = jar.get(COOKIE_NAME);
  if (!c?.value) return null;
  return decodeUserCookie(c.value);
}

export function makeDevUser(handle: string): SessionUser {
  return { handle, displayName: handle };
}

export const AUTH_COOKIE_NAME = COOKIE_NAME;
