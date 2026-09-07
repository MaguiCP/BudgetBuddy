import Category from '../models/Category.js';

const categories = [];

export const addCategory = (category) => {
  categories.push(category);
  return category;
};

export const getCategories = () => categories;

export const findCategoryById = (id) => {
  return categories.find((category) => category.id === Number(id));
};

export const updateCategory = (id, updatedCategory) => {
  const index = categories.findIndex((category) => category.id === Number(id));

  if (index === -1) {
    return null;
  }

  categories[index] = { ...categories[index], ...updatedCategory };
  return categories[index];
};

export const deleteCategory = (id) => {
  const index = categories.findIndex((category) => category.id === Number(id));

  if (index === -1) {
    return false;
  }

  categories.splice(index, 1);
  return true;
};

export default Category;
