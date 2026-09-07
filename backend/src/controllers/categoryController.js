import {
  createCategory,
  deleteCategoryById,
  getAllCategories,
  getCategoryById,
  updateCategoryById,
} from '../services/categoryService.js';

const createCategoryController = async (req, res) => {
  try {
    const category = await createCategory(req.body, req.user.id);
    return res.status(201).json({ message: 'Category created successfully!', category });
  } catch (error) {
    const status = error.message === 'Category already exists.' ? 409 : 400;
    return res.status(status).json({ error: error.message });
  }
};

const getAllCategoriesController = (req, res) => {
  const categories = getAllCategories(req.user.id);
  return res.status(200).json(categories);
};

const getCategoryController = async (req, res) => {
  try {
    const category = await getCategoryById(req.params, req.user.id);
    return res.status(200).json(category);
  } catch (error) {
    const status = error.message === 'Category not found.' ? 404 : 400;
    return res.status(status).json({ error: error.message });
  }
};

const updateCategoryController = async (req, res) => {
  try {
    const category = await updateCategoryById(req.params, req.body, req.user.id);
    return res.status(200).json({ message: 'Category updated successfully!', category });
  } catch (error) {
    const status = error.message === 'Category not found.' ? 404 : 400;
    return res.status(status).json({ error: error.message });
  }
};

const deleteCategoryController = async (req, res) => {
  try {
    await deleteCategoryById(req.params, req.user.id);
    return res.status(200).json({ message: 'Category deleted successfully!' });
  } catch (error) {
    const status = error.message === 'Category not found.' ? 404 : 400;
    return res.status(status).json({ error: error.message });
  }
};

export {
  createCategoryController,
  getAllCategoriesController,
  getCategoryController,
  updateCategoryController,
  deleteCategoryController,
};
