import { getUsersDB, saveUserDB, removeUserDB, updateUserDB, getUserByIdDB } from "../models/userModel.js";
import { userStore } from "../store/userStore.js";

const fetchUsers = async () => {
    const users = await getUsersDB();
    userStore.clearAndSet(users);
};

const addUser = async (user) => {
    await saveUserDB(user);
    await fetchUsers();
};

const deleteUser = async (userId) => {
    await removeUserDB(userId);
    await fetchUsers();
};

const updateUser = async (updatedUser) => {
    await updateUserDB(updatedUser);
    await fetchUsers();
};

const getUserById = async (id) => {
    return await getUserByIdDB(id);
};

export { fetchUsers, addUser, deleteUser, updateUser, getUserById };
