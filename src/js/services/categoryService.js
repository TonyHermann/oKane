import { getCategoriesDB, saveCategoryDB, removeCategoryDB, updateCategoryDB } from "../models/categoryModel";

const getCategories = async () => {
    return await getCategoriesDB();
}

const getCategory = async (name) => {
    const allCats = getCategories();
    let desired = allCats.filter((category) => {
        if(category.name == name) {
            return category
        }
    });
    return desired
}

const addCategory = async (category) => {
    await saveCategoryDB(category);
};

const deleteCategory = async (categoryName) => {
    await removeCategoryDB(categoryName);
};

const updateCategory = async (updatedCategory) => {
    await updateCategoryDB(updatedCategory);
};

export { getCategories, addCategory, deleteCategory, updateCategory, getCategory };