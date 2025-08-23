// app/api/ideas/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; // Importing the auth function

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Pagination and Limit
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const skip = (page - 1) * limit;

    // Search query
    const query = searchParams.get("q");

    // Sorting
    const sortByDate = searchParams.get("sortByDate");
    const sortByLikes = searchParams.get("sortByLikes");
    const sortByComments = searchParams.get("sortByComments");

    let orderBy = {};
    let where = {};

    // Apply search filter
    if (query) {
      where = {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { problem: { contains: query, mode: "insensitive" } },
        ],
      };
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

    // Fetch ideas from the database with pagination, sorting, and filtering
    const ideas = await prisma.idea.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
        comments: true,
        likes: true,
      },
    });

    // Also get the total count for pagination metadata
    const totalIdeas = await prisma.idea.count({ where });
    const totalPages = Math.ceil(totalIdeas / limit);

    return NextResponse.json(
      {
        data: ideas,
        meta: {
          total: totalIdeas,
          page: page,
          limit: limit,
          totalPages: totalPages,
        },
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
    const session = await auth(); // Use auth() to get the session
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, problem, description } = await req.json();

    if (!title || !problem || !description) {
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
