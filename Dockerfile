FROM node:20-alpine

WORKDIR /app

# Create assets directory for uploaded files
RUN mkdir -p /app/assets

COPY package*.json ./

# Install all dependencies including devDependencies for build
RUN npm install --include=dev

COPY . .

# Build the frontend for production
RUN npm run build

# Remove devDependencies after build to reduce image size
RUN npm prune --production

# Expose the server port (Render uses PORT env var)
EXPOSE 5174

# Volume for persistent asset storage
VOLUME ["/app/assets"]

# Run production server
CMD ["npm", "run", "start"]
