'use client'
import { ConfigProvider } from './context/ConfigContext';
import { AddressDisplay, ConnectionInfo, HeightDisplay, SetupKeysForm, UtxoDisplay } from './components';

export default function Home() {
  return (
    <ConfigProvider>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">BlindBit Scan Dashboard</h1>
        <HeightDisplay />
        <ConnectionInfo />
        <AddressDisplay />
        <UtxoDisplay />
        <SetupKeysForm />
      </div>
    </ConfigProvider>
  );
}

