FROM node:22-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY . .
USER appuser
EXPOSE 5000
CMD ["node", "src/server.js"]
