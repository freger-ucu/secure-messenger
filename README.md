# Secure Messenger

Secure Messenger is a web-based chat application that focuses on end-to-end encryption and real-time communication. The backend is built with **Django** and **Django Channels** while the frontend uses **React** + **Vite**. Messages are encrypted client-side using AES and a symmetric key that is exchanged via RSA. Each chat has its own symmetric key which is encrypted for each participant using their public key.

## Features
- User registration and login.
- Account restoration with a seed phrase.
- Generation and storage of RSA key pairs.
- Create one-to-one chats and exchange AES encrypted messages via WebSocket.
- Fetch chat history and contacts through the REST API.
- Dockerized development and production environments.

## Project Structure
- `backend/` – Django project providing the REST API, WebSocket consumers and encryption key management.
- `frontend/` – React application communicating with the backend API.
- `docker-compose-dev.yml`/`docker-compose-prod.yml` – containers for local development or production deployment.

## Running with Docker
```sh
docker compose -f FILENAME.yml up --build
```
For development use `docker-compose-dev.yml`, for production use `docker-compose-prod.yml`.

### Running `dbshell` in docker (after running docker-compose)
```sh
docker-compose -f docker-compose-dev.yml exec backend bash
apt-get update && apt-get install -y postgresql-client
py manage.py dbshell
```

## .env files for development

### Root `.env`
```sh
POSTGRES_DB=messenger
POSTGRES_USER=messenger
POSTGRES_PASSWORD=development
DB_USER=messenger
DB_PASSWORD=development
DB_HOST=db
DB_PORT=5432
```

### `backend/.env`
```sh
DB_NAME=messenger
DB_USER=messenger
DB_PASSWORD=development
DB_HOST=db
DB_PORT=5432
API_BASE_URL=localhost
DJANGO_SECRET_KEY=unsafe-dev-secret
DJANGO_DEBUG=True
```

### `frontend/.env`
```sh
VITE_API_URL=localhost:8000
```

## Running the Backend and Frontend separately
Use separate terminals for backend and frontend. Example commands below.

### Backend (Django)
> **Note:** Use a virtual environment (`venv`) for best practice.

#### Installation (run once)
```sh
pip3 install -r requirements.txt
python3 manage.py migrate
```

#### Running the server
```sh
daphne backend.asgi:application
```

### Frontend (React)
Clone the repo and install dependencies:
```sh
git clone https://github.com/freger-ucu/secure-messenger
cd secure-messenger/frontend
npm install
```

Start the development server:
```sh
npm run dev
```
The app will be running at http://localhost:5173/ by default.
**Run `npm install` each time before starting the frontend to ensure dependencies are up to date.**

### Database (PostgreSQL)
MacOS setup example:
```sh
brew install postgresql@17
brew services start postgresql@17
```
For Windows installers see [enterprisedb.com](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads).

Create development database and user:
```sh
psql -U postgres
CREATE DATABASE messenger;
CREATE USER messenger WITH PASSWORD 'development';
GRANT ALL PRIVILEGES ON DATABASE messenger TO messenger;
ALTER DATABASE messenger OWNER TO messenger;
\q
```
Don't forget to run migrations:
```sh
python3 manage.py migrate
```
