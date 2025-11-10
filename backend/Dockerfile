# ---- Builder stage ----
FROM node:20-alpine AS builder
RUN apk upgrade --no-cache
WORKDIR /app

ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy sources
COPY nest-cli.json tsconfig*.json ./
COPY prisma ./prisma
COPY src ./src
COPY scripts ./scripts

# Build and generate Prisma client
RUN npm run build
RUN npm prune --omit=dev
RUN npm run prisma:generate

# ---- Runner stage ----
FROM node:20-alpine AS runner
RUN apk upgrade --no-cache
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/scripts ./scripts

EXPOSE 4000
CMD ["node", "dist/main.js"]

