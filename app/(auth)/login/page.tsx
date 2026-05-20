import LoginForm from "@/features/auth/components/login-form";

export default function PageLogin() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <LoginForm />
      </div>
    </main>
  );
}
