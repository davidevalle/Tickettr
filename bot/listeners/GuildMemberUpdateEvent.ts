import { Listener } from "@sapphire/framework";
import { GuildMember } from "discord.js";
import { prisma } from "../../src/lib/prisma";

export default class GuildMemberUpdateEvent extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, { ...options, event: "guildMemberUpdate" });
  }

  public async run(_oldMember: GuildMember, newMember: GuildMember) {
    await prisma.user.upsert({
      where: { discordId: newMember.id },
      update: { username: newMember.user.username },
      create: { discordId: newMember.id, username: newMember.user.username },
    });
  }
}
