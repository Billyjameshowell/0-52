import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/feed - Get global feed (recent posts)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limitStr = searchParams.get("limit");
  const limit = limitStr ? Math.min(50, parseInt(limitStr)) : 20;
  const currentYear = new Date().getFullYear();

  const posts = await prisma.weeklyPost.findMany({
    take: limit,
    orderBy: { updatedAt: "desc" },
    include: {
      user: {
        select: { handle: true, displayName: true },
      },
    },
  });

  // Get unique user IDs from posts
  const userIds = [...new Set(posts.map((p) => p.userId))];

  // Get post counts for current year for each user
  const userProgress = await prisma.weeklyPost.groupBy({
    by: ["userId"],
    where: {
      userId: { in: userIds },
      year: currentYear,
    },
    _count: { id: true },
  });

  const progressMap = new Map(
    userProgress.map((u) => [u.userId, u._count.id])
  );

  return NextResponse.json({
    posts: posts.map((p) => ({
      id: p.id,
      handle: p.user.handle,
      year: p.year,
      week: p.week,
      imageUrl: p.imageUrl,
      caption: p.caption,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      userProgress: progressMap.get(p.userId) ?? 0,
    })),
  });
}
