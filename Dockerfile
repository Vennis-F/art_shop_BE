# Stage 1: Build application
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install all dependencies (including devDependencies for build tools)
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the application (output to dist/)
RUN npm run build

# Stage 2: Run application
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the built application and production dependencies from the builder stage
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Set the environment to production
ENV NODE_ENV=production

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/main"]
