# Stage 1: Build the app
FROM node:18-alpine AS builder

WORKDIR /app

# Copy only necessary files for installing dependencies
COPY package*.json ./

# Install dependencies (will NOT copy node_modules to next stage)
RUN npm install

# Copy all files except those in .dockerignore (like node_modules)
COPY . .

# Build the Next.js app
RUN npm run build

# Stage 2: Serve the app
FROM node:18-alpine AS runner

WORKDIR /app

# Only copy the necessary output from the build stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules  
COPY --from=builder /app/next.config.ts ./next.config.ts

# Set environment to production
ENV NODE_ENV=production

# Expose the port the app runs on
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
