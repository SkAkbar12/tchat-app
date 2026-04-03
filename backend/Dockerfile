# Use Node.js
FROM node:18

WORKDIR /app

# Copy backend files
COPY package*.json ./
RUN npm install

COPY . .

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "server.js"]