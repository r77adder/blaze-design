import { createContext, useContext, useState, type ReactNode } from 'react';

interface ClientViewContextValue {
  clientView: boolean;
  setClientView: (v: boolean) => void;
}

const ClientViewContext = createContext<ClientViewContextValue>({
  clientView: false,
  setClientView: () => {},
});

/**
 * Shared "View as client" state. Lives at the H2 root so the toggle
 * survives navigation — entering client view on Home keeps the Approvals
 * page (and any other surface with a client mode) in client view too,
 * and exiting anywhere exits everywhere.
 */
export function ClientViewProvider({ children }: { children: ReactNode }) {
  const [clientView, setClientView] = useState(false);
  return (
    <ClientViewContext.Provider value={{ clientView, setClientView }}>
      {children}
    </ClientViewContext.Provider>
  );
}

export function useClientView() {
  return useContext(ClientViewContext);
}
