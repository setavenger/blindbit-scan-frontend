'use client'
import { ConfigProvider } from './context/ConfigContext';
import { unstable_noStore as noStore } from 'next/cache';
import { AddressDisplay, ConnectionInfo, HeightDisplay, SetupKeysForm, UtxoDisplay } from './components';

export default function Home() {
  noStore(); // Opt into dynamic rendering

  return (
    <ConfigProvider>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">BlindBit Scan Dashboard</h1>
        <ConnectionInfo />
        <HeightDisplay />
        <AddressDisplay />
        <UtxoDisplay />
        <SetupKeysForm />
      </div>
    </ConfigProvider>
  );
}

