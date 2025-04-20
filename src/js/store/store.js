const Store = class {
    constructor(initialState = []) {
        this.state = initialState;
        this.listeners = [];
        console.log(this.state)
    }

    subscribe(callback) {
        if(this.listeners.indexOf(callback) == -1) {
            this.listeners.push(callback);
            callback(this.state);
        }
    }

    notify() {
        this.listeners.forEach((cb) => {
            cb(this.state);
        });
    }

    setState(newState) {
        this.state = [ ...this.state, ...newState ];
        this.notify();
    }

    getState() {
        return this.state;
    }

}

export { Store }