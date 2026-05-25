const assert = require('assert');

let profileStore = [];
let nextId = 1;

function resetProfileStore() {
  profileStore = [];
  nextId = 1;
}

function generateId() {
  return String(nextId++);
}

function createProfile(data) {
  if (!data.name || !data.email) {
    throw new Error('Missing required profile fields');
  }

  const profile = {
    _id: generateId(),
    name: data.name,
    email: data.email,
    address: data.address || '',
    occupation: data.occupation || '',
  };

  profileStore.push(profile);
  return profile;
}

function getProfile(id) {
  const profile = profileStore.find((profile) => profile._id === id);

  if (!profile) {
    throw new Error('Profile not found');
  }

  return profile;
}

function updateProfile(id, updates) {
  const index = profileStore.findIndex((profile) => profile._id === id);

  if (index === -1) {
    throw new Error('Profile not found');
  }

  profileStore[index] = {
    ...profileStore[index],
    ...updates,
  };

  return profileStore[index];
}

beforeEach(function () {
  resetProfileStore();
});

describe('BudgetTracker - Profile Functional Testing', function () {
  describe('FT008 - Profile Operations', function () {
    it('should create a user profile with valid data', function () {
      const profile = createProfile({
        name: 'Test User',
        email: 'testuser@example.com',
        address: 'Brisbane',
        occupation: 'Student',
      });

      assert.strictEqual(profile.name, 'Test User');
      assert.strictEqual(profile.email, 'testuser@example.com');
      assert.strictEqual(profile.address, 'Brisbane');
      assert.strictEqual(profile.occupation, 'Student');
      assert.ok(profile._id);
    });

    it('should retrieve an existing profile by ID', function () {
      const profile = createProfile({
        name: 'Profile User',
        email: 'profile@example.com',
        address: 'Brisbane',
        occupation: 'Student',
      });

      const result = getProfile(profile._id);

      assert.strictEqual(result.email, 'profile@example.com');
      assert.strictEqual(result.name, 'Profile User');
    });

    it('should update profile details successfully', function () {
      const profile = createProfile({
        name: 'Old Name',
        email: 'old@example.com',
        address: 'Brisbane',
        occupation: 'Student',
      });

      const updated = updateProfile(profile._id, {
        name: 'Updated Name',
        address: 'Queensland',
      });

      assert.strictEqual(updated.name, 'Updated Name');
      assert.strictEqual(updated.address, 'Queensland');
      assert.strictEqual(updated.email, 'old@example.com');
    });

    it('should throw an error if required profile fields are missing', function () {
      assert.throws(() => {
        createProfile({
          name: 'Incomplete Profile',
        });
      }, /Missing required profile fields/);
    });

    it('should throw an error when retrieving a non-existent profile', function () {
      assert.throws(() => {
        getProfile('999');
      }, /Profile not found/);
    });
  });
});