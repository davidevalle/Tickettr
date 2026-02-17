import { ApplicationCommandRegistry, ChatInputCommand, Command } from "@sapphire/framework";
import { ChannelType, PermissionFlagsBits } from "discord.js";
import { prisma } from "../../../src/lib/prisma";

export class UpdateSettingsCommand extends Command {
  public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName("update-settings")
        .setDescription("Update Tickettr guild settings")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addRoleOption((option) => option.setName("support-role").setDescription("Support role").setRequired(false))
        .addChannelOption((option) =>
          option.setName("log-channel").setDescription("Log channel").addChannelTypes(ChannelType.GuildText).setRequired(false),
        )
        .addChannelOption((option) =>
          option
            .setName("ticket-category")
            .setDescription("Ticket channel category")
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(false),
        ),
    );
  }

  public async chatInputRun(interaction: ChatInputCommand.Interaction) {
    const supportRole = interaction.options.getRole("support-role");
    const logChannel = interaction.options.getChannel("log-channel");
    const ticketCategory = interaction.options.getChannel("ticket-category");

    await prisma.guildConfig.update({
      where: { guildId: interaction.guildId! },
      data: {
        supportRoleId: supportRole?.id,
        logChannelId: logChannel?.id,
        ticketCategoryId: ticketCategory?.id,
      },
    });

    await interaction.reply({ content: "Settings updated.", ephemeral: true });
  }
}
