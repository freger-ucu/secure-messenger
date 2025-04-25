# Project Setup Guide

## Running with Docker
```sh
docker compose -f FILENAME.yml up --build
```
> for development use docker-compose-dev as FILENAME, for production use docker-compose-prod as FILENAME.

### Running dbshell in docker (after running docker-compose)
```sh
docker-compose -f docker-compose-dev.yml exec backend bash
apt-get update && apt-get install -y postgresql-client
py manage.py dbshell
````
## .env files for development

### .env in root
```sh
POSTGRES_DB=messenger
POSTGRES_USER=messenger
POSTGRES_PASSWORD=development
DB_USER=messenger
DB_PASSWORD=development
DB_HOST=db
DB_PORT=5432
````

### backend/.env
```sh
DB_NAME=messenger
DB_USER=messenger
DB_PASSWORD=development
DB_HOST=db
DB_PORT=5432
```

### frontend/.env
```sh
VITE_API_URL=localhost:8000
```

## Running the Backend and Frontend separately

You need to run the backend and frontend in separate terminals. Follow the steps below to set up and start both.

### Backend (Django)

> **Note:** Use a virtual environment (`venv`) for best practice.


#### Installation (Run once)
```sh
pip3 install -r requirements.txt
python3 manage.py migrate
```


#### Running server
```sh
daphne backend.asgi:application
```

### Frontend (React):
##### 📥 Installation
**Clone the repository:**
```sh
git https://github.com/freger-ucu/secure-messenger/tree/develop
cd secure-mesenger/frontend
```

**Since we are actively changing our dependency list on frontend, please, commit 2 steps below before each frontend start**
#### Install dependencies:
```sh
npm install
```
#### 🔧 Running the Development Server
Start the app in development mode:
```sh
npm run dev
```

The app will be running at http://localhost:5173/ by default.


### Database (PostgreSQL):
Macos setup
```sh
brew install postgresql@17
brew services start postgresql@17
```
> **For windows:** https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
```sh
psql -U postgres
CREATE DATABASE messenger;
CREATE USER messenger WITH PASSWORD 'development';
GRANT ALL PRIVILEGES ON DATABASE messenger TO messenger;
ALTER DATABASE messenger OWNER TO messenger;
\q
```
Don't forget to
```sh
python3 manage.py migrate
```
