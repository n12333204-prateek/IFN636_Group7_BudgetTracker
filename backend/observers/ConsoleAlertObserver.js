// Pattern 4: Observer - one observer that logs a warning when a budget gets close or over

class ConsoleAlertObserver {
  update(event) {
    const budget = event && event.budget;
    if (!budget || !budget.limitAmount) return;

    const percentage = (budget.spentAmount / budget.limitAmount) * 100;

    if (percentage >= 100) {
      console.log(`[ALERT] ${budget.category} budget exceeded (${Math.round(percentage)}%)`);
    } else if (percentage >= 80) {
      console.log(`[ALERT] ${budget.category} budget almost used (${Math.round(percentage)}%)`);
    }
  }
}

module.exports = new ConsoleAlertObserver();
