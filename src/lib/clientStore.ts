"use client";

import type { WeeklyPost } from "@/lib/types";
import { clampWeek } from "@/lib/weeks";

const KEY = "oneper_posts_v2"; // bumped version for year support

function safeParse(json: string | null): WeeklyPost[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    // Migrate old posts without year to current year
    const currentYear = new Date().getFullYear();
    return parsed.filter(Boolean).map((p: WeeklyPost) => ({
      ...p,
      year: p.year ?? currentYear,
    })) as WeeklyPost[];
  } catch {
    return [];
  }
}

export function loadAllPosts(): WeeklyPost[] {
  return safeParse(globalThis.localStorage?.getItem(KEY) ?? null);
}

export function saveAllPosts(posts: WeeklyPost[]) {
  globalThis.localStorage?.setItem(KEY, JSON.stringify(posts));
}

export function upsertWeeklyPost(input: {
  handle: string;
  year: number;
  week: number;
  imageDataUrl: string;
  caption?: string;
}): WeeklyPost {
  const year = input.year;
  const week = clampWeek(input.week);
  const now = new Date().toISOString();
  const posts = loadAllPosts();
  const existingIdx = posts.findIndex(
    (p) => p.handle === input.handle && p.year === year && p.week === week,
  );

  if (existingIdx >= 0) {
    const updated: WeeklyPost = {
      ...posts[existingIdx],
      imageDataUrl: input.imageDataUrl,
      caption: input.caption,
      updatedAt: now,
    };
    posts[existingIdx] = updated;
    saveAllPosts(posts);
    return updated;
  }

  const created: WeeklyPost = {
    id: `${input.handle}:${year}:${week}`,
    handle: input.handle,
    year,
    week,
    imageDataUrl: input.imageDataUrl,
    caption: input.caption,
    createdAt: now,
    updatedAt: now,
  };
  posts.push(created);
  saveAllPosts(posts);
  return created;
}

export function getUserPosts(handle: string, year?: number): WeeklyPost[] {
  const all = loadAllPosts().filter((p) => p.handle === handle);
  if (year !== undefined) {
    return all.filter((p) => p.year === year).sort((a, b) => a.week - b.week);
  }
  return all.sort((a, b) => a.week - b.week);
}

export function getUserYears(handle: string): number[] {
  const posts = loadAllPosts().filter((p) => p.handle === handle);
  const years = [...new Set(posts.map((p) => p.year))];
  return years.sort((a, b) => b - a); // newest first
}

export function getGlobalFeed(): WeeklyPost[] {
  return loadAllPosts().sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}
