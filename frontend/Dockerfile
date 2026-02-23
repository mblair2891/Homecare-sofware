# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY frontend/package*.json ./
RUN npm install --omit=dev
EXPOSE 3000
ENV PORT=3000
CMD ["npm", "start"]
