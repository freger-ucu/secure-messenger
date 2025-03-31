# frontend.Dockerfile
FROM node:18

WORKDIR /app

COPY frontend/ /app

RUN npm install
CMD ["npm", "run", "dev"]