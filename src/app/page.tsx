'use client'
import { useState, useEffect } from 'react';
import { Input, Button } from '@material-tailwind/react';

const baseURL = process.env.NEXT_PUBLIC_BLINDBIT_SCAN_BASE_URL || 'http://umbrel.local:5729';
// const baseURL = 'http://umbrel.local:5729';
// const baseURL = 'http://127.0.0.1:8080';
const scanUsername = process.env.NEXT_PUBLIC_BLINDBIT_SCAN_USER || "blindbit-scan-umbrel";
const scanPassword = process.env.NEXT_PUBLIC_BLINDBIT_SCAN_PASSWORD || 'mypassword';


export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">BlindBit Scan Dashboard</h1>
      <HeightDisplay />
      <AddressDisplay />
      <UtxoDisplay />
      <SetupKeysForm />
    </div>
  );
}

interface Bip352LabelJSON {
  pub_key: string;
  tweak: string;
  address: string;
  m: number;
}

interface OwnedUtxoJSON {
  txid: string;
  vout: number;
  amount: number;
  priv_key_tweak: string;
  pub_key: string;
  timestamp: number;
  utxo_state: "unconfirmed" | "unspent" | "unconfirmed_spent" | "spent";
  label?: Bip352LabelJSON;
}

function HeightDisplay() {
  const [height, setHeight] = useState<number | null>(null);

  const fetchHeight = () => {
    fetch(`${baseURL}/height`,{
      headers: {
        'Authorization': getBasicAuthHeader(scanUsername, scanPassword),
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setHeight(data.height);
      })
      .catch((error) => {
        console.error('Error fetching height:', error);
      });
  };

  useEffect(() => {
    fetchHeight();
    const interval = setInterval(fetchHeight, 2000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="my-4">
      <h2 className="text-xl font-bold">Current Height</h2>
      <p>{height !== null ? height : 'Loading...'}</p>
    </div>
  );
}

function AddressDisplay() {
  const [address, setAddress] = useState<string>('');

  const fetchAddress = () => {
    fetch(`${baseURL}/address`, {
      headers: {
        'Authorization': getBasicAuthHeader(scanUsername, scanPassword),
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setAddress(data.address);
      })
      .catch((error) => {
        console.error('Error fetching address:', error);
      });
  }

  useEffect(() => {
    fetchAddress();
    const interval = setInterval(fetchAddress, 60000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="my-4">
      <h2 className="text-xl font-bold">Address</h2>
      <p>{address || 'Loading...'}</p>
    </div>
  );
}

function UtxoDisplay() {
  const [utxos, setUtxos] = useState<OwnedUtxoJSON[]>([]);

  const fetchUtxos = () => {
    fetch(`${baseURL}/utxos`, {
      headers: {
        'Authorization': getBasicAuthHeader(scanUsername, scanPassword),
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setUtxos(data);
      })
      .catch((error) => {
        console.error('Error fetching UTXOs:', error);
      });
  }

  const downloadUtxos = () => {
    if (utxos.length === 0) {
      alert('No UTXOs to download.');
      return;
    }

    // Convert UTXOs to JSON string
    const dataStr = JSON.stringify(utxos, null, 2);
    // Create a Blob with the JSON data
    const blob = new Blob([dataStr], { type: 'application/json' });
    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a link element
    const link = document.createElement('a');
    link.href = url;
    link.download = 'utxos.json';
    // Append to the document to make it work in Firefox
    document.body.appendChild(link);
    // Trigger the download
    link.click();
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchUtxos();
    const interval = setInterval(fetchUtxos, 60000);
    return () => clearInterval(interval);
  }, []);


  return (
    <div className="my-4">
      <h2 className="text-xl font-bold">UTXOs</h2>
      {utxos.length > 0 ? (
        <ul>
          {utxos.slice(0, 5).filter((utxo) => utxo.utxo_state == 'unspent' || utxo.utxo_state == 'unconfirmed' ).map((utxo, index) => (
            <li key={index} className="border-b py-2">
              <p>
                <strong>TxID:</strong> {utxo.txid}
              </p>
              <p>
                <strong>Vout:</strong> {utxo.vout}
              </p>
              <p>
                <strong>Amount:</strong> {utxo.amount} sats
              </p>
              {utxo.label ? (
                <>
                  <p>
                    <strong>Label (Address):</strong> {utxo.label.address}
                  </p>
                  <p>
                    <strong>Label (m):</strong> {utxo.label.m}
                  </p>
                </>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p>No UTXOs available</p>
      )}
      <Button
        onClick={downloadUtxos}
        disabled={utxos.length === 0}
        className="mb-4"
        color={utxos.length > 0 ? 'blue' : 'gray'}
      >
        Download UTXOs JSON
      </Button>
    </div>
  );
}

function SetupKeysForm() {
  const [scanSecret, setScanSecret] = useState('');
  const [spendPublic, setSpendPublic] = useState('');
  const [birthHeight, setBirthHeight] = useState<number>(840000);
  const [responseMessage, setResponseMessage] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    fetch(`${baseURL}/new-keys`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getBasicAuthHeader(scanUsername, scanPassword),
      },
      body: JSON.stringify({
        secret_sec: scanSecret,
        spend_pub: spendPublic,
        birth_height: birthHeight,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.address) {
          setResponseMessage(`Address: ${data.address}`);
        } else if (data.err) {
          setResponseMessage(`Error: ${data.err}`);
        }
      })
      .catch((error) => {
        console.error('Error submitting keys:', error);
        setResponseMessage('An error occurred while submitting the keys.');
      });
  };

  return (
    <div className="my-4">
      <h2 className="text-xl font-bold">Setup New Keys</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Scan Secret"
          value={scanSecret}
          onChange={(e) => setScanSecret(e.target.value)}
          required
        />
        <Input
          label="Spend Public"
          value={spendPublic}
          onChange={(e) => setSpendPublic(e.target.value)}
          required
        />
        <Input
          type="number"
          label="Birth Height"
          value={birthHeight}
          onChange={(e) => setBirthHeight(Number(e.target.value))}
          required
        />
        <Button type="submit" color="blue">
          Submit
        </Button>
      </form>
      {responseMessage && (
        <div className="flex flex-col mt-4">
          <p>{responseMessage}</p>
          <div>Please refresh the page to see all the changes</div>
        </div>
      )}
    </div>
  );
}

function getBasicAuthHeader(username: string, password: string): string {
  const credentials = `${username}:${password}`;
  const encodedCredentials = btoa(credentials); // btoa is available in the browser
  return `Basic ${encodedCredentials}`;
}
