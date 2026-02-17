import { ApplicationCommandRegistry, ChatInputCommand, Command } from "@sapphire/framework";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { prisma } from "../../../src/lib/prisma";

export class SetUpCommand extends Command {
  public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName("setup")
        .setDescription("Configure Tickettr in this server")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addRoleOption((option) => option.setName("support-role").setDescription("Role that can manage tickets").setRequired(true))
        .addChannelOption((option) =>
          option
            .setName("log-channel")
            .setDescription("Channel for ticket audit logs")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true),
        )
        .addChannelOption((option) =>
          option
            .setName("panel-channel")
            .setDescription("Channel where the ticket panel should be posted")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true),
        )
        .addChannelOption((option) =>
          option
            .setName("ticket-category")
            .setDescription("Optional category for ticket channels")
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(false),
        ),
    );
  }

  public async chatInputRun(interaction: ChatInputCommand.Interaction) {
    const supportRole = interaction.options.getRole("support-role", true);
    const logChannel = interaction.options.getChannel("log-channel", true);
    const panelChannel = interaction.options.getChannel("panel-channel", true);
    const category = interaction.options.getChannel("ticket-category");

    await prisma.guildConfig.upsert({
      where: { guildId: interaction.guildId! },
      update: {
        supportRoleId: supportRole.id,
        logChannelId: logChannel.id,
        panelChannelId: panelChannel.id,
        ticketCategoryId: category?.id,
      },
      create: {
        guildId: interaction.guildId!,
        supportRoleId: supportRole.id,
        logChannelId: logChannel.id,
        panelChannelId: panelChannel.id,
        ticketCategoryId: category?.id,
      },
    });

    const panelEmbed = new EmbedBuilder()
      .setTitle("Tickettr Support")
      .setDescription("Press the button below to create a support ticket.")
      .setColor(0x5865f2);
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId("create-ticket").setLabel("Create Ticket").setStyle(ButtonStyle.Primary),
    );

    if (panelChannel.isTextBased()) {
      await panelChannel.send({ embeds: [panelEmbed], components: [row] });
    }

    await interaction.reply({ content: "Tickettr setup complete.", ephemeral: true });
  }
}
