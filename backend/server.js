const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const db = require('./config/db'); // Pattern 1: Singleton
const { loggerMiddleware } = require('./middleware/loggerMiddleware'); // Pattern 2: Middleware

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(loggerMiddleware); // log every request

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/income', require('./routes/incomeRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

if (require.main === module) {
  db.connect(); // Pattern 1: Singleton connect
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
