import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import { ButtonInteraction, ChannelType, EmbedBuilder } from "discord.js";
import { prisma } from "../../../src/lib/prisma";
import { canManageTicket, saveTranscript } from "../../lib/ticket-utils";

export default class CloseTicketHandler extends InteractionHandler {
  public constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
    super(ctx, { ...options, interactionHandlerType: InteractionHandlerTypes.MessageComponent });
  }

  public override parse(interaction: ButtonInteraction) {
    return interaction.customId === "ticket-close" ? this.some() : this.none();
  }

  public async run(interaction: ButtonInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const ticket = await prisma.ticket.findUnique({ where: { channelId: interaction.channelId } });
    if (!ticket) return interaction.editReply("Ticket not found in database.");

    const config = await prisma.guildConfig.findUnique({ where: { guildId: interaction.guildId! } });
    if (!config) return interaction.editReply("Guild config missing. Run /setup.");

    const member = await interaction.guild!.members.fetch(interaction.user.id);
    const isOpener = ticket.openerId === interaction.user.id;
    if (!isOpener && !canManageTicket(member, config.supportRoleId)) {
      return interaction.editReply("Only the ticket opener or support staff can close this ticket.");
    }

    if (interaction.channel?.type !== ChannelType.GuildText) {
      return interaction.editReply("Invalid ticket channel type.");
    }

    const transcriptCount = await saveTranscript(interaction.channel, ticket.id);
    const updated = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status: "CLOSED",
        closedAt: new Date(),
        claimedById: null,
        closeReason: `Closed by ${interaction.user.tag}`,
      },
    });

    if (config.logChannelId) {
      const logChannel = await interaction.guild!.channels.fetch(config.logChannelId);
      if (logChannel?.isTextBased()) {
        const embed = new EmbedBuilder()
          .setTitle("Ticket closed")
          .setDescription(`Ticket <#${updated.channelId}> closed by ${interaction.user}.`)
          .addFields({ name: "Messages archived", value: String(transcriptCount), inline: true });
        await logChannel.send({ embeds: [embed] });
      }
    }

    await interaction.editReply("Ticket closed and transcript saved.");
    await interaction.channel.delete("Ticket closed");
  }
}
