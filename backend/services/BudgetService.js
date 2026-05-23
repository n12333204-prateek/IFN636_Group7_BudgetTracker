// Pattern 5: Facade - hides the budget update steps behind simple methods
// the expense controller just calls these, it does not need to know the details

const budgetRepo = require('../repositories/BudgetRepository');
const budgetSubject = require('../observers/BudgetSubject');

class BudgetService {
  // add an expense amount to the matching budget and tell the observers
  async applyExpense(userId, category, amount) {
    const budget = await budgetRepo.findByUserAndCategory(userId, category);
    if (!budget) return null;

    budget.spentAmount = budget.spentAmount + Number(amount);
    await budgetRepo.save(budget);

    budgetSubject.notify({ budget });
    return budget;
  }

  // take an expense amount back off a budget (used on edit and delete)
  async revertExpense(userId, category, amount) {
    const budget = await budgetRepo.findByUserAndCategory(userId, category);
    if (!budget) return null;

    budget.spentAmount = Math.max(0, budget.spentAmount - Number(amount));
    await budgetRepo.save(budget);
    return budget;
  }

  // on edit the category or amount might change, so revert the old and apply the new
  async moveExpense(userId, oldCategory, oldAmount, newCategory, newAmount) {
    await this.revertExpense(userId, oldCategory, oldAmount);
    return this.applyExpense(userId, newCategory, newAmount);
  }

  // build the alert object the frontend shows after adding an expense
  buildAlert(budget, category) {
    if (!budget || !budget.limitAmount) return null;

    const percentage = (budget.spentAmount / budget.limitAmount) * 100;

    if (percentage >= 100) {
      return {
        type: 'exceeded',
        category,
        percentage: Math.round(percentage),
        message: `You have exceeded your ${category} budget! ($${budget.spentAmount.toFixed(2)} spent of $${budget.limitAmount.toFixed(2)} limit)`
      };
    }

    if (percentage >= 80) {
      return {
        type: 'warning',
        category,
        percentage: Math.round(percentage),
        message: `You have used ${Math.round(percentage)}% of your ${category} budget. Only $${(budget.limitAmount - budget.spentAmount).toFixed(2)} remaining.`
      };
    }

    return null;
  }
}

module.exports = new BudgetService();
