# Get NPM packages
FROM node:16-alpine AS dependencies
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM node:16-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN npm run build

# Production image, copy all the files and run next
FROM node:16-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S kth-user -u 1001

COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER kth-user


# FROM node:16-alpine
# COPY . .
# RUN npm install && npm run build

EXPOSE 8080

CMD ["npm", "start"]