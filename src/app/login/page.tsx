import Link from "next/link";
import { devLoginHandleFromEnv, getServerUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const user = await getServerUser();
  if (user) redirect(`/u/${user.handle}`);

  const dev = devLoginHandleFromEnv();
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold tracking-tight">0/52</h1>
      <p className="mt-2 text-sm text-zinc-600">
        {dev
          ? "DEV_LOGIN is enabled; you should already be logged in."
          : "Dev login (no passwords). Pick a handle to continue."}
      </p>

      {!dev && (
        <form
          className="mt-6 space-y-3"
          action="/api/auth/login"
          method="post"
        >
          <label className="block">
            <span className="text-sm font-medium">Handle</span>
            <input
              name="handle"
              autoComplete="username"
              placeholder="user52"
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-black/10"
            />
          </label>
          <button className="w-full rounded-lg bg-black px-3 py-2 text-white">
            Continue
          </button>
        </form>
      )}

      <div className="mt-8 text-sm">
        <Link className="underline" href="/feed">
          Continue without logging in
        </Link>
      </div>
    </div>
  );
}
