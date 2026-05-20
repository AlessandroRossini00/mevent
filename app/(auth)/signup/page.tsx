import SignupForm from "@/features/auth/components/signup-form";

export default function PageSignup() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <SignupForm />
      </div>
    </main>
  );
}
