const assert = require('assert');

let incomeStore = [];
let nextId = 1;

function resetIncomeStore() {
  incomeStore = [];
  nextId = 1;
}

function generateId() {
  return String(nextId++);
}

function createIncome(data) {
  if (!data.source || !data.amount) {
    throw new Error('Missing required income fields');
  }

  const income = {
    _id: generateId(),
    source: data.source,
    amount: data.amount,
    date: data.date || new Date().toISOString(),
  };

  incomeStore.push(income);
  return income;
}

function getAllIncome() {
  return incomeStore;
}

function updateIncome(id, updates) {
  const index = incomeStore.findIndex((income) => income._id === id);

  if (index === -1) {
    throw new Error('Income not found');
  }

  incomeStore[index] = {
    ...incomeStore[index],
    ...updates,
  };

  return incomeStore[index];
}

function deleteIncome(id) {
  const index = incomeStore.findIndex((income) => income._id === id);

  if (index === -1) {
    throw new Error('Income not found');
  }

  return incomeStore.splice(index, 1)[0];
}

beforeEach(function () {
  resetIncomeStore();
});

describe('BudgetTracker - Income Functional Testing', function () {
  describe('FT005 - Income CRUD Operations', function () {
    it('should create an income record with valid data', function () {
      const income = createIncome({
        source: 'Part-time Job',
        amount: 500,
      });

      assert.strictEqual(income.source, 'Part-time Job');
      assert.strictEqual(income.amount, 500);
      assert.ok(income._id);
    });

    it('should return all income records', function () {
      createIncome({
        source: 'Part-time Job',
        amount: 500,
      });

      createIncome({
        source: 'Freelance',
        amount: 250,
      });

      const income = getAllIncome();

      assert.strictEqual(income.length, 2);
    });

    it('should update an income record', function () {
      const income = createIncome({
        source: 'Casual Work',
        amount: 300,
      });

      const updated = updateIncome(income._id, {
        amount: 450,
      });

      assert.strictEqual(updated.amount, 450);
    });

    it('should delete an income record', function () {
      const income = createIncome({
        source: 'Freelance',
        amount: 250,
      });

      deleteIncome(income._id);

      assert.strictEqual(getAllIncome().length, 0);
    });

    it('should throw an error if required income fields are missing', function () {
      assert.throws(() => {
        createIncome({
          source: 'Incomplete Income',
        });
      }, /Missing required income fields/);
    });
  });
});