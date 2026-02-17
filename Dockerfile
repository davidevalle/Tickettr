FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run db:generate && npm run build && npm run bot:build

FROM node:20-alpine AS web
WORKDIR /app
COPY --from=base /app /app
EXPOSE 3000
CMD ["npm", "run", "start"]

FROM node:20-alpine AS bot
WORKDIR /app
COPY --from=base /app /app
CMD ["npm", "run", "bot:start"]
