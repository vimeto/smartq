# FROM node:16-alpine AS deps

# RUN apk add --no-cache libc6-compat
# WORKDIR /app

# COPY package.json .
# COPY package-lock.json* .
# COPY . .
# RUN npm ci

# Rebuild the source code only when needed
#FROM node:16-alpine AS builder
#WORKDIR /app
#COPY --from=deps /app/node_modules ./node_modules
#
#RUN npm run build

FROM node:18 AS runner
WORKDIR /app

COPY . .
COPY package*.json ./
# COPY package-lock.json* .
RUN npm ci
# RUN ls -al

ENV NODE_ENV production

RUN npm run build

# RUN npx prisma migrate deploy

# RUN npm run seed

# RUN addgroup --system --gid 1001 nodejs
# RUN adduser --system --uid 1001 nextjs
#
# COPY --from=builder /app/public ./public
#
# COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
#
# USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["npm", "start"]
