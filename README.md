# Project Setup Guide

## Running the Backend and Frontend

You need to run the backend and frontend in separate terminals. Follow the steps below to set up and start both.

### Backend (Django)

> **Note:** Use a virtual environment (`venv`) for best practice.


#### Installation (Run once)
```sh
pip install django
pip install djangorestframework
pip install djangorestframework-simplejwt
pip install psycopg2-binary
python3 manage.py migrate
```

#### Running server
```sh
python3 manage.py runserver
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
