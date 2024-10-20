import { useState } from "react";
import { getBasicAuthHeader } from "./utils";
import { useConfig } from "../context/ConfigContext";
import { Button, Input } from "@material-tailwind/react";

export function SetupKeysForm() {
  const { baseURL, scanUsername, scanPassword } = useConfig();
  const [scanSecret, setScanSecret] = useState('');
  const [spendPublic, setSpendPublic] = useState('');
  const [birthHeight, setBirthHeight] = useState<number>(840000);
  const [responseMessage, setResponseMessage] = useState<string>('');

  const handleSubmit = () => {
    const scanKey = scanSecret.trim()
    const spendKey = spendPublic.trim()

    if (scanKey.length !== 64) {
      alert("scan secret key must be exactly 32 bytes (64 hex characters)")
      return
    }

    if (spendKey.length !== 66) {
      alert("spend public key must be exactly 33 bytes (66 hex characters)")
      return
    }

    const approved = confirm("This will reset BlindBit Scan and trigger a rescan.")
    if (!approved) return;

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
        {/*@ts-expect-error incomplete props*/}
        <Input
          label="Scan Secret"
          value={scanSecret}
          onChange={(e) => setScanSecret(e.target.value)}
          required
        />
        {/*@ts-expect-error incomplete props*/}
        <Input
          label="Spend Public"
          value={spendPublic}
          onChange={(e) => setSpendPublic(e.target.value)}
          required
        />
        {/*@ts-expect-error incomplete props*/}
        <Input
          type="number"
          label="Birth Height"
          value={birthHeight}
          onChange={(e) => setBirthHeight(Number(e.target.value))}
          required
        />
        {/*@ts-expect-error incomplete props*/}
        <Button color="blue" onClick={handleSubmit}>
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

