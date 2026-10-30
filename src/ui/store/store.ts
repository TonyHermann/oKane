import { configureStore } from "@reduxjs/toolkit";
import categoriesReducer from "./slices/categorySlices";
import transactionsReducer from "./slices/transactionsSlices";
import categorizationRulesReducer from "./slices/categorizationRulesSlices";

export const store = configureStore({
  reducer: {
    transactions: transactionsReducer,
    categories: categoriesReducer,
    categorizationRules: categorizationRulesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
