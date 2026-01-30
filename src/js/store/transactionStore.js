import { Store } from "./store";

const TransactionStore = class extends Store {
    constructor() {
        if (TransactionStore.instance) return TransactionStore.instance;
        super([]);
        TransactionStore.instance = this;
    }

    clearAndSet(newData) {
        this.state = newData;
        this.notify();
    }

    addTransaction(transaction) {
        this.setState(transaction);
    }

}

const transactionStore = new TransactionStore();

export { transactionStore }