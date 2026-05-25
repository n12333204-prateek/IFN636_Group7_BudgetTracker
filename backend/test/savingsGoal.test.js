const assert = require('assert');

let savingsGoalStore = [];
let nextId = 1;

function resetSavingsGoalStore() {
  savingsGoalStore = [];
  nextId = 1;
}

function generateId() {
  return String(nextId++);
}

function createSavingsGoal(data) {
  if (!data.goalName || !data.targetAmount || !data.targetDate) {
    throw new Error('Missing required savings goal fields');
  }

  const goal = {
    _id: generateId(),
    goalName: data.goalName,
    targetAmount: data.targetAmount,
    savedAmount: data.savedAmount || 0,
    targetDate: data.targetDate,
    notes: data.notes || '',
  };

  savingsGoalStore.push(goal);
  return goal;
}

function getAllSavingsGoals() {
  return savingsGoalStore;
}

function updateSavingsGoal(id, updates) {
  const index = savingsGoalStore.findIndex((goal) => goal._id === id);

  if (index === -1) {
    throw new Error('Goal not found');
  }

  savingsGoalStore[index] = {
    ...savingsGoalStore[index],
    ...updates,
  };

  return savingsGoalStore[index];
}

function contributeToSavingsGoal(id, amount) {
  const goal = savingsGoalStore.find((goal) => goal._id === id);

  if (!goal) {
    throw new Error('Goal not found');
  }

  goal.savedAmount += amount;
  return goal;
}

function deleteSavingsGoal(id) {
  const index = savingsGoalStore.findIndex((goal) => goal._id === id);

  if (index === -1) {
    throw new Error('Goal not found');
  }

  return savingsGoalStore.splice(index, 1)[0];
}

beforeEach(function () {
  resetSavingsGoalStore();
});

describe('BudgetTracker - Savings Goals Functional Testing', function () {
  describe('FT007 - Savings Goals CRUD Operations', function () {
    it('should create a savings goal with valid data', function () {
      const goal = createSavingsGoal({
        goalName: 'New Laptop',
        targetAmount: 1500,
        targetDate: '2026-12-31',
        notes: 'Functional testing savings goal',
      });

      assert.strictEqual(goal.goalName, 'New Laptop');
      assert.strictEqual(goal.targetAmount, 1500);
      assert.strictEqual(goal.savedAmount, 0);
      assert.ok(goal._id);
    });

    it('should return all savings goals', function () {
      createSavingsGoal({
        goalName: 'New Laptop',
        targetAmount: 1500,
        targetDate: '2026-12-31',
      });

      createSavingsGoal({
        goalName: 'Travel Fund',
        targetAmount: 2000,
        targetDate: '2026-12-31',
      });

      const goals = getAllSavingsGoals();

      assert.strictEqual(goals.length, 2);
    });

    it('should update a savings goal', function () {
      const goal = createSavingsGoal({
        goalName: 'Phone',
        targetAmount: 1000,
        targetDate: '2026-12-31',
      });

      const updated = updateSavingsGoal(goal._id, {
        goalName: 'Phone Updated',
        targetAmount: 1200,
      });

      assert.strictEqual(updated.goalName, 'Phone Updated');
      assert.strictEqual(updated.targetAmount, 1200);
    });

    it('should add contribution to a savings goal', function () {
      const goal = createSavingsGoal({
        goalName: 'Travel',
        targetAmount: 2000,
        targetDate: '2026-12-31',
      });

      const updated = contributeToSavingsGoal(goal._id, 250);

      assert.strictEqual(updated.savedAmount, 250);
    });

    it('should delete a savings goal', function () {
      const goal = createSavingsGoal({
        goalName: 'Emergency Fund',
        targetAmount: 3000,
        targetDate: '2026-12-31',
      });

      deleteSavingsGoal(goal._id);

      assert.strictEqual(getAllSavingsGoals().length, 0);
    });

    it('should throw an error if required savings goal fields are missing', function () {
      assert.throws(() => {
        createSavingsGoal({
          goalName: 'Incomplete Goal',
        });
      }, /Missing required savings goal fields/);
    });

    it('should throw an error when updating a non-existent savings goal', function () {
      assert.throws(() => {
        updateSavingsGoal('999', {
          goalName: 'Invalid Update',
        });
      }, /Goal not found/);
    });

    it('should throw an error when deleting a non-existent savings goal', function () {
      assert.throws(() => {
        deleteSavingsGoal('999');
      }, /Goal not found/);
    });
  });
});