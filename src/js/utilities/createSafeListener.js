export const createSafeListener = (fn, isActiveFn) => {
    return (state) => {
        if(isActiveFn()) {
            fn(state);
        }
    }
};