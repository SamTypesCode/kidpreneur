import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function POST(req: NextRequest) {
  try {
    const session = await auth(); // Get the session using auth()

    // 1. Check if the user is authenticated.
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. The request body needs to contain the ideaId and the comment content.
    const { ideaId, content } = await req.json();

    // 3. Validate that both required fields are provided.
    if (!ideaId || !content) {
      return NextResponse.json(
        { error: "ideaId and content are required" },
        { status: 400 }
      );
    }

    // 4. Use Prisma to create a new 'Comment' record.
    // The userId is taken from the authenticated session.
    const newComment = await prisma.comment.create({
      data: {
        content,
        ideaId,
        userId: session.user.id,
      },
    });

    // 5. Return the newly created comment.
    return NextResponse.json(newComment, { status: 201 });
  } catch (err) {
    // We are now safely checking the type of 'err'
    if (err instanceof PrismaClientKnownRequestError) {
      // You can add more specific Prisma error handling here if needed
      // For comments, a unique constraint error is less likely unless you add one
    }

    // Handle other errors
    console.error("Error adding comment:", err);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}
