
import { useEffect, useState } from "react";
import { getBasicAuthHeader } from "./utils";
import { useConfig } from "../context/ConfigContext";
import { Button } from "@material-tailwind/react";

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

export function UtxoDisplay() {
  const { baseURL, scanUsername, scanPassword } = useConfig();
  const [utxos, setUtxos] = useState<OwnedUtxoJSON[]>([]);
  const [fullExpanded, setFullExpanded] = useState(false);

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
  }, [baseURL]);

  return (
    <div className="my-4">
      <div className={"flex flex-row space-x-12"}>
        <h2 className="text-xl font-bold">UTXOs</h2>
        {/*@ts-expect-error incomplete props*/}
        <Button
          onClick={downloadUtxos}
          size="md"
          className={"!mt-0"}
          disabled={utxos.length === 0}
          color={utxos.length > 0 ? 'blue' : 'gray'}
        >
          Download UTXOs JSON
        </Button>
      </div>
      {utxos.length > 0 ? (
        <ul>
          {utxos.filter((utxo) => utxo.utxo_state == 'unspent' || utxo.utxo_state == 'unconfirmed' ).slice(0, fullExpanded ? utxos.length : 5).map((utxo, index) => (
            <li key={index} className="border-b py-2">
              <p>
                <strong>TxID:</strong> {utxo.txid}
              </p>
              <p>
                <strong>Vout:</strong> {utxo.vout}
              </p>
              <p>
                <strong>Amount:</strong> {utxo.amount.toLocaleString(undefined, {maximumFractionDigits: 0})} sats {utxo.label && utxo.label.m === 0 ? "(change)" : null}
              </p>
              {utxo.label && utxo.label.m !== 0 ? (
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
      {/*@ts-expect-error incomplete props*/}
      <Button
        onClick={() => setFullExpanded(!fullExpanded)}
        size="md"
        className="!mt-0"
        color="blue-gray"
      >
        {fullExpanded ? "show less" : "show more"}
      </Button>
    </div>
  );
}
