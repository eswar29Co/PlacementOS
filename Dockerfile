# Build stage for Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
# Copy package files first for better caching
COPY frontend-pos/package*.json ./
RUN npm ci
# Copy source and build
COPY frontend-pos/ ./
# Set production environment variables for build
ENV VITE_API_BASE_URL=/api/v1
ENV VITE_ENV=production
RUN npm run build

# Build stage for Backend
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
# Copy package files
COPY backend-pos/package*.json ./
RUN npm ci
# Copy source and build
COPY backend-pos/ ./
RUN npm run build
# Remove dev dependencies to save space
RUN npm prune --production

# Final stage
FROM node:20-alpine
WORKDIR /app

# Copy built backend
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY --from=backend-builder /app/backend/package*.json ./

# Copy built frontend to a public folder that backend will serve
COPY --from=frontend-builder /app/frontend/dist ./public

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Railway will provide the PORT environment variable
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
