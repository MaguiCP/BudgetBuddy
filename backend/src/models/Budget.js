class Budget {
  constructor(month, category, amount, userId) {
    this.id = Date.now() + Math.floor(Math.random() * 1000);
    this.month = month;
    this.category = category;
    this.amount = Number(amount);
    this.userId = userId;
    this.createdAt = new Date().toISOString();
  }
}

export default Budget;
