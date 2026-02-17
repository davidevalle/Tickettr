import { SapphireClient } from "@sapphire/framework";
import { GatewayIntentBits, Partials } from "discord.js";
import { join } from "node:path";
import { logger } from "./logger";

export default class TickettrClient extends SapphireClient {
  public constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
      ],
      partials: [Partials.Channel, Partials.Message],
      baseUserDirectory: join(process.cwd(), "dist", "bot"),
      loadMessageCommandListeners: true,
      logger: { instance: logger as never },
    });
  }

  public run() {
    return this.login(process.env.TOKEN);
  }
}
