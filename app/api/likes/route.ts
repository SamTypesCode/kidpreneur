import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

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
  } catch (err: any) {
    console.error("Error toggling like:", err);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}
