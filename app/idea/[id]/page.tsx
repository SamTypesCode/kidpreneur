import type { Comment as PrismaComment } from "@prisma/client";
import { prisma } from "@/lib/prisma";

interface IdeaPageProps {
  params: { id: string };
}

export default async function IdeaPage({ params }: IdeaPageProps) {
  const { id } = await params;

  const idea = await prisma.idea.findUnique({
    where: { id: parseInt(id) },
    include: {
      user: true,
      comments: true,
      likes: true,
    },
  });

  if (!idea) return <p>Idea not found</p>;

  return (
    <div>
      <img src={idea.imageUrl ?? undefined} alt="idea cover image" />

      <h1>{idea.title}</h1>
      <p>{idea.problem}</p>
      <p>{idea.description}</p>

      <h3>Author:</h3>
      <p>{idea.user.name}</p>

      <h3>Comments ({idea.comments.length}):</h3>
      {idea.comments.map((c: PrismaComment) => (
        <p key={c.id}>{c.content}</p>
      ))}

      <h3>Likes:</h3>
      <p>{idea.likes.length}</p>
    </div>
  );
}
