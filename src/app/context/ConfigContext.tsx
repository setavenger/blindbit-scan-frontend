'use client'
import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';

export interface Config {
  baseURL: string;
  scanUsername: string;
  scanPassword: string;
  torBaseURL: string;
}

const ConfigContext = createContext<Config>({
  baseURL: process.env.NEXT_PUBLIC_BLINDBIT_SCAN_BASE_URL || 'error: not loaded',
  scanUsername: process.env.NEXT_PUBLIC_BLINDBIT_SCAN_USER || 'error: not loaded',
  scanPassword: process.env.NEXT_PUBLIC_BLINDBIT_SCAN_PASSWORD || 'error: not loaded',
  torBaseURL: process.env.NEXT_PUBLIC_BLINDBIT_SCAN_TOR_BASE_URL || 'error: not loaded',
});

interface ConfigProviderProps {
  children: ReactNode;
}

export function ConfigProvider({ children }: ConfigProviderProps)  {
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
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  if (loading || !config) {
    return <div>Loading configuration...</div>;
  }

  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = (): Config => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};

