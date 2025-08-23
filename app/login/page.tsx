import { signIn } from "@/lib/auth";

export default function LoginPage() {
  return (
    <div>
      <h1>Login</h1>

      <form
        action={async () => {
          "use server";
          await signIn("google");
        }}
      >
        <button type="submit">Sign in with Google</button>
      </form>

      <form
        action={async () => {
          "use server";
          await signIn("github");
        }}
      >
        <button type="submit">Sign in with GitHub</button>
      </form>
    </div>
  );
}
