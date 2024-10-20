'use client'
// context/ConfigContext.tsx
import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { unstable_noStore as noStore } from 'next/cache';


export interface Config {
  baseURL: string;
  scanUsername: string;
  scanPassword: string;
  torBaseURL: string;
  // blindbitScanPort: number;
}

// Create the context with a default value of null
const ConfigContext = createContext<Config>({
  baseURL: process.env.NEXT_PUBLIC_BLINDBIT_SCAN_BASE_URL || 'error: not loaded',
  scanUsername: process.env.NEXT_PUBLIC_BLINDBIT_SCAN_USER || 'error: not loaded',
  scanPassword: process.env.NEXT_PUBLIC_BLINDBIT_SCAN_PASSWORD || 'error: not loaded',
  torBaseURL: process.env.NEXT_PUBLIC_BLINDBIT_SCAN_TOR_BASE_URL || 'error: not loaded',
  // blindbitScanPort: Number(process.env.NEXT_PUBLIC_BLINDBIT_SCAN_PORT) || 0
});

// Define the props for the provider
interface ConfigProviderProps {
  children: ReactNode;
}

// Create a provider component
export function ConfigProvider({ children }: ConfigProviderProps)  {
  // noStore(); // Opt into dynamic rendering

  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/config');
        if (!response.ok) {
          throw new Error('Failed to fetch config');
        }
        const data: Config = await response.json();
        setConfig(data);
      } catch (error) {
        console.error('Error fetching config:', error);
        setConfig({
          baseURL: 'error: not loaded',
          scanUsername: 'error: not loaded',
          scanPassword: 'error: not loaded',
          torBaseURL: 'error: not loaded',
          // blindbitScanPort: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  if (loading || !config) {
    return <div>Loading configuration...</div>; // Or a spinner/loading indicator
  }

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

