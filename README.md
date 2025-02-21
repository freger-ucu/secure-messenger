# Project Setup Guide

## Running the Backend and Frontend

You need to run the backend and frontend in separate terminals. Follow the steps below to set up and start both.

### Backend (Django)

> **Note:** Use a virtual environment (`venv`) for best practice.

#### Installation (Run once)
```sh
pip install django
python3 manage.py migrate
```

#### Running server
```sh
python3 manage.py runserver
```

### Frontend (React):
#### Installation (Run once)
```sh
npm i
```

#### Running server
```sh
npm run dev
```
