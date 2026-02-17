import Link from "next/link";

export function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between p-6">
        <img src="/logo.png" alt="Tickettr logo" className="h-10 w-auto" />
        <nav className="flex gap-3 text-sm">
          <Link href="/auth/login" className="rounded-md bg-indigo-500 px-4 py-2 font-medium hover:bg-indigo-400">Dashboard Login</Link>
        </nav>
      </header>
      <section className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 md:grid-cols-2 md:py-20">
        <div>
          <p className="mb-3 inline-block rounded-full bg-indigo-500/20 px-3 py-1 text-xs">Discord ticket bot + dashboard</p>
          <h1 className="text-4xl font-bold md:text-5xl">Reliable support workflows for Discord communities.</h1>
          <p className="mt-4 text-slate-300">Configure ticket roles, categories, transcripts, and audit logs with a production-ready bot and modern web dashboard.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="https://discord.com/oauth2/authorize?client_id=1223122315298996266&permissions=268446736&integration_type=0&scope=bot%20applications.commands" className="rounded-md bg-indigo-500 px-4 py-2 font-medium hover:bg-indigo-400">Add to Discord</Link>
            <Link href="https://github.com/davidevalle/Tickettr" className="rounded-md border border-slate-700 px-4 py-2">GitHub</Link>
          </div>
        </div>
        <div className="flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900 p-8">
          <img src="/transparant-logo.png" alt="Tickettr" className="h-64 w-auto" />
        </div>
      </section>
    </main>
  );
}
