import Category from '../models/Category.js';
import {
  addCategory,
  deleteCategory,
  findCategoryById,
  getCategories,
  updateCategory,
} from '../repositories/categoryRepository.js';
import { validateCategory, validateCategoryId } from '../validation/categoryValidation.js';

export const createCategory = async (categoryData, userId) => {
  const validatedCategory = await validateCategory(categoryData);
  const existingCategory = getCategories().find(
    (category) => category.name.toLowerCase() === validatedCategory.name.toLowerCase() && category.userId === userId
  );

  if (existingCategory) {
    throw new Error('Category already exists.');
  }

  const newCategory = new Category(validatedCategory.name, validatedCategory.type, userId);
  addCategory(newCategory);
  return newCategory;
};

export const getAllCategories = (userId) => {
  return getCategories().filter((category) => category.userId === userId);
};

export const getCategoryById = async (idData, userId) => {
  const { id } = await validateCategoryId(idData);
  const category = findCategoryById(id);

  if (!category || category.userId !== userId) {
    throw new Error('Category not found.');
  }

  return category;
};

export const updateCategoryById = async (idData, categoryData, userId) => {
  const { id } = await validateCategoryId(idData);
  const existingCategory = findCategoryById(id);

  if (!existingCategory || existingCategory.userId !== userId) {
    throw new Error('Category not found.');
  }

  const validatedCategory = await validateCategory(categoryData);
  const updatedCategory = updateCategory(id, {
    ...existingCategory,
    ...validatedCategory,
  });

  if (!updatedCategory) {
    throw new Error('Error updating category.');
  }

  return updatedCategory;
};

export const deleteCategoryById = async (idData, userId) => {
  const { id } = await validateCategoryId(idData);
  const category = findCategoryById(id);

  if (!category || category.userId !== userId) {
    throw new Error('Category not found.');
  }

  const deleted = deleteCategory(id);

  if (!deleted) {
    throw new Error('Error deleting category.');
  }

  return true;
};
