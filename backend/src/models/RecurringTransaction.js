class RecurringTransaction {
  constructor(description, amount, type, category, frequency, nextDate, userId) {
    this.id = Date.now() + Math.floor(Math.random() * 1000);
    this.description = description;
    this.amount = Number(amount);
    this.type = type;
    this.category = category;
    this.frequency = frequency || 'monthly';
    this.nextDate = nextDate;
    this.userId = userId;
    this.active = true;
    this.createdAt = new Date().toISOString();
  }
}

export default RecurringTransaction;
