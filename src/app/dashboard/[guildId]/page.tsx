import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import GuildSettingsForm from "./settings-form";

export default async function GuildSettingsPage({ params }: { params: { guildId: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    redirect("/auth/login");
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl p-6">
      <h1 className="text-2xl font-bold">Guild Settings</h1>
      <p className="mb-4 text-sm text-slate-500">Configure Tickettr for guild {params.guildId}.</p>
      <GuildSettingsForm guildId={params.guildId} />
    </main>
  );
}
