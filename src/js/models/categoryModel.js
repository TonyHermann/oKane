import { openDB } from "../db";

const getCategoriesDB = async () => {
    const db = await openDB();
    const transaction = db.transaction('categories', 'readonly');
    const store = transaction.objectStore('categories');
    const categories = await store.getAll();
    return categories;
}

const saveCategoryDB = async (category) => {
    const db = await openDB();
    const transaction = db.transaction('categories', 'readwrite');
    const store = transaction.objectStore('categories');
    store.add(category);
    return new Promise((resolve, reject) => {
        transaction.oncomplete = resolve;
        transaction.onerror = reject;
    });
};

const removeCategoryDB = async (categoryName) => {
    const db = await openDB();
    const transaction = db.transaction('categories', 'readwrite');
    const store = transaction.objectStore('categories');
    store.delete(categoryName);
    return new Promise((resolve, reject) => {
        transaction.oncomplete = resolve;
        transaction.onerror = reject;
    });
};

const updateCategoryDB = async (updatedCategory) => {
    const db = await openDB();
    const transaction = db.transaction('categories', 'readwrite');
    const store = transaction.objectStore('categories');
    store.put(updatedCategory);
    return new Promise((resolve, reject) => {
        transaction.oncomplete = resolve;
        transaction.onerror = reject;
    });
};

export { getCategoriesDB, saveCategoryDB, removeCategoryDB, updateCategoryDB };