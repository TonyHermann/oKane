import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface ModalConfig {
  title: string;
  content: ReactNode;
}

interface ModalContextValue {
  modal: ModalConfig | null;
  openModal: (config: ModalConfig) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

interface ModalProviderProps {
  children: ReactNode;
}

const ModalProvider = ({ children }: ModalProviderProps) => {
  const [modal, setModal] = useState<ModalConfig | null>(null);

  const openModal = useCallback((config: ModalConfig) => {
    setModal(config);
  }, []);

  const closeModal = useCallback(() => {
    setModal(null);
  }, []);

  const value = useMemo(
    () => ({ modal, openModal, closeModal }),
    [modal, openModal, closeModal],
  );

  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
};

export { ModalContext, ModalProvider };
