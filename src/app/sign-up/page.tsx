import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";

export default function SignUpPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <Suspense fallback={null}>
        <AuthForm mode="sign-up" />
      </Suspense>
    </main>
  );
}
