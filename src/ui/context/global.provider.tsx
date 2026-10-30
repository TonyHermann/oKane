import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { GlobalContext } from "./global.context.ts";

const EmptyGlobalState = false;

interface GlobalProps {
  children: ReactNode;
}

export const GlobalProvider = ({ children }: GlobalProps) => {
  const [value, setValue] = useState<boolean>(EmptyGlobalState);
  const contextValue = useMemo(() => ({ value, setValue }), [value]);

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
};
