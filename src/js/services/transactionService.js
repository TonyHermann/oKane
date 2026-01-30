import { getTransactionsDB, saveTransactionDB, removeTransactionDB, updateTransactionDB } from "../models/transactionModel.js";
import { transactionStore } from "../store/transactionStore.js";
  
const fetchTransactions = async () => {
    const txs = await getTransactionsDB();
    console.log({"asdasd":2,txs})
    transactionStore.clearAndSet(txs);
};

const addTransaction = async (transaction) => {
    await saveTransactionDB(transaction);
    await fetchTransactions();
};

const deleteTransaction = async (id) => {
    await removeTransactionDB(id);
    await fetchTransactions();
};

const updateTransaction = async (updatedTransaction) => {
    await updateTransactionDB(updatedTransaction);
    await fetchTransactions();
};

export { fetchTransactions, addTransaction, deleteTransaction, updateTransaction };
  