
/**
 * Utility functions for implementing Spotify PKCE authentication flow
 */

// Generate a random string for the state parameter
export function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values)
    .map(x => possible[x % possible.length])
    .join('');
}

// Generate a code verifier (random string between 43-128 characters)
export function generateCodeVerifier(): string {
  return generateRandomString(64);
}

// Generate a code challenge from the code verifier
export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  // Hash the code verifier using SHA-256
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  
  // Convert the hash to base64-url format
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Store PKCE values in localStorage
export function storePkceValues(codeVerifier: string, state: string): void {
  localStorage.setItem('spotify_code_verifier', codeVerifier);
  localStorage.setItem('spotify_state', state);
}

// Retrieve PKCE values from localStorage
export function getPkceValues(): { codeVerifier: string | null, state: string | null } {
  return {
    codeVerifier: localStorage.getItem('spotify_code_verifier'),
    state: localStorage.getItem('spotify_state')
  };
}

// Clear PKCE values from localStorage
export function clearPkceValues(): void {
  localStorage.removeItem('spotify_code_verifier');
  localStorage.removeItem('spotify_state');
}
