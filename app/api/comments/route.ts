import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ideaId, content } = await req.json();

    if (!ideaId || !content) {
      return NextResponse.json(
        { error: "ideaId and content are required" },
        { status: 400 }
      );
    }

    const newComment = await prisma.comment.create({
      data: {
        content,
        ideaId,
        userId: session.user.id,
      },
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === "P2003") {
        return NextResponse.json({ error: "Idea not found" }, { status: 404 });
      }

      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    console.error("Error adding comment:", err);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}
