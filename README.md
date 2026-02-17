# Tickettr

Tickettr is a production-ready Discord ticket bot (Discord.js + Sapphire) with a Next.js dashboard and Prisma/PostgreSQL storage.

## Prerequisites
- Node.js 20+
- npm 10+
- Docker + Docker Compose (recommended)
- A Discord application (bot + OAuth2)

## Environment variables
1. Copy `.env.example` to `.env`
2. Fill in all secrets:
   - `TOKEN`: Discord bot token
   - `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET`: OAuth2 app credentials
   - `DATABASE_URL`: Postgres connection string
   - `NEXTAUTH_SECRET`: random 32+ char secret

## Discord application setup
1. Create an app in Discord Developer Portal.
2. Add bot intents: **Server Members** and **Message Content**.
3. OAuth2 redirect URL: `http://localhost:3000/api/auth/callback/discord` (and production URL equivalent).
4. Bot scopes: `bot applications.commands`
5. Suggested bot permissions: Manage Channels, View Channels, Send Messages, Read Message History, Embed Links.

## Local development
### Option A: Docker (one command)
```bash
docker compose up --build
```

### Option B: Native
```bash
npm install
npm run db:generate
npm run db:migrate
npm run dev      # web
npm run bot:dev  # bot in second terminal
```

## Core commands
- `/setup` — configure support role, panel channel, log channel, category
- `/update-settings` — update role/channel/category

## Production deployment
```bash
npm ci
npm run db:generate
npm run db:deploy
npm run build
npm run bot:build
npm run start    # web
npm run bot:start
```

For containerized deployment, use `docker compose up -d` with a managed Postgres instance and external reverse proxy (Nginx/Traefik/Caddy) terminating TLS.
