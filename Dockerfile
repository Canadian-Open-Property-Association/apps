FROM node:20-alpine

WORKDIR /app

# Create assets directory for uploaded files
RUN mkdir -p /app/assets

COPY package*.json ./
RUN npm install

COPY . .

# Expose Vite dev server and proxy server ports
EXPOSE 5173 5174

# Volume for persistent asset storage
VOLUME ["/app/assets"]

CMD ["npm", "run", "dev"]
