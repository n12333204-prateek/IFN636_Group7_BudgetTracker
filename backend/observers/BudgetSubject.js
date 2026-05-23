// Pattern 4: Observer - subject keeps the list of observers and notifies them all
// it just calls update on each one, it does not care what each observer does

class BudgetSubject {
  constructor() {
    this.observers = [];
  }

  subscribe(observer) {
    this.observers.push(observer);
  }

  unsubscribe(observer) {
    this.observers = this.observers.filter(o => o !== observer);
  }

  notify(event) {
    this.observers.forEach(observer => observer.update(event));
  }
}

module.exports = new BudgetSubject();
