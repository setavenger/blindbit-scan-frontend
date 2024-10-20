import { useEffect, useState } from "react";
import { getBasicAuthHeader } from "./utils";
import { useConfig } from "../context/ConfigContext";


export function HeightDisplay() {
  const { baseURL, scanUsername, scanPassword } = useConfig();
  const [height, setHeight] = useState<number | null>(null);


  useEffect(() => {
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
