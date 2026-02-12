import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadImage, deleteImage, generateImageKey } from "@/lib/tigris";

// GET /api/posts - Get posts for a user
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const handle = searchParams.get("handle");
  const year = searchParams.get("year");

  if (!handle) {
    return NextResponse.json({ error: "Missing handle" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { handle },
    include: {
      posts: year
        ? { where: { year: parseInt(year) }, orderBy: { week: "asc" } }
        : { orderBy: [{ year: "desc" }, { week: "asc" }] },
    },
  });

  if (!user) {
    return NextResponse.json({ posts: [], years: [] });
  }

  // Get all years with posts
  const yearsResult = await prisma.weeklyPost.groupBy({
    by: ["year"],
    where: { userId: user.id },
    orderBy: { year: "desc" },
  });
  const years = yearsResult.map((y) => y.year);

  return NextResponse.json({
    posts: user.posts.map((p) => ({
      id: p.id,
      handle: user.handle,
      year: p.year,
      week: p.week,
      imageUrl: p.imageUrl,
      caption: p.caption,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    })),
    years,
  });
}

// POST /api/posts - Create or update a post
export async function POST(req: Request) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const yearStr = formData.get("year") as string;
  const weekStr = formData.get("week") as string;
  const imageFile = formData.get("image") as File | null;
  const caption = formData.get("caption") as string | null;

  const year = parseInt(yearStr);
  const week = parseInt(weekStr);

  if (!year || !week || week < 1 || week > 52) {
    return NextResponse.json({ error: "Invalid year or week" }, { status: 400 });
  }

  if (!imageFile) {
    return NextResponse.json({ error: "Missing image" }, { status: 400 });
  }

  // Get or create user in DB
  let dbUser = await prisma.user.findUnique({ where: { handle: user.handle } });
  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        handle: user.handle,
        displayName: user.displayName,
      },
    });
  }

  // Check for existing post (to delete old image)
  const existingPost = await prisma.weeklyPost.findUnique({
    where: {
      userId_year_week: {
        userId: dbUser.id,
        year,
        week,
      },
    },
  });

  // Delete old image if exists
  if (existingPost?.imageKey) {
    try {
      await deleteImage(existingPost.imageKey);
    } catch (e) {
      console.error("Failed to delete old image:", e);
    }
  }

  // Upload new image to Tigris
  const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
  const imageKey = generateImageKey(user.handle, year, week);
  const imageUrl = await uploadImage(imageKey, imageBuffer, imageFile.type || "image/jpeg");

  // Upsert post in database
  const post = await prisma.weeklyPost.upsert({
    where: {
      userId_year_week: {
        userId: dbUser.id,
        year,
        week,
      },
    },
    create: {
      userId: dbUser.id,
      year,
      week,
      imageKey,
      imageUrl,
      caption: caption || undefined,
    },
    update: {
      imageKey,
      imageUrl,
      caption: caption || undefined,
    },
  });

  return NextResponse.json({
    post: {
      id: post.id,
      handle: user.handle,
      year: post.year,
      week: post.week,
      imageUrl: post.imageUrl,
      caption: post.caption,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    },
  });
}
