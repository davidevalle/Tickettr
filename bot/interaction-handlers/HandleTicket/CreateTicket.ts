import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import { ButtonInteraction } from "discord.js";
import { prisma } from "../../../src/lib/prisma";
import { createTicketChannel, ensureGuildConfig, ensureUser, ticketButtons, ticketCreatedEmbed } from "../../lib/ticket-utils";

const createCooldown = new Map<string, number>();

export default class CreateTicketHandler extends InteractionHandler {
  public constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
    super(ctx, { ...options, interactionHandlerType: InteractionHandlerTypes.MessageComponent });
  }

  public override parse(interaction: ButtonInteraction) {
    return interaction.customId === "create-ticket" ? this.some() : this.none();
  }

  public async run(interaction: ButtonInteraction) {
    const cooldownKey = `${interaction.guildId}:${interaction.user.id}`;
    const now = Date.now();
    const cooldownEnd = createCooldown.get(cooldownKey) ?? 0;
    if (cooldownEnd > now) {
      const wait = Math.ceil((cooldownEnd - now) / 1000);
      return interaction.reply({ content: `Please wait ${wait}s before opening another ticket.`, ephemeral: true });
    }

    createCooldown.set(cooldownKey, now + 10_000);
    await interaction.deferReply({ ephemeral: true });

    const config = await ensureGuildConfig(interaction.guild!);
    if (!config) return interaction.editReply("Guild is not configured. Run /setup first.");

    const existing = await prisma.ticket.findFirst({
      where: { guildId: interaction.guildId!, openerId: interaction.user.id, status: { in: ["OPEN", "CLAIMED"] } },
    });

    if (existing) {
      return interaction.editReply(`You already have an open ticket: <#${existing.channelId}>`);
    }

    await ensureUser(interaction.user.id, interaction.user.username);
    const channel = await createTicketChannel(interaction.guild!, interaction.user, config.supportRoleId, config.ticketCategoryId);

    const ticket = await prisma.ticket.create({
      data: {
        guildId: interaction.guildId!,
        channelId: channel.id,
        openerId: interaction.user.id,
        status: "OPEN",
      },
    });

    await channel.send({
      content: `${interaction.user} welcome! <@&${config.supportRoleId}>`,
      embeds: [ticketCreatedEmbed(interaction.user)],
      components: [ticketButtons()],
    });

    await interaction.editReply(`Ticket created: <#${ticket.channelId}>`);
  }
}
