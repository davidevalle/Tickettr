import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface DiscordGuild {
  id: string;
  name: string;
  permissions: string;
}

function canManageGuild(permissions: string) {
  const perms = BigInt(permissions);
  return (perms & BigInt(0x20)) === BigInt(0x20) || (perms & BigInt(0x8)) === BigInt(0x8);
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    redirect("/auth/login");
  }

  const guilds = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: { Authorization: `Bearer ${session.accessToken}` },
    cache: "no-store",
  }).then((res) => (res.ok ? (res.json() as Promise<DiscordGuild[]>) : []));

  const manageable = guilds.filter((guild) => canManageGuild(guild.permissions));
  const configs = await prisma.guildConfig.findMany({
    where: { guildId: { in: manageable.map((guild) => guild.id) } },
    select: { guildId: true },
  });
  const configuredGuildIds = new Set(configs.map((config) => config.guildId));

  return (
    <main className="mx-auto min-h-screen max-w-5xl p-6">
      <h1 className="text-3xl font-bold">Your Guilds</h1>
      <p className="mb-6 text-slate-500">Select a guild where you can manage Tickettr settings.</p>
      <div className="grid gap-3">
        {manageable.map((guild) => (
          <article key={guild.id} className="rounded-lg border p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{guild.name}</h2>
                <p className="text-xs text-slate-500">ID: {guild.id}</p>
                <p className="mt-1 text-xs">
                  {configuredGuildIds.has(guild.id) ? (
                    <span className="text-emerald-600">Configured</span>
                  ) : (
                    <span className="text-amber-600">Not configured</span>
                  )}
                </p>
              </div>
              <Link href={`/dashboard/${guild.id}`} className="rounded-md border px-3 py-2 text-sm hover:bg-slate-50">
                Open settings
              </Link>
            </div>
          </article>
        ))}
        {manageable.length === 0 ? <p>No manageable guilds found.</p> : null}
      </div>
    </main>
  );
}
