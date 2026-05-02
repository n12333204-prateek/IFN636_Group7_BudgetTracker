# BudgetTracker

A full-stack personal finance management application that helps users track expenses, income, and budgets, all in one place. Built with Node.js, React.js, and MongoDB, and deployed on AWS EC2 with an automated CI/CD pipeline using GitHub Actions.

---

## Live Application

**Public URL:** http://54.206.146.40

| Role  | Email                     | Password   |
|-------|---------------------------|------------|
| Admin | admin@budgettracker.com   | Admin1234! |

Register a new account to access the user dashboard, or use the admin credentials above to access the admin panel.

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-----------------------------------  |
| Frontend    | React.js                            |
| Backend     | Node.js                             |
| Database    | MongoDB Atlas                       |
| Auth        | JSON Web Tokens (JWT)               |
| Web Server  | Nginx                               |
| Process     | pm2                                 |
| CI/CD       | GitHub Actions (self-hosted runner) |
| Cloud       | AWS EC2 (Ubuntu 24.04, t3.medium)   |

---

## Project Structure

```
BudgetTracker/
|──.github/
|    └── workflows/
|        └── ci.yml        # GitHub Actions pipeline
|── backend/
    |── config/            # Database config file
|   |── controllers/       # Route logic for each feature
|   |── models/            # Mongoose schemas
|   |── routes/            # Express route definitions
|   |── middleware/        # JWT auth middleware
|   |── test/              # Mocha test files
|   |── server.js          # App entry point
|── frontend/
    |── src/
    |   |── components/    # Reusable UI components
    |   |── pages/         # Page-level components
    |   |── axiosConfig.jsx # Axios base URL config
```

---

## Running Locally

### Prerequisites

Make sure you have the following installed:

- Node.js v22 or above
- npm and yarn
- MongoDB Atlas account (or local MongoDB)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/n12333204-prateek/BudgetTracker.git
cd BudgetTracker
```

### 2. Set Up the Backend

```bash
cd backend
```

Create a `.env` file in the `backend/` folder:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5001
```

Install dependencies and start the server:

```bash
yarn install
node server.js
```

The backend will run on `http://localhost:5001`

### 3. Seed the Admin User

```bash
node createAdmin.js
```

This creates the default admin account in the database.

### 4. Set Up the Frontend

Open a new terminal:

```bash
cd frontend
yarn install
yarn start
```

The frontend will run on `http://localhost:3000`

### 5. Log In

| Role  | Email                   | Password   |
|-------|-------------------------|------------|
| Admin | admin@budgettracker.com | Admin1234! |

Or register a new user account from the app.

---

## Running Tests

Tests are written using Mocha and cover CRUD operations for the Expenses feature.

```bash
cd backend
npm test
```

You should see all tests passing in the terminal output.

---

## CI/CD Pipeline

Every push to the `main` branch automatically triggers the GitHub Actions pipeline. Here is what it does, step by step:

1. **Checkout Code** - pulls the latest code from the repository
2. **Setup Node.js** - configures Node.js v22 on the self-hosted runner
3. **Stop Running Services** - stops existing pm2 processes
4. **Install Backend Dependencies** - runs `yarn install` in the backend folder
5. **Install Frontend Dependencies and Build** - runs `yarn install` and `yarn build` in the frontend folder
6. **Run Backend Tests** - executes Mocha tests to verify backend functionality
7. **Create .env File** - writes production secrets from GitHub to a `.env` file on the server
8. **Start and Restart Services** - brings backend and frontend back online via pm2

The self-hosted runner is installed directly on the EC2 instance.

### GitHub Secrets Used

| Secret       | Description                          |
|--------------|--------------------------------------|
| MONGO_URI    | MongoDB Atlas connection string      |
| JWT_SECRET   | Secret key for JWT token signing     |
| PORT         | Backend port (5001)                  |
| PROD         | Full `.env` content for production   |
| EC2_HOST     | EC2 public IP address                |
| EC2_USERNAME | SSH username (ubuntu)                |
| EC2_SSH_KEY  | Private key for EC2 SSH access       |

---

## Deployment (AWS EC2)

The application is hosted on an AWS EC2 instance with the following setup:

- **Instance type:** t3.medium
- **OS:** Ubuntu 24.04 LTS
- **Region:** Asia Pacific - Sydney (ap-southeast-2)
- **Public IP:** 54.206.146.40 

Nginx acts as a reverse proxy, routing all browser traffic on port 80 to the React frontend and all `/api/` calls to the Node.js backend on port 5001.

pm2 keeps both the frontend and backend running as background processes, and automatically restarts them if they crash.

---

## Features

- User registration and login 
- Role-based access control (Admin and User roles)
- Track and manage personal expenses
- Track and manage income entries
- Set and monitor budgets
- Admin dashboard to manage all users
- Fully automated deployment on every push to main

---

## GitHub Repository

**Repo:** https://github.com/n12333204-prateek/BudgetTracker

- `main` branch - production-ready code
- Feature branches - one branch per feature, merged via pull requests
- JIRA keys included in commit messages (project key: PBT)

---
