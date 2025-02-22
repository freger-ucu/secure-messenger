# Project Setup Guide

## Running the Backend and Frontend

You need to run the backend and frontend in separate terminals. Follow the steps below to set up and start both.

### Backend (Django)

> **Note:** Use a virtual environment (`venv`) for best practice.


#### Installation (Run once)
```sh
pip install django
pip install djangorestframework
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
