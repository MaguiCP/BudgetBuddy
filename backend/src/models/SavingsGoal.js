class SavingsGoal {
  constructor(name, targetAmount, currentAmount, deadline, userId) {
    this.id = Date.now() + Math.floor(Math.random() * 1000);
    this.name = name;
    this.targetAmount = Number(targetAmount);
    this.currentAmount = Number(currentAmount || 0);
    this.deadline = deadline || null;
    this.userId = userId;
    this.createdAt = new Date().toISOString();
  }
}

export default SavingsGoal;
