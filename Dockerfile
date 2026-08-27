FROM node:20-alpine AS base
# Pinned: an unpinned `npm install -g pnpm` grabs whatever is newest on the
# registry at build time, so the exact same commit can build fine one day and
# fail the next (frozen-lockfile validation drifted between pnpm 10 and 11).
# Matches the pnpm version pnpm-lock.yaml was actually generated with.
RUN npm install -g pnpm@10

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache libc6-compat
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN npm install sharp

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

RUN chown -R nextjs:nodejs ./node_modules

# Where lib/server/leadLog.ts appends the JSONL lead log. Must be a mounted
# volume (see docker-compose.yml) — anything else here is discarded on the
# next deploy, the exact problem this log exists to avoid.
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data
VOLUME /app/data

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
