import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import { ButtonInteraction } from "discord.js";
import { prisma } from "../../../src/lib/prisma";
import { canManageTicket, ticketButtons } from "../../lib/ticket-utils";

export default class ClaimTicketHandler extends InteractionHandler {
  public constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
    super(ctx, { ...options, interactionHandlerType: InteractionHandlerTypes.MessageComponent });
  }

  public override parse(interaction: ButtonInteraction) {
    return interaction.customId === "ticket-claim" ? this.some() : this.none();
  }

  public async run(interaction: ButtonInteraction) {
    const ticket = await prisma.ticket.findUnique({ where: { channelId: interaction.channelId } });
    if (!ticket) return interaction.reply({ content: "Ticket not found.", ephemeral: true });

    const config = await prisma.guildConfig.findUnique({ where: { guildId: interaction.guildId! } });
    if (!config) return interaction.reply({ content: "Guild config missing. Run /setup.", ephemeral: true });

    const member = await interaction.guild!.members.fetch(interaction.user.id);
    if (!canManageTicket(member, config.supportRoleId)) {
      return interaction.reply({ content: "Only support staff can claim/unclaim tickets.", ephemeral: true });
    }

    const unclaim = ticket.claimedById === interaction.user.id;
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { claimedById: unclaim ? null : interaction.user.id, status: unclaim ? "OPEN" : "CLAIMED" },
    });

    const msg = interaction.message;
    if (msg.editable) {
      await msg.edit({ components: [ticketButtons(!unclaim)] });
    }

    await interaction.reply({ content: unclaim ? "Ticket unclaimed." : `Ticket claimed by ${interaction.user}.`, ephemeral: true });
  }
}
