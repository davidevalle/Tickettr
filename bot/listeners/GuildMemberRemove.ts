import { Listener } from "@sapphire/framework";
import { GuildMember } from "discord.js";
import { prisma } from "../../src/lib/prisma";

export default class GuildMemberRemove extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, { ...options, event: "guildMemberRemove" });
  }

  public async run(member: GuildMember) {
    await prisma.ticket.updateMany({
      where: {
        guildId: member.guild.id,
        openerId: member.id,
        status: { in: ["OPEN", "CLAIMED"] },
      },
      data: { status: "CLOSED", closeReason: "User left guild", closedAt: new Date() },
    });
  }
}
