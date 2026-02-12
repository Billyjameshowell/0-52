import { Redis } from "@upstash/redis";

// Lazy init — only connect when env vars are present
let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  redis = new Redis({ url, token });
  return redis;
}

// Simple hash for IP (no PII stored)
function hashIP(ip: string): string {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    hash = ((hash << 5) - hash + ip.charCodeAt(i)) | 0;
  }
  return hash.toString(36);
}

export async function trackPhotoView(photoId: string, ip?: string) {
  const r = getRedis();
  if (!r) return;

  try {
    // Total views
    await r.incr(`photo:${photoId}:views`);
    
    // Unique views via HyperLogLog
    if (ip) {
      await r.pfadd(`photo:${photoId}:uniques`, hashIP(ip));
    }
  } catch (e) {
    console.error("Stats tracking error:", e);
  }
}

export async function getPhotoStats(photoId: string): Promise<{ views: number; uniques: number }> {
  const r = getRedis();
  if (!r) return { views: 0, uniques: 0 };

  try {
    const [views, uniques] = await Promise.all([
      r.get<number>(`photo:${photoId}:views`),
      r.pfcount(`photo:${photoId}:uniques`),
    ]);
    return { views: views ?? 0, uniques: uniques ?? 0 };
  } catch (e) {
    console.error("Stats fetch error:", e);
    return { views: 0, uniques: 0 };
  }
}

// Calculate current streak from posts
export function calculateStreak(weeks: number[], currentWeek: number): number {
  if (weeks.length === 0) return 0;
  
  const weekSet = new Set(weeks);
  let streak = 0;
  
  // Start from current week and count backwards
  for (let w = currentWeek; w >= 1; w--) {
    if (weekSet.has(w)) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

// Calculate longest streak ever
export function calculateLongestStreak(weeks: number[]): number {
  if (weeks.length === 0) return 0;
  
  const sorted = [...weeks].sort((a, b) => a - b);
  let longest = 1;
  let current = 1;
  
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i - 1] + 1) {
      current++;
      longest = Math.max(longest, current);
    } else if (sorted[i] !== sorted[i - 1]) {
      current = 1;
    }
  }
  
  return longest;
}

// Completion percentage
export function calculateCompletion(postCount: number, totalWeeks: number = 52): number {
  return Math.round((postCount / totalWeeks) * 100);
}
