import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  Guild,
  GuildMember,
  PermissionFlagsBits,
  TextChannel,
  User,
} from "discord.js";
import { prisma } from "../../src/lib/prisma";

export async function ensureGuildConfig(guild: Guild) {
  return prisma.guildConfig.findUnique({ where: { guildId: guild.id } });
}

export async function ensureUser(discordId: string, username?: string) {
  return prisma.user.upsert({
    where: { discordId },
    update: { username },
    create: { discordId, username },
  });
}

export function ticketButtons(claimed = false) {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("ticket-claim").setLabel(claimed ? "Unclaim" : "Claim").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("ticket-close").setLabel("Close").setStyle(ButtonStyle.Danger),
  );
}

export function canManageTicket(member: GuildMember, supportRoleId: string) {
  return member.permissions.has(PermissionFlagsBits.ManageChannels) || member.roles.cache.has(supportRoleId);
}

export async function createTicketChannel(guild: Guild, user: User, supportRoleId: string, categoryId?: string | null) {
  return guild.channels.create({
    name: `ticket-${user.username.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20) || user.id}`,
    type: ChannelType.GuildText,
    parent: categoryId ?? undefined,
    permissionOverwrites: [
      { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
      { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
      { id: supportRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
      {
        id: guild.members.me!.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ManageChannels,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      },
    ],
  });
}

export async function saveTranscript(channel: TextChannel, ticketId: string) {
  const allMessages = [];
  let lastMessageId: string | undefined;

  while (allMessages.length < 1000) {
    const batch = await channel.messages.fetch({ limit: 100, before: lastMessageId });
    if (!batch.size) break;

    const values = [...batch.values()];
    allMessages.push(...values);
    lastMessageId = values[values.length - 1]?.id;

    if (batch.size < 100) break;
  }

  const sorted = allMessages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

  await prisma.ticketMessage.createMany({
    data: sorted.map((message) => ({
      ticketId,
      authorId: message.author.id,
      authorName: message.author.username,
      authorIcon: message.author.displayAvatarURL(),
      content: message.cleanContent || "(attachment/empty message)",
      createdAt: message.createdAt,
    })),
  });

  return sorted.length;
}

export function ticketCreatedEmbed(user: User) {
  return new EmbedBuilder()
    .setTitle("Ticket opened")
    .setDescription("A staff member will be with you soon. Use the buttons to manage this ticket.")
    .setThumbnail(user.displayAvatarURL())
    .setColor(0x5865f2);
}
