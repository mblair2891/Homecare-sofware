# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
ARG VITE_API_URL=https://backend-service-production-524b.up.railway.app
ENV VITE_API_URL=$VITE_API_URL
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
