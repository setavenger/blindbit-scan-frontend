
export function getBasicAuthHeader(username: string, password: string): string {
  const credentials = `${username}:${password}`;
  const encodedCredentials = btoa(credentials); // btoa is available in the browser
  return `Basic ${encodedCredentials}`;
}

