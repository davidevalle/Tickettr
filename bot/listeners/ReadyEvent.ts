import { Listener } from "@sapphire/framework";
import { Client } from "discord.js";
import { logger } from "../lib/logger";

export default class ReadyEvent extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, { ...options, event: "ready", once: true });
  }

  public run(client: Client<true>) {
    client.user.setActivity("Tickettr support");
    logger.info({ user: client.user.tag }, "Bot ready");
  }
}
