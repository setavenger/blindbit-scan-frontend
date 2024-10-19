'use client'
// context/ConfigContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { unstable_noStore as noStore } from 'next/cache';

export interface Config {
  baseURL: string;
  scanUsername: string;
  scanPassword: string;
  torBaseURL: string;
  blindbitScanPort: number;
}

// Create the context with a default value of null
const ConfigContext = createContext<Config | null>(null);

// Define the props for the provider
interface ConfigProviderProps {
  children: ReactNode;
}

// Create a provider component
export function ConfigProvider({ children }: ConfigProviderProps)  {
  const [config, setConfig] = useState<Config | null>(null);

  noStore(); // Opt into dynamic rendering

  useEffect(() => {
    setConfig({
      baseURL: process.env.NEXT_PUBLIC_BLINDBIT_SCAN_BASE_URL || 'error: not loaded',
      scanUsername: process.env.NEXT_PUBLIC_BLINDBIT_SCAN_USER || 'error: not loaded',
      scanPassword: process.env.NEXT_PUBLIC_BLINDBIT_SCAN_PASSWORD || 'error: not loaded',
      torBaseURL: process.env.NEXT_PUBLIC_BLINDBIT_SCAN_TOR_BASE_URL || 'error: not loaded',
      blindbitScanPort: Number(process.env.NEXT_PUBLIC_BLINDBIT_SCAN_PORT) || 5729,
    })
  }, [])

  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  );
};

// Custom hook to use the config
export const useConfig = (): Config => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};

