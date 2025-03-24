# frontend.Dockerfile
FROM node:18

WORKDIR /app

COPY frontend/ /app/

RUN npm install
RUN npm run build

# Optional: Serve the build with a static server like `serve`
RUN npm install -g serve
CMD ["serve", "-s", "build", "-l", "3000"]