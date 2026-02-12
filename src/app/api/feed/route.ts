import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/feed - Get global feed (recent posts)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limitStr = searchParams.get("limit");
  const limit = limitStr ? Math.min(50, parseInt(limitStr)) : 20;

  const posts = await prisma.weeklyPost.findMany({
    take: limit,
    orderBy: { updatedAt: "desc" },
    include: {
      user: {
        select: { handle: true, displayName: true },
      },
    },
  });

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
    })),
  });
}
