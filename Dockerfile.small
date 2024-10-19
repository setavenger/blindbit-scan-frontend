# Install dependencies and build the application
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Disable Next.js telemetry
RUN npx next telemetry disable

# Install as CI does not have node_modules pre available
RUN npm install

# Build the application
RUN npm run build

# Remove development dependencies to reduce size
RUN npm prune --production

# Use a minimal base image for production
FROM node:18-alpine AS production

WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy only the necessary files from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Create a non-root user to run the app
RUN addgroup -g 1001 -S nodejs \
    && adduser -S nextjs -u 1001
USER nextjs

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]

