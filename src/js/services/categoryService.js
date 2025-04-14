import { getCategoriesDB, saveCategoryDB, removeCategoryDB, updateCategoryDB } from "../models/categoryModel";

const getCategories = async () => {
    return await getCategoriesDB();
}

const addCategory = async (category) => {
    await saveCategoryDB(category);
};

const deleteCategory = async (categoryName) => {
    await removeCategoryDB(categoryName);
};

const updateCategory = async (updatedCategory) => {
    await updateCategoryDB(updateCategory);
};

export { getCategories, addCategory, deleteCategory, updateCategory };