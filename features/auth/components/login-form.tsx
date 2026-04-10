"use client";

import { useActionState } from "react";
import { initialAuthState } from "@/features/auth/services/types";
import { login, loginWithGoogle } from "@/features/auth/services/login-actions";

export default function LoginForm() {
  const [state, loginAction, pending] = useActionState(login, initialAuthState);

  return (
    <div className="space-y-3">
      <form
        action={loginAction}
        className="space-y-4 rounded-xl border border-black/10 p-6"
      >
        <input
          name="email"
          type="email"
          required
          className="w-full rounded border px-3 py-2"
        />
        <input
          name="password"
          type="password"
          required
          className="w-full rounded border px-3 py-2"
        />
        <button
          disabled={pending}
          className="w-full rounded bg-black px-4 py-2 text-white"
        >
          {pending ? "Accesso..." : "Login"}
        </button>
        {state.error ? (
          <p className="text-sm text-red-600">{state.error}</p>
        ) : null}
      </form>

      <form action={loginWithGoogle}>
        <button
          type="submit"
          className="w-full rounded border border-black/20 px-4 py-2"
        >
          Continua con Google
        </button>
      </form>
    </div>
  );
}
