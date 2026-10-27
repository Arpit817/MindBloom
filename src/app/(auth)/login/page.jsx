// Server Component wrapper — handles metadata export
import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "Log In",
  description: "Log in to your MindBloom account.",
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
