import { fetchCategories } from "../services/categoryService";
import { createCategoryModal } from "../ui/dialgos/CategoryDialogs";
import { categoryStore } from "../store/categoryStore";


const categoryController = () => {
    $("#admCat").addEventListener("click", async (e) => {
        e.preventDefault();
        await fetchCategories();
        let categories = categoryStore.getState();
        createCategoryModal(categories);
    });
};

export { categoryController };