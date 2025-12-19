FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code (will be overridden by volume mount for dev)
COPY . .

# Expose port
EXPOSE 4200

# Start dev server with hot reload
CMD ["npm", "run", "dev"]
