FROM node:18-alpine

WORKDIR /app

# Copy package.json files for workspace setup
COPY package.json .
COPY packages/backend/package.json ./packages/backend/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN yarn install

# Copy source code
COPY packages/backend ./packages/backend
COPY packages/shared ./packages/shared

# Build shared package
RUN yarn workspace @carental/shared build

# Expose port
EXPOSE 3000

# Start the application
CMD ["yarn", "workspace", "@carental/backend", "start"]