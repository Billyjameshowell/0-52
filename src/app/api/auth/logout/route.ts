import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  // Build redirect URL from headers (Fly proxy sets these correctly)
  const headersList = await headers();
  const host = headersList.get("host") ?? headersList.get("x-forwarded-host") ?? "oneper.fly.dev";
  const proto = headersList.get("x-forwarded-proto") ?? "https";
  const redirectUrl = `${proto}://${host}/login`;

  const res = NextResponse.redirect(redirectUrl);
  res.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: proto === "https",
    path: "/",
    maxAge: 0,
  });
  return res;
}
