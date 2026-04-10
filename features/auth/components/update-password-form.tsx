"use client";

import { useActionState } from "react";
import { initialAuthState } from "@/features/auth/services/types";
import { updatePassword } from "@/features/auth/services/update-password-actions";

export default function UpdatePasswordForm() {
  const [state, formAction, pending] = useActionState(
    updatePassword,
    initialAuthState,
  );

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-xl border border-black/10 p-6"
    >
      <div className="space-y-1">
        <label htmlFor="new-password" className="text-sm font-medium">
          Nuova password
        </label>
        <input
          id="new-password"
          name="password"
          type="password"
          required
          className="w-full rounded-lg border border-black/15 px-3 py-2"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="confirm-password" className="text-sm font-medium">
          Conferma password
        </label>
        <input
          id="confirm-password"
          name="confirmPassword"
          type="password"
          required
          className="w-full rounded-lg border border-black/15 px-3 py-2"
        />
      </div>

      <button
        disabled={pending}
        className="w-full rounded-lg bg-black px-4 py-2 text-white"
      >
        {pending ? "Aggiornamento..." : "Aggiorna password"}
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
