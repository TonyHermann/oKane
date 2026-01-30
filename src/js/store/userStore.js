import { Store } from "./store"

const UserStore = class extends Store {
    constructor() {
        super([]);
    }

    clearAndSet(newState) {
        this.state = newState;
        this.notify();
    }

    addUser(user) {
        this.state.users?.push(user);
        this.notify();
    }

    removeUser(id) {
        this.state.users = this.state.users.filter((user) => {
            return user.id !== id;
        });
    }
}

const userStore = new UserStore();

export { userStore }