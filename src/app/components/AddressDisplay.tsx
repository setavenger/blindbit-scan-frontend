import { useEffect, useState } from "react";
import { getBasicAuthHeader } from "./utils";
import { useConfig } from "../context/ConfigContext";

export function AddressDisplay() {
  const { baseURL, scanUsername, scanPassword } = useConfig();
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
  }, [baseURL]);

  return (
    <div className="my-4">
      <h2 className="text-xl font-bold">Address</h2>
      <p>{address || 'Loading...'}</p>
    </div>
  );
}

