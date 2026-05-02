const assert = require('assert');


let nextId = 1;


function createExpense(data) {
  if (!data.title || !data.amount || !data.category) {
    throw new Error('Missing required fields: title, amount, category');
  }
  const expense = {
    _id: String(nextId++),
    title: data.title,
    amount: data.amount,
    category: data.category,
    date: data.date || new Date().toISOString(),
  };
  expenseStore.push(expense);
  return expense;
}

function getAllExpenses() {
  return expenseStore;
}

function updateExpense(id, updates) {
  const index = expenseStore.findIndex((e) => e._id === id);
  if (index === -1) throw new Error('Expense not found');
  expenseStore[index] = { ...expenseStore[index], ...updates };
  return expenseStore[index];
}

function deleteExpense(id) {
  const index = expenseStore.findIndex((e) => e._id === id);
  if (index === -1) throw new Error('Expense not found');
  const deleted = expenseStore.splice(index, 1);
  return deleted[0];
}


beforeEach(function () {
  expenseStore = [];
  nextId = 1;
});

// CRUD Test Suite
describe('BudgetTracker - Expense CRUD Operations', function () {


  describe('CREATE - Add a new expense', function () {
    it('should create an expense with valid data', function () {
      const expense = createExpense({
        title: 'Groceries',
        amount: 150,
        category: 'Food',
      });
      assert.strictEqual(expense.title, 'Groceries');
      assert.strictEqual(expense.amount, 150);
      assert.strictEqual(expense.category, 'Food');
      assert.ok(expense._id, 'Expense should have an ID');
    });

    it('should throw an error if required fields are missing', function () {
      assert.throws(() => {
        createExpense({ title: 'Incomplete' });
      }, /Missing required fields/);
    });
  });


  describe('READ - Get all expenses', function () {
    it('should return an empty array when no expenses exist', function () {
      const expenses = getAllExpenses();
      assert.strictEqual(expenses.length, 0);
    });

    it('should return all expenses after adding them', function () {
      createExpense({ title: 'Rent', amount: 1200, category: 'Housing' });
      createExpense({ title: 'Transport', amount: 80, category: 'Travel' });
      const expenses = getAllExpenses();
      assert.strictEqual(expenses.length, 2);
    });
  });


  describe('UPDATE - Modify an existing expense', function () {
    it('should update the amount of an existing expense', function () {
      const expense = createExpense({
        title: 'Internet',
        amount: 60,
        category: 'Utilities',
      });
      const updated = updateExpense(expense._id, { amount: 75 });
      assert.strictEqual(updated.amount, 75);
      assert.strictEqual(updated.title, 'Internet');
    });

    it('should throw an error when updating a non-existent expense', function () {
      assert.throws(() => {
        updateExpense('999', { amount: 100 });
      }, /Expense not found/);
    });
  });


  describe('DELETE - Remove an expense', function () {
    it('should delete an expense by ID', function () {
      const expense = createExpense({
        title: 'Coffee',
        amount: 20,
        category: 'Food',
      });
      const deleted = deleteExpense(expense._id);
      assert.strictEqual(deleted.title, 'Coffee');
      assert.strictEqual(getAllExpenses().length, 0);
    });

    it('should throw an error when deleting a non-existent expense', function () {
      assert.throws(() => {
        deleteExpense('999');
      }, /Expense not found/);
    });
  });

});