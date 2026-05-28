# BudgetTracker

A full-stack personal finance management application that helps users track expenses, income, and budgets, all in one place. Built with Node.js, React.js, and MongoDB, and deployed on AWS EC2 with an automated CI/CD pipeline using GitHub Actions.

---

## Live Application

**Public URL:** http://15.135.198.102

| Role  | Email                     | Password   |
|-------|---------------------------|------------|
| Admin | admin@budgettracker.com   | Admin1234! |

Register a new account to access the user dashboard, or use the admin credentials above to access the admin panel.

---

## Tech Stack

| Layer         | Technology                          |
|---------------|-------------------------------------|
| Frontend      | React.js, Tailwind CSS              |
| Backend       | Node.js                             |
| Database      | MongoDB Atlas                       |
| Auth          | JSON Web Tokens (JWT)               |
| Web Server    | Nginx                               |
| Process       | pm2                                 |
| CI/CD         | GitHub Actions (self-hosted runner) |
| Cloud         | AWS EC2 (Ubuntu 24.04, t3.medium)   |
| Load Balancer | AWS Application Load Balancer       |
| Testing       | Mocha                               |

---

## Project Structure
```
BudgetTracker/
|-- .github/
|   +-- workflows/
|       +-- ci.yml
|-- backend/
|   |-- config/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- observers/
|   |-- repositories/
|   |-- routes/
|   |-- services/
|   |-- test/
|   +-- server.js
|-- frontend/
|   +-- src/
|       |-- components/
|       |-- context/
|       |-- pages/
|       +-- axiosConfig.jsx
+-- postman/
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
git clone https://github.com/n12333204-prateek/IFN636_Group7_BudgetTracker.git
cd IFN636_Group7_BudgetTracker
```

### 2. Set Up the Backend

```bash
cd backend
```

Create a `.env` file in the `backend/` folder:
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5001
SERVER_NAME=server-1

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

To point the frontend at your local backend, update the baseURL in `frontend/src/axiosConfig.jsx`:

```js
baseURL: 'http://localhost:5001'
```

### 5. Log In

| Role  | Email                   | Password   |
|-------|-------------------------|------------|
| Admin | admin@budgettracker.com | Admin1234! |

Or register a new user account from the app.

---

## Running Tests

Tests are written using Mocha and cover all backend functionality across 8 test files: expenses, income, budgets, savings goals, admin, profile, functional flows, and error handling.

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

| Secret     | Description                        |
|------------|------------------------------------|
| MONGO_URI  | MongoDB Atlas connection string    |
| JWT_SECRET | Secret key for JWT token signing   |
| PORT       | Backend port (5001)                |
| PROD       | Full `.env` content for production |

---

## Deployment (AWS EC2)

The application is hosted on an AWS EC2 instance with the following setup:

- **Instance type:** t3.medium
- **OS:** Ubuntu 24.04 LTS
- **Region:** Asia Pacific - Sydney (ap-southeast-2)
- **Public IP:** 15.135.198.102

Nginx acts as a reverse proxy, routing all browser traffic on port 80 to the React frontend and all `/api/` calls to the Node.js backend on port 5001.

pm2 keeps both the frontend and backend running as background processes, and automatically restarts them if they crash.

---

## Load Balancing

The application is deployed across two EC2 instances behind an AWS Application Load Balancer for high availability.

| Component      | Detail                                                   |
|----------------|----------------------------------------------------------|
| EC2 Instance 1 | http://15.135.198.102                                    |
| EC2 Instance 2 | http://13.54.12.249                                      |
| Target Group   | BTKBudget, HTTP port 80                                  |
| ALB DNS        | BTKBalancer-717050348.ap-southeast-2.elb.amazonaws.com   |
| Region         | ap-southeast-2 (Sydney)                                  |

Traffic distribution is confirmed using the health check endpoint:

```bash
curl http://BTKBalancer-717050348.ap-southeast-2.elb.amazonaws.com/api/health
```

Responses alternate between `server-1` and `server-2` confirming round-robin distribution.

---

## Design Patterns

Five design patterns are implemented in the backend:

| Pattern                             | File                                        |
|-------------------------------------|---------------------------------------------|
| Singleton                           | `backend/config/db.js`                      |
| Middleware (Chain of Responsibility)| `backend/middleware/loggerMiddleware.js`     |
| Repository                          | `backend/repositories/BaseRepository.js`   |
| Observer                            | `backend/observers/BudgetSubject.js`        |
| Facade                              | `backend/services/BudgetService.js`         |

OOP principles (encapsulation, abstraction, inheritance, polymorphism) are demonstrated through the same pattern code. `BaseRepository` is the parent class extended by `ExpenseRepository`, `IncomeRepository`, and `BudgetRepository`.

---

## Features

- User registration and login
- Role-based access control (Admin and User roles)
- Track and manage personal expenses, linked automatically to budget categories
- Track and manage income entries with frequency classification
- Set and monitor spending budgets with real-time alerts at 80% and 100% of the limit
- Savings goals with contribution tracking and progress bar
- Dashboard with financial summary, budget health overview, and savings preview
- Admin dashboard to manage all users
- Pagination on all list pages
- Fully automated deployment on every push to main

---

## GitHub Repository

**Repo:** https://github.com/n12333204-prateek/IFN636_Group7_BudgetTracker

| Branch                                  | Description                             |
|-----------------------------------------|-----------------------------------------|
| `main`                                  | Production, auto-deploys via CI/CD      |
| `feature/budget-alerts`                 | Budget alert feature                    |
| `feature/savings-goals`                 | Savings goals feature                   |
| `feature/app-improvements`              | UI/UX improvements                      |
| `feature/design-patterns-final`         | Design patterns and OOPS implementation |
| `feature/api-testing-postman-clean`     | Postman API testing collection          |
| `feature/functional-testing`            | Functional test cases                   |
| `docs/update-readme`                    | README update                           |

---

## Team

| Name                     | Student ID   |
|--------------------------|--------------|
| Prateek Shrishail Uppin  | n12333204    |
| Nithish Purushothaman    | n12325031    |
| Karol Bhandari           | n12568929    |
| Thrishika Rajappaji      | n12523020    |
