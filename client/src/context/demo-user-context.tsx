'use client';

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type DemoUserContextValue = {
  currentUser: string;
  workspaceName: string;
  setCurrentUser: (value: string) => void;
};

const DemoUserContext = createContext<DemoUserContextValue | undefined>(
  undefined,
);

export function DemoUserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState('demo@example.com');

  const value = useMemo(
    () => ({
      currentUser,
      workspaceName: 'ClientPulse Demo Workspace',
      setCurrentUser,
    }),
    [currentUser],
  );

  return (
    <DemoUserContext.Provider value={value}>
      {children}
    </DemoUserContext.Provider>
  );
}

export function useDemoUser() {
  const value = useContext(DemoUserContext);

  if (!value) {
    throw new Error('useDemoUser must be used inside DemoUserProvider');
  }

  return value;
}
