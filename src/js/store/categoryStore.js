import { Store } from "./store"

const CategoryStore = class extends Store {
    constructor() {
        super([]);
    }

    clearAndSet(newState) {
        this.state = newState;
        this.notify();
    }

    addCategory(category) {
        this.state.categories?.push(category);
        this.notify();
    }

    removeCategory(name) {
        this.state.categories = this.state.categories.filter((cat) => {
            return cat.name !== name;
        });
    }
}

const categoryStore = new CategoryStore();

export { categoryStore }