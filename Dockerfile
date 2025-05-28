## Build stage
FROM node:20-alpine as builder
# Set working directory
WORKDIR /app
# Copy package files
COPY package*.json ./
# Install dependencies
RUN npm install
# Copy source code
COPY . .
# Build the application
RUN npm run build


## Production stage
FROM node:20-alpine
# Set working directory
WORKDIR /app
# Copy package files
COPY package*.json ./
# Install only production dependencies
RUN npm install --only=production
# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist
COPY .env .env

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]