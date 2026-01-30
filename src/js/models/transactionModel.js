import { openDB } from "../db.js";
import { MOCK_BANK_ID, MOCK_USER_ID, MOCK_ACCOUNT_ID } from '../data/constants.js';

const getTransactionsDB = async () => {
    const db = await openDB();
    const tx = db.transaction("transactions", "readonly");
    const store = tx.objectStore("transactions");
  
    return new Promise((resolve, reject) => {
      const req = store.getAll();
        
      req.onsuccess = () => {
        const allTxs = req.result;
        const filtered = allTxs.filter((tx) => {
            if(tx.userId === MOCK_USER_ID &&
                tx.bankId === MOCK_BANK_ID &&
                tx.accountId === MOCK_ACCOUNT_ID) {
                    return tx
                }
          }
        );
        resolve(filtered);
      };
  
      req.onerror = () => reject("Error al obtener transacciones.");
    });
};

const saveTransactionDB = async (transaction) => {
  const db = await openDB();
  const tx = db.transaction("transactions", "readwrite");
  const store = tx.objectStore("transactions");

  store.add(transaction);
  return new Promise((resolve, reject) => {
    tx.oncomplete = resolve;
    tx.onerror = reject;
  });
};

const removeTransactionDB = async (id) => {
  const db = await openDB();
  const tx = db.transaction("transactions", "readwrite");
  const store = tx.objectStore("transactions");

  store.delete(id);
  return new Promise((resolve, reject) => {
    tx.oncomplete = resolve;
    tx.onerror = reject;
  });
};

const updateTransactionDB = async (transaction) => {
  const db = await openDB();
  const tx = db.transaction("transactions", "readwrite");
  const store = tx.objectStore("transactions");

  store.put(transaction);
  return new Promise((resolve, reject) => {
    tx.oncomplete = resolve;
    tx.onerror = reject;
  });
};

export { getTransactionsDB, saveTransactionDB, removeTransactionDB, updateTransactionDB };
