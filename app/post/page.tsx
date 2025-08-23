import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import PostForm from "./PostForm";

export default async function PostPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return <PostForm />;
}
