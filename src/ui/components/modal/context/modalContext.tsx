import { createContext, useMemo, useState, type ReactNode } from "react";

interface ModalContextProps {
  state: boolean;
  setState: React.Dispatch<React.SetStateAction<boolean>>;
}

const ModalContext = createContext<ModalContextProps>({
  state: false,
  setState: () => null,
});

interface ModalProviderProps {
  children: ReactNode;
}

const ModalProvider = ({ children }: ModalProviderProps) => {
  const [state, setState] = useState(false);
  const ModalContextValues = useMemo(() => ({ state, setState }), [state]);

  return (
    <ModalContext.Provider value={ModalContextValues}>
      {children}
    </ModalContext.Provider>
  );
};

export { ModalContext, ModalProvider };
