import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

function canManageGuild(permissions: string) {
  const perms = BigInt(permissions);
  return (perms & BigInt(0x20)) === BigInt(0x20) || (perms & BigInt(0x8)) === BigInt(0x8);
}

async function verifyGuildAccess(guildId: string, accessToken: string) {
  const guilds = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  }).then((res) => (res.ok ? (res.json() as Promise<Array<{ id: string; permissions: string }>>) : []));

  return guilds.some((guild) => guild.id === guildId && canManageGuild(guild.permissions));
}

function cleanOptionalId(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function GET(_: NextRequest, { params }: { params: { guildId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = checkRateLimit(`${session.user.id}:guild-settings:get`, 30, 60_000);
  if (!limit.allowed) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  const allowed = await verifyGuildAccess(params.guildId, session.accessToken);
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const config = await prisma.guildConfig.findUnique({ where: { guildId: params.guildId } });
  return NextResponse.json({ config });
}

export async function PUT(request: NextRequest, { params }: { params: { guildId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = checkRateLimit(`${session.user.id}:guild-settings:put`, 10, 60_000);
  if (!limit.allowed) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  const allowed = await verifyGuildAccess(params.guildId, session.accessToken);
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const payload = (await request.json()) as {
    supportRoleId?: string;
    logChannelId?: string;
    panelChannelId?: string;
    ticketCategoryId?: string;
  };

  const supportRoleId = cleanOptionalId(payload.supportRoleId);
  if (!supportRoleId || supportRoleId.length < 5) {
    return NextResponse.json({ error: "supportRoleId is required" }, { status: 400 });
  }

  const updated = await prisma.guildConfig.upsert({
    where: { guildId: params.guildId },
    update: {
      supportRoleId,
      logChannelId: cleanOptionalId(payload.logChannelId),
      panelChannelId: cleanOptionalId(payload.panelChannelId),
      ticketCategoryId: cleanOptionalId(payload.ticketCategoryId),
    },
    create: {
      guildId: params.guildId,
      supportRoleId,
      logChannelId: cleanOptionalId(payload.logChannelId),
      panelChannelId: cleanOptionalId(payload.panelChannelId),
      ticketCategoryId: cleanOptionalId(payload.ticketCategoryId),
    },
  });

  return NextResponse.json({ config: updated });
}
