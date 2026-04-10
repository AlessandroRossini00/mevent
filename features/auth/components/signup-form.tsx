"use client";

import { useActionState } from "react";
import { initialAuthState } from "@/features/auth/services/types";
import { signup } from "@/features/auth/services/signup-actions";

export default function SignupForm() {
  const [state, formAction, pending] = useActionState(signup, initialAuthState);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-xl border border-black/10 p-6"
    >
      <div className="space-y-1">
        <label htmlFor="signup-email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="signup-email"
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-black/15 px-3 py-2"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="signup-password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="signup-password"
          name="password"
          type="password"
          required
          className="w-full rounded-lg border border-black/15 px-3 py-2"
        />
      </div>

      <button
        disabled={pending}
        className="w-full rounded-lg border border-black/20 px-4 py-2"
      >
        {pending ? "Registrazione..." : "Sign up"}
      </button>

      {state.error ? (
        <p className="text-sm text-red-600">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-green-700">{state.success}</p>
      ) : null}
    </form>
  );
}
