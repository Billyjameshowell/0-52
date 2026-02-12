import { NextResponse } from "next/server";
import { headers } from "next/headers";
import {
  AUTH_COOKIE_NAME,
  encodeUserCookie,
  makeDevUser,
  normalizeHandle,
} from "@/lib/auth";

export async function POST(req: Request) {
  const form = await req.formData();
  const rawHandle = String(form.get("handle") ?? "").trim();
  const handle = normalizeHandle(rawHandle);
  
  if (!handle) {
    return NextResponse.json({ ok: false, error: "Missing or invalid handle" }, { status: 400 });
  }

  // Build redirect URL from headers (Fly proxy sets these correctly)
  const headersList = await headers();
  const host = headersList.get("host") ?? headersList.get("x-forwarded-host") ?? "oneper.fly.dev";
  const proto = headersList.get("x-forwarded-proto") ?? "https";
  const redirectUrl = `${proto}://${host}/u/${handle}`;

  const res = NextResponse.redirect(redirectUrl);
  res.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: encodeUserCookie(makeDevUser(handle)),
    httpOnly: true,
    sameSite: "lax",
    secure: proto === "https",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
