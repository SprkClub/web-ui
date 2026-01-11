# Dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
RUN apk add --no-cache python3 make g++ linux-headers eudev-dev
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app

# --- Build-time Args for Next.js Frontend ---
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_PRIVY_APP_ID
ARG NEXT_PUBLIC_TWITTER_REDIRECT_URI

ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_PRIVY_APP_ID=$NEXT_PUBLIC_PRIVY_APP_ID
ENV NEXT_PUBLIC_TWITTER_REDIRECT_URI=$NEXT_PUBLIC_TWITTER_REDIRECT_URI
# --------------------------------------------

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma format && npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/prisma ./prisma

RUN mkdir -p /app/.next/cache/images && \
    chown -R nextjs:nodejs /app/.next/cache

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["npm", "run", "start"]