import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const skip = (page - 1) * limit;

    const query = searchParams.get("q");

    const userId = searchParams.get("userId");

    const sortByDate = searchParams.get("sortByDate");
    const sortByLikes = searchParams.get("sortByLikes");
    const sortByComments = searchParams.get("sortByComments");

    let orderBy = {};
    let where: any = {};

    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { problem: { contains: query, mode: "insensitive" } },
      ];
    }

    if (userId) {
      where.userId = userId;
    }

    // Apply sorting
    if (sortByDate === "newest") {
      orderBy = { createdAt: "desc" };
    } else if (sortByDate === "oldest") {
      orderBy = { createdAt: "asc" };
    } else if (sortByLikes === "most") {
      orderBy = { likes: { _count: "desc" } };
    } else if (sortByLikes === "least") {
      orderBy = { likes: { _count: "asc" } };
    } else if (sortByComments === "most") {
      orderBy = { comments: { _count: "desc" } };
    } else if (sortByComments === "least") {
      orderBy = { comments: { _count: "asc" } };
    } else {
      orderBy = { createdAt: "desc" };
    }

    const ideas = await prisma.idea.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        comments: true,
        likes: true,
      },
    });

    const totalIdeas = await prisma.idea.count({ where });
    const totalPages = Math.ceil(totalIdeas / limit);

    return NextResponse.json(
      {
        data: ideas,
        meta: { total: totalIdeas, page, limit, totalPages },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch ideas" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, problem, description, imageUrl } = await req.json();

    if (!title || !problem || !description || !imageUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const idea = await prisma.idea.create({
      data: {
        title,
        problem,
        description,
        imageUrl,
        userId: session.user.id,
      },
    });

    return NextResponse.json(idea, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create idea" },
      { status: 500 }
    );
  }
}
