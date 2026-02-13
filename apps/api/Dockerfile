# Build & run the Myri API (apps/api) as a single container
# Build context should be repo root.

FROM node:20-alpine AS base
WORKDIR /app

# Copy root workspace manifests
COPY package.json package-lock.json ./

# Copy API package manifest
COPY apps/api/package.json ./apps/api/package.json

# Install workspace deps
RUN npm ci

# Copy API source
COPY apps/api ./apps/api

# Generate Prisma client (requires schema only; no DB connection)
RUN cd apps/api && npx prisma generate

EXPOSE 4001

ENV NODE_ENV=production
CMD ["node", "apps/api/src/index.js"]
