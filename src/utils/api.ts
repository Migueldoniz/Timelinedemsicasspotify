import { projectId, publicAnonKey } from './supabase/info';
import { getSession } from './auth';

const baseUrl = `https://${projectId}.supabase.co/functions/v1/server`;

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

export interface Song {
  id: string;
  title: string;
  artist: string;
  spotifyUri: string;
}

export interface Moment {
  id: number;
  label: string;
  description: string;
  songs: Song[];
}

export interface Timeline {
  id: string;
  title: string;
  description: string;
  moments: Moment[];
  createdAt: string;
  updatedAt: string;
}

export async function getTimelines(): Promise<Timeline[]> {
  const data = await fetchWithAuth(`${baseUrl}/timelines`);
  return data.timelines;
}

export async function getTimeline(id: string): Promise<Timeline> {
  const data = await fetchWithAuth(`${baseUrl}/timelines/${id}`);
  return data.timeline;
}

export async function createTimeline(timeline: Partial<Timeline>): Promise<Timeline> {
  const data = await fetchWithAuth(`${baseUrl}/timelines`, {
    method: 'POST',
    body: JSON.stringify(timeline),
  });
  return data.timeline;
}

export async function updateTimeline(id: string, timeline: Partial<Timeline>): Promise<Timeline> {
  const data = await fetchWithAuth(`${baseUrl}/timelines/${id}`, {
    method: 'PUT',
    body: JSON.stringify(timeline),
  });
  return data.timeline;
}

export async function deleteTimeline(id: string): Promise<void> {
  await fetchWithAuth(`${baseUrl}/timelines/${id}`, {
    method: 'DELETE',
  });
}
