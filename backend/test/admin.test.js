const assert = require('assert');

let userStore = [];
let nextId = 1;

function resetUserStore() {
  userStore = [];
  nextId = 1;
}

function generateId() {
  return String(nextId++);
}

function createUser(data) {
  if (!data.name || !data.email || !data.password) {
    throw new Error('Missing required user fields');
  }

  const user = {
    _id: generateId(),
    name: data.name,
    email: data.email,
    password: data.password,
    role: data.role || 'user',
    isActive: data.isActive !== undefined ? data.isActive : true,
  };

  userStore.push(user);
  return user;
}

function adminLogin(email, password) {
  const admin = userStore.find(
    (user) =>
      user.email === email &&
      user.password === password &&
      user.role === 'admin'
  );

  if (!admin) {
    throw new Error('Invalid admin credentials');
  }

  return {
    _id: admin._id,
    email: admin.email,
    role: admin.role,
    token: `admin-token-${admin.email}`,
  };
}

function getAllUsers(requestingUser) {
  if (!requestingUser || requestingUser.role !== 'admin') {
    throw new Error('Access denied. Admins only.');
  }

  return userStore;
}

function updateUserStatus(userId, isActive, requestingUser) {
  if (!requestingUser || requestingUser.role !== 'admin') {
    throw new Error('Access denied. Admins only.');
  }

  const user = userStore.find((user) => user._id === userId);

  if (!user) {
    throw new Error('User not found');
  }

  user.isActive = isActive;
  return user;
}

function deleteUser(userId, requestingUser) {
  if (!requestingUser || requestingUser.role !== 'admin') {
    throw new Error('Access denied. Admins only.');
  }

  const index = userStore.findIndex((user) => user._id === userId);

  if (index === -1) {
    throw new Error('User not found');
  }

  return userStore.splice(index, 1)[0];
}

beforeEach(function () {
  resetUserStore();
});

describe('BudgetTracker - Admin Functional Testing', function () {
  describe('FT009 - Admin Operations', function () {
    it('should login admin user successfully', function () {
      createUser({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'Admin123!',
        role: 'admin',
      });

      const result = adminLogin('admin@example.com', 'Admin123!');

      assert.strictEqual(result.email, 'admin@example.com');
      assert.strictEqual(result.role, 'admin');
      assert.ok(result.token);
    });

    it('should reject invalid admin login credentials', function () {
      createUser({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'Admin123!',
        role: 'admin',
      });

      assert.throws(() => {
        adminLogin('admin@example.com', 'WrongPassword');
      }, /Invalid admin credentials/);
    });

    it('should allow admin to retrieve all users', function () {
      const admin = createUser({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'Admin123!',
        role: 'admin',
      });

      createUser({
        name: 'Normal User',
        email: 'user@example.com',
        password: 'User123!',
        role: 'user',
      });

      const users = getAllUsers(admin);

      assert.strictEqual(users.length, 2);
    });

    it('should prevent normal user from accessing admin user list', function () {
      const normalUser = createUser({
        name: 'Normal User',
        email: 'user@example.com',
        password: 'User123!',
        role: 'user',
      });

      assert.throws(() => {
        getAllUsers(normalUser);
      }, /Access denied. Admins only./);
    });

    it('should allow admin to deactivate a user', function () {
      const admin = createUser({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'Admin123!',
        role: 'admin',
      });

      const user = createUser({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'User123!',
        role: 'user',
      });

      const updatedUser = updateUserStatus(user._id, false, admin);

      assert.strictEqual(updatedUser.isActive, false);
    });

    it('should allow admin to reactivate a user', function () {
      const admin = createUser({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'Admin123!',
        role: 'admin',
      });

      const user = createUser({
        name: 'Inactive User',
        email: 'inactive@example.com',
        password: 'User123!',
        role: 'user',
        isActive: false,
      });

      const updatedUser = updateUserStatus(user._id, true, admin);

      assert.strictEqual(updatedUser.isActive, true);
    });

    it('should allow admin to delete a user', function () {
      const admin = createUser({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'Admin123!',
        role: 'admin',
      });

      const user = createUser({
        name: 'Delete User',
        email: 'delete@example.com',
        password: 'User123!',
        role: 'user',
      });

      const deletedUser = deleteUser(user._id, admin);

      assert.strictEqual(deletedUser.email, 'delete@example.com');
      assert.strictEqual(userStore.length, 1);
    });

    it('should throw an error when admin updates a non-existent user', function () {
      const admin = createUser({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'Admin123!',
        role: 'admin',
      });

      assert.throws(() => {
        updateUserStatus('999', false, admin);
      }, /User not found/);
    });
  });
});