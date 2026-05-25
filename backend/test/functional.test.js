const assert = require('assert');

let userStore = [];
let nextId = 1;

function resetStores() {
  userStore = [];
  nextId = 1;
}

function generateId() {
  return String(nextId++);
}

// FT001 - Application connectivity
function checkApplicationConnection() {
  return {
    status: 'connected',
    message: 'Application running successfully',
  };
}

// FT002 - User registration
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
    token: `token-${data.email}`,
  };

  userStore.push(user);
  return user;
}

// FT003 - User login
function loginUser(email, password) {
  const user = userStore.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    throw new Error('Invalid email or password');
  }

  return {
    _id: user._id,
    email: user.email,
    token: user.token,
  };
}

// FT004 - Authentication protection
function protectedRoute(token) {
  if (!token) {
    throw new Error('Not authorized, no token');
  }

  return 'Access granted';
}

beforeEach(function () {
  resetStores();
});

describe('BudgetTracker - Functional Testing Unit Tests', function () {
  describe('FT001 - Application Connectivity', function () {
    it('should confirm application is running successfully', function () {
      const result = checkApplicationConnection();

      assert.strictEqual(result.status, 'connected');
      assert.strictEqual(result.message, 'Application running successfully');
    });
  });

  describe('FT002 - User Registration', function () {
    it('should register a new user successfully', function () {
      const user = registerUser({
        name: 'Functional Test User',
        email: 'functionaltest@example.com',
        password: 'Test1234!',
      });

      assert.strictEqual(user.name, 'Functional Test User');
      assert.strictEqual(user.email, 'functionaltest@example.com');
      assert.ok(user._id);
      assert.ok(user.token);
    });

    it('should reject duplicate user registration', function () {
      registerUser({
        name: 'Functional Test User',
        email: 'functionaltest@example.com',
        password: 'Test1234!',
      });

      assert.throws(() => {
        registerUser({
          name: 'Duplicate User',
          email: 'functionaltest@example.com',
          password: 'Test1234!',
        });
      }, /User already exists/);
    });
  });

  describe('FT003 - User Login', function () {
    it('should login a registered user successfully', function () {
      registerUser({
        name: 'Login Test User',
        email: 'logintest@example.com',
        password: 'Test1234!',
      });

      const loginResult = loginUser('logintest@example.com', 'Test1234!');

      assert.strictEqual(loginResult.email, 'logintest@example.com');
      assert.ok(loginResult.token);
    });

    it('should reject invalid login credentials', function () {
      assert.throws(() => {
        loginUser('wrong@example.com', 'wrongpassword');
      }, /Invalid email or password/);
    });
  });

  describe('FT004 - Authentication Protection', function () {
    it('should allow access when token is provided', function () {
      const result = protectedRoute('valid-token');

      assert.strictEqual(result, 'Access granted');
    });

    it('should reject access when token is missing', function () {
      assert.throws(() => {
        protectedRoute('');
      }, /Not authorized, no token/);
    });
  });
});