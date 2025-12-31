import { projectId, publicAnonKey } from './supabase/info';
import { getSession } from './auth';

const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-f629248c`;

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const session = await getSession();
  const token = session?.access_token;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token || publicAnonKey}`,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }
  
  return response.json();
}

export async function getSpotifyAuthUrl(): Promise<string> {
  const data = await fetchWithAuth(`${baseUrl}/spotify/auth`);
  return data.authUrl;
}

export async function getSpotifyToken(): Promise<string | null> {
  try {
    const data = await fetchWithAuth(`${baseUrl}/spotify/token`);
    return data.access_token;
  } catch (error) {
    return null;
  }
}

export async function disconnectSpotify(): Promise<void> {
  await fetchWithAuth(`${baseUrl}/spotify/disconnect`, {
    method: 'DELETE',
  });
}

export async function checkSpotifyConnection(): Promise<boolean> {
  try {
    const token = await getSpotifyToken();
    return token !== null;
  } catch {
    return false;
  }
}
