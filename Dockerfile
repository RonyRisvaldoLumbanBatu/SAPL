
# Stage 1: Build the Frontend
FROM node:18-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Setup the Backend
FROM node:18-alpine
WORKDIR /app

# Install backend dependencies
COPY package*.json ./
RUN npm install

# Copy backend source code
COPY . .

# Copy built frontend from Stage 1
COPY --from=client-build /app/client/dist ./client/dist

# Ensure the upload directory exists
RUN mkdir -p client/public/images

# Expose port
EXPOSE 3000

# Start command
CMD ["node", "server.js"]
