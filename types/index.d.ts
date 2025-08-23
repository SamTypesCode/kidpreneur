interface Idea {
  id: number;
  title: string;
  problem: string;
  description: string;
  user: { name: string };
  comments: { id: number; content: string }[];
  likes: { id: number }[];
}
