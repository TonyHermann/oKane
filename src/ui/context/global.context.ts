import { createContext, useContext } from "react";

interface GlobalContextType {
  value: boolean | null;
  setValue: React.Dispatch<React.SetStateAction<boolean>>;
}

export const GlobalContext = createContext<GlobalContextType>({
  value: null,
  setValue: () => {},
});

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);

  if (!context.value) {
    throw new Error(
      "GlobalContext must be used within a GlobalContextProvider",
    );
  }

  return context;
};
