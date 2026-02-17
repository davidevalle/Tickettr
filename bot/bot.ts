import * as dotenv from "dotenv";
import TickettrClient from "./lib/Client";
import { logger } from "./lib/logger";

dotenv.config();

if (!process.env.TOKEN) {
  logger.error("Missing TOKEN env var.");
  process.exit(1);
}

export const client = new TickettrClient();
client.run().catch((error) => {
  logger.error({ err: error }, "Bot failed to start");
  process.exit(1);
});
