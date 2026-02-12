"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getGlobalFeed } from "@/lib/clientStore";
import type { WeeklyPost } from "@/lib/types";
import { weekLabel } from "@/lib/weeks";

function Card({ post }: { post: WeeklyPost }) {
  return (
    <article className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <div className="aspect-video w-full bg-zinc-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.imageDataUrl}
          alt={`@${post.handle} week ${post.week}`}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="text-sm">
          <Link className="font-medium hover:underline" href={`/u/${post.handle}`}>
            @{post.handle}
          </Link>
          <span className="ml-2 text-zinc-400">·</span>
          <span className="ml-2 text-zinc-500">wk {weekLabel(post.week)}</span>
        </div>
        <time className="text-xs text-zinc-400">
          {new Date(post.updatedAt).toLocaleDateString()}
        </time>
      </div>
    </article>
  );
}

export default function FeedClient() {
  const [posts, setPosts] = useState<WeeklyPost[]>([]);

  useEffect(() => {
    setPosts(getGlobalFeed());
    const onStorage = () => setPosts(getGlobalFeed());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const empty = useMemo(() => posts.length === 0, [posts.length]);

  if (empty) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-600">
        No posts yet. Go to your profile and upload a week.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {posts.map((p) => (
        <Card key={p.id} post={p} />
      ))}
    </div>
  );
}
