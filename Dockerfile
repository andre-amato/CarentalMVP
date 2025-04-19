FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package.json ./
COPY packages/backend/package.json ./packages/backend/
COPY packages/shared/package.json ./packages/shared/

# Create the shared/dist directory (needed for TypeScript build)
RUN mkdir -p packages/shared/dist

# Install dependencies
RUN npm install

# Copy source code
COPY packages/backend ./packages/backend
COPY packages/shared ./packages/shared

# Build the shared package first
WORKDIR /app/packages/shared
RUN npm run build || echo "Shared package build failed but continuing"

# Go back to backend directory
WORKDIR /app/packages/backend
RUN npm run build



# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "run", "start"]