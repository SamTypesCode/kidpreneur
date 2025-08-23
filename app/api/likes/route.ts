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

    const { ideaId } = await req.json();

    if (!ideaId) {
      return NextResponse.json(
        { error: "ideaId is required" },
        { status: 400 }
      );
    }

    const newLike = await prisma.like.create({
      data: {
        ideaId,
        userId: session.user.id,
      },
    });

    return NextResponse.json(newLike, { status: 201 });
  } catch (err) {
    // We are now safely checking the type of 'err'
    if (err instanceof PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json(
        { error: "User has already liked this idea" },
        { status: 409 }
      );
    }

    // Handle other errors
    console.error("Error adding like:", err);
    return NextResponse.json({ error: "Failed to add like" }, { status: 500 });
  }
}
