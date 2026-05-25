const assert = require('assert');

let budgetStore = [];
let nextId = 1;

function resetBudgetStore() {
  budgetStore = [];
  nextId = 1;
}

function generateId() {
  return String(nextId++);
}

function createBudget(data) {
  if (!data.category || !data.limitAmount || !data.timePeriod) {
    throw new Error('Missing required budget fields');
  }

  const budget = {
    _id: generateId(),
    category: data.category,
    limitAmount: data.limitAmount,
    spentAmount: data.spentAmount || 0,
    timePeriod: data.timePeriod,
  };

  budgetStore.push(budget);
  return budget;
}

function getAllBudgets() {
  return budgetStore;
}

function updateBudget(id, updates) {
  const index = budgetStore.findIndex((budget) => budget._id === id);

  if (index === -1) {
    throw new Error('Budget not found');
  }

  budgetStore[index] = {
    ...budgetStore[index],
    ...updates,
  };

  return budgetStore[index];
}

function deleteBudget(id) {
  const index = budgetStore.findIndex((budget) => budget._id === id);

  if (index === -1) {
    throw new Error('Budget not found');
  }

  return budgetStore.splice(index, 1)[0];
}

beforeEach(function () {
  resetBudgetStore();
});

describe('BudgetTracker - Budget Functional Testing', function () {
  describe('FT006 - Budget CRUD Operations', function () {
    it('should create a budget with valid data', function () {
      const budget = createBudget({
        category: 'Transport',
        limitAmount: 300,
        timePeriod: 'monthly',
      });

      assert.strictEqual(budget.category, 'Transport');
      assert.strictEqual(budget.limitAmount, 300);
      assert.strictEqual(budget.timePeriod, 'monthly');
      assert.ok(budget._id);
    });

    it('should return all budget records', function () {
      createBudget({
        category: 'Transport',
        limitAmount: 300,
        timePeriod: 'monthly',
      });

      createBudget({
        category: 'Food',
        limitAmount: 500,
        timePeriod: 'monthly',
      });

      const budgets = getAllBudgets();

      assert.strictEqual(budgets.length, 2);
    });

    it('should update a budget record', function () {
      const budget = createBudget({
        category: 'Food',
        limitAmount: 400,
        timePeriod: 'monthly',
      });

      const updated = updateBudget(budget._id, {
        limitAmount: 550,
      });

      assert.strictEqual(updated.limitAmount, 550);
      assert.strictEqual(updated.category, 'Food');
    });

    it('should delete a budget record', function () {
      const budget = createBudget({
        category: 'Shopping',
        limitAmount: 200,
        timePeriod: 'monthly',
      });

      deleteBudget(budget._id);

      assert.strictEqual(getAllBudgets().length, 0);
    });

    it('should throw an error if required budget fields are missing', function () {
      assert.throws(() => {
        createBudget({
          category: 'Incomplete Budget',
        });
      }, /Missing required budget fields/);
    });

    it('should throw an error when updating a non-existent budget', function () {
      assert.throws(() => {
        updateBudget('999', {
          limitAmount: 1000,
        });
      }, /Budget not found/);
    });

    it('should throw an error when deleting a non-existent budget', function () {
      assert.throws(() => {
        deleteBudget('999');
      }, /Budget not found/);
    });
  });
});