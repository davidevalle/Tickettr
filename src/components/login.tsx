"use client";

import { signIn } from "next-auth/react";

export function Login() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-slate-100">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <img src="/logo.png" alt="Tickettr logo" className="mb-6 h-10 w-auto" />
        <h1 className="text-2xl font-semibold">Sign in to Tickettr Dashboard</h1>
        <p className="mt-2 text-sm text-slate-300">Use your Discord account to continue.</p>
        <button
          type="button"
          onClick={() => signIn("discord")}
          className="mt-6 w-full rounded-md bg-indigo-500 px-4 py-2 font-medium hover:bg-indigo-400"
        >
          Continue with Discord
        </button>
      </section>
    </main>
  );
}
