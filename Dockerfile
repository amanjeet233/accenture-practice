FROM node:22-bookworm-slim

# Install OpenJDK 21, Python, GCC for judge execution runtime
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    openjdk-21-jdk-headless \
    sqlite3 \
    python3 \
    gcc \
    g++ \
    curl \
    ca-certificates && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency specifications and Prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Copy full application codebase
COPY . .

# Build Next.js application
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Expose web server port
EXPOSE 3000
ENV PORT=3000

# Start production application server
CMD ["npm", "start"]
