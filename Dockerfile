# Step 1: Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

# Step 2: Production Stage
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN yarn install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["yarn", "run", "start:prod"]
