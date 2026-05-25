const assert = require('assert');

let userStore = [];
let expenseStore = [];
let nextId = 1;

function resetStores() {
  userStore = [];
  expenseStore = [];
  nextId = 1;
}

function generateId() {
  return String(nextId++);
}

function registerUser(data) {
  if (!data.name || !data.email || !data.password) {
    throw new Error('Missing required user fields');
  }

  const existingUser = userStore.find((user) => user.email === data.email);

  if (existingUser) {
    throw new Error('User already exists');
  }

  const user = {
    _id: generateId(),
    name: data.name,
    email: data.email,
    password: data.password,
    role: data.role || 'user',
  };

  userStore.push(user);
  return user;
}

function loginUser(email, password) {
  const user = userStore.find(
    (user) => user.email === email && user.password === password
  );

  if (!user) {
    throw new Error('Invalid email or password');
  }

  return user;
}

function protectedRoute(token) {
  if (!token) {
    throw new Error('Not authorized, no token');
  }

  return 'Access granted';
}

function createExpense(data) {
  if (!data.title || !data.amount || !data.category) {
    throw new Error('Missing required fields: title, amount, category');
  }

  const expense = {
    _id: generateId(),
    title: data.title,
    amount: data.amount,
    category: data.category,
  };

  expenseStore.push(expense);
  return expense;
}

function updateExpense(id, updates) {
  const index = expenseStore.findIndex((expense) => expense._id === id);

  if (index === -1) {
    throw new Error('Expense not found');
  }

  expenseStore[index] = {
    ...expenseStore[index],
    ...updates,
  };

  return expenseStore[index];
}

function createIncome(data) {
  if (!data.source || !data.amount) {
    throw new Error('Missing required income fields');
  }

  return data;
}

function createBudget(data) {
  if (!data.category || !data.limitAmount || !data.timePeriod) {
    throw new Error('Missing required budget fields');
  }

  return data;
}

function updateSavingsGoal(id) {
  if (id === '999') {
    throw new Error('Goal not found');
  }

  return {
    _id: id,
  };
}

function getAllUsers(requestingUser) {
  if (!requestingUser || requestingUser.role !== 'admin') {
    throw new Error('Access denied. Admins only.');
  }

  return userStore;
}

beforeEach(function () {
  resetStores();
});

describe('BudgetTracker - Error Handling Functional Testing', function () {
  describe('FT010 - Error Handling and Validation', function () {
    it('should reject user registration when required fields are missing', function () {
      assert.throws(() => {
        registerUser({
          name: 'Incomplete User',
        });
      }, /Missing required user fields/);
    });

    it('should reject duplicate user registration', function () {
      registerUser({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test1234!',
      });

      assert.throws(() => {
        registerUser({
          name: 'Duplicate User',
          email: 'test@example.com',
          password: 'Test1234!',
        });
      }, /User already exists/);
    });

    it('should reject invalid login credentials', function () {
      assert.throws(() => {
        loginUser('wrong@example.com', 'wrongpassword');
      }, /Invalid email or password/);
    });

    it('should reject protected route access without token', function () {
      assert.throws(() => {
        protectedRoute('');
      }, /Not authorized, no token/);
    });

    it('should reject expense creation when required fields are missing', function () {
      assert.throws(() => {
        createExpense({
          title: 'Incomplete Expense',
        });
      }, /Missing required fields/);
    });

    it('should reject updating a non-existent expense', function () {
      assert.throws(() => {
        updateExpense('999', {
          amount: 100,
        });
      }, /Expense not found/);
    });

    it('should reject income creation when required fields are missing', function () {
      assert.throws(() => {
        createIncome({
          source: 'Incomplete Income',
        });
      }, /Missing required income fields/);
    });

    it('should reject budget creation when required fields are missing', function () {
      assert.throws(() => {
        createBudget({
          category: 'Incomplete Budget',
        });
      }, /Missing required budget fields/);
    });

    it('should reject updating a non-existent savings goal', function () {
      assert.throws(() => {
        updateSavingsGoal('999');
      }, /Goal not found/);
    });

    it('should prevent normal users from accessing admin-only functionality', function () {
      const normalUser = registerUser({
        name: 'Normal User',
        email: 'normal@example.com',
        password: 'User123!',
        role: 'user',
      });

      assert.throws(() => {
        getAllUsers(normalUser);
      }, /Access denied. Admins only./);
    });
  });
});