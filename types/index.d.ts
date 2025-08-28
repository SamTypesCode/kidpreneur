interface User {
  id: string;
  name?: string | null;
  email: string;
  emailVerified?: string | null;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
  ideas?: Idea[];
  comments?: Comment[];
  likes?: Like[];
}

interface Like {
  id: number;
  ideaId: number;
  userId: string;
  createdAt: string;
  user?: User;
  idea?: Idea;
}

interface Comment {
  id: number;
  ideaId: number;
  content: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  idea?: Idea;
}

interface Idea {
  id: number;
  title: string;
  problem: string;
  description: string;
  imageUrl?: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  comments: Comment[];
  likes: Like[];
}
