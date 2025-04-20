import { getCategoriesDB, saveCategoryDB, removeCategoryDB, updateCategoryDB } from "../models/categoryModel";
import { categoryStore } from "../store/categoryStore";

const fetchCategories = async () => {
    const cats = await getCategoriesDB();
    categoryStore.clearAndSet(cats);
}

// const getCategory = async (name) => {
//     const allCats = getCategories();
//     let desired = allCats.filter((category) => {
//         if(category.name == name) {
//             return category
//         }
//     });
//     return desired
// }

const addCategory = async (category) => {
    await saveCategoryDB(category);
    await fetchCategories();
};

const deleteCategory = async (categoryName) => {
    await removeCategoryDB(categoryName);
    await fetchCategories();
};

const updateCategory = async (updatedCategory) => {
    await updateCategoryDB(updatedCategory);
    await fetchCategories();
};

export { fetchCategories, addCategory, deleteCategory, updateCategory };