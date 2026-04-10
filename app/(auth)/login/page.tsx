import LoginForm from "@/features/auth/components/login-form";
import { Button } from "@radix-ui/themes";
import { redirect } from "next/navigation";
import Link from "next/link";

export default function PageLogin() {
  return (
    <div className="w-full h-full">
      <LoginForm />
      <Link href="/signup">
        <Button variant="soft" className="w-full">
          Vai alla registrazione
        </Button>
      </Link>
    </div>
  );
}
