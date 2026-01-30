import { openDB } from "../db";

const getUsersDB = async () => {
    const db = await openDB();
    const transaction = db.transaction('users', 'readonly');
    const store = transaction.objectStore('users');

    return new Promise((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = (event) => {
            const users = event.target.result;
            resolve(users);
        }

        request.onerror = (event) => {
            reject(`Error al obtener usuarios: ${event.target.error}`)
        }

    })
}

const saveUserDB = async (user) => {
    const db = await openDB();
    const transaction = db.transaction('users', 'readwrite');
    const store = transaction.objectStore('users');
    store.add(user);
    return new Promise((resolve, reject) => {
        transaction.oncomplete = resolve;
        transaction.onerror = reject;
    });
};

const removeUserDB = async (userId) => {
    const db = await openDB();
    const transaction = db.transaction('users', 'readwrite');
    const store = transaction.objectStore('users');
    store.delete(userId);
    return new Promise((resolve, reject) => {
        transaction.oncomplete = resolve;
        transaction.onerror = reject;
    });
};

const updateUserDB = async (updatedUser) => {
    const db = await openDB();
    const transaction = db.transaction('users', 'readwrite');
    const store = transaction.objectStore('users');
    store.put(updatedUser);
    return new Promise((resolve, reject) => {
        transaction.oncomplete = resolve;
        transaction.onerror = reject;
    });
};

const getUserByIdDB = async (id) => {
    const db = await openDB();
    const transaction = db.transaction('users', 'readonly');
    const store = transaction.objectStore('users');

    return new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
        request.onerror = (event) => {
            reject(`Error al obtener usuario: ${event.target.error}`);
        };
    });
};

export { getUsersDB, saveUserDB, removeUserDB, updateUserDB, getUserByIdDB };