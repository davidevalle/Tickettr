# Tickettr Production Checklist

## Required env vars
- `DATABASE_URL`
- `TOKEN`
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

## Discord scopes and permissions
- OAuth2 scopes: `bot applications.commands`
- Bot permissions: Manage Channels, View Channels, Send Messages, Read Message History, Embed Links
- Enable privileged intents: Server Members + Message Content

## Operations
- Enable daily Postgres backups and test restore monthly.
- Keep transcript retention policy aligned with your legal requirements.
- Send logs to a centralized sink (pino-compatible collector).
- Monitor `/api/health` and `/api/ready` endpoints.
- Rotate Discord/OAuth secrets regularly.
