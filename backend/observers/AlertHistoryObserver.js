// Pattern 4: Observer - second observer with the same update method but different behaviour
// it keeps the recent alerts in memory. the subject treats both observers the same way,
// which is polymorphism in action

class AlertHistoryObserver {
  constructor() {
    this.history = [];
  }

  update(event) {
    const budget = event && event.budget;
    if (!budget || !budget.limitAmount) return;

    const percentage = (budget.spentAmount / budget.limitAmount) * 100;
    if (percentage >= 80) {
      this.history.push({
        category: budget.category,
        percentage: Math.round(percentage),
        time: new Date()
      });

      // keep only the last 20 so the list does not grow forever
      if (this.history.length > 20) {
        this.history.shift();
      }
    }
  }

  getHistory() {
    return this.history;
  }
}

module.exports = new AlertHistoryObserver();
