'use client';

import type { ReactNode } from 'react';
import { DemoUserProvider } from '@/context/demo-user-context';
import { ThemeProvider } from '@/context/theme-context';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <DemoUserProvider>{children}</DemoUserProvider>
    </ThemeProvider>
  );
}
