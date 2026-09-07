class Category {
  constructor(name, type, userId) {
    this.id = Date.now() + Math.floor(Math.random() * 1000);
    this.name = name;
    this.type = type || 'expense';
    this.userId = userId;
    this.createdAt = new Date().toISOString();
  }
}

export default Category;
