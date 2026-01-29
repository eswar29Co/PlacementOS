# Production Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install backend dependencies
COPY backend-pos/package*.json ./backend-pos/
RUN cd backend-pos && npm install

# Copy backend source
COPY backend-pos/ ./backend-pos/
RUN cd backend-pos && npm run build

# Install frontend dependencies
COPY frontend-pos/package*.json ./frontend-pos/
RUN cd frontend-pos && npm install

# Copy frontend source
COPY frontend-pos/ ./frontend-pos/
# Note: VITE_API_BASE_URL will be set via build-arg or env
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN cd frontend-pos && npm run build

# Final Runtime Stage
FROM node:20-alpine

WORKDIR /app

# Install Nginx
RUN apk add --no-cache nginx

# Copy built backend
COPY --from=builder /app/backend-pos/dist ./backend-pos/dist
COPY --from=builder /app/backend-pos/node_modules ./backend-pos/node_modules
COPY --from=builder /app/backend-pos/package.json ./backend-pos/package.json

# Copy built frontend to nginx public dir
COPY --from=builder /app/frontend-pos/dist /usr/share/nginx/html

# Replace default nginx config
COPY deployment/aws/nginx.conf /etc/nginx/http.d/default.conf

# Start script
COPY deployment/aws/start.sh .
RUN chmod +x start.sh

EXPOSE 80

CMD ["./start.sh"]
