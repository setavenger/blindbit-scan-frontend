import { Config } from "../../context/ConfigContext";

export async function GET() {
  const config: Config = {
    baseURL: process.env.NEXT_PUBLIC_BLINDBIT_SCAN_BASE_URL || 'error: not loaded',
    scanUsername: process.env.NEXT_PUBLIC_BLINDBIT_SCAN_USER || 'error: not loaded',
    scanPassword: process.env.NEXT_PUBLIC_BLINDBIT_SCAN_PASSWORD || 'error: not loaded',
    torBaseURL: process.env.NEXT_PUBLIC_BLINDBIT_SCAN_TOR_BASE_URL || 'error: not loaded',
    blindbitScanPort: Number(process.env.NEXT_PUBLIC_BLINDBIT_SCAN_PORT) || 0,
  };
  
  return Response.json(config);
}

export const dynamic = 'force-dynamic'

