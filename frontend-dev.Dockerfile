# Use Node image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY ./frontend/package.json ./frontend/package-lock.json ./
RUN npm install

# Copy the rest of the app
COPY ./frontend ./

# Expose Vite's dev server port
EXPOSE 5173

# Run the dev server
CMD ["npm", "run", "dev", "--", "--host"]
