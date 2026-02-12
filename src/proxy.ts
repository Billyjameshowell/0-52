import { NextResponse, type NextRequest } from "next/server";
import {
  AUTH_COOKIE_NAME,
  devLoginHandleFromEnv,
  encodeUserCookie,
  makeDevUser,
} from "./lib/auth";

export function proxy(req: NextRequest) {
  const devHandle = devLoginHandleFromEnv();
  if (!devHandle) return NextResponse.next();

  const res = NextResponse.next();
  const existing = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!existing) {
    res.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: encodeUserCookie(makeDevUser(devHandle)),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
