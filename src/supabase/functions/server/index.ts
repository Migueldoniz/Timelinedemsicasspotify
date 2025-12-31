import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono().basePath('/server');

app.use('*', logger(console.log));
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-client-info', 'x-supabase-api-version'],
}));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Helper para verificar autenticação
async function verifyUser(request: Request) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return { error: 'No token provided', user: null };
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    return { error: 'Unauthorized', user: null };
  }
  
  return { error: null, user };
}

// Registro de usuário
app.post('/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password || !name) {
      return c.json({ error: 'Email, password and name are required' }, 400);
    }
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: false, // Auto-confirma email pois servidor de email não está configurado
    });
    
    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }
    
    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.log('Signup exception:', error);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// Listar timelines do usuário
app.get('/timelines', async (c) => {
  try {
    const { error: authError, user } = await verifyUser(c.req.raw);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const timelinesKey = `user:${user.id}:timelines`;
    const timelineIds = await kv.get(timelinesKey) || [];
    
    const timelines = [];
    for (const id of timelineIds) {
      const timeline = await kv.get(`user:${user.id}:timeline:${id}`);
      if (timeline) {
        timelines.push(timeline);
      }
    }
    
    return c.json({ timelines });
  } catch (error) {
    console.log('Error fetching timelines:', error);
    return c.json({ error: 'Failed to fetch timelines' }, 500);
  }
});

// Buscar timeline específica
app.get('/timelines/:id', async (c) => {
  try {
    const { error: authError, user } = await verifyUser(c.req.raw);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const timelineId = c.req.param('id');
    const timeline = await kv.get(`user:${user.id}:timeline:${timelineId}`);
    
    if (!timeline) {
      return c.json({ error: 'Timeline not found' }, 404);
    }
    
    return c.json({ timeline });
  } catch (error) {
    console.log('Error fetching timeline:', error);
    return c.json({ error: 'Failed to fetch timeline' }, 500);
  }
});

// Criar nova timeline
app.post('/timelines', async (c) => {
  try {
    const { error: authError, user } = await verifyUser(c.req.raw);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { title, description, moments } = await c.req.json();
    
    if (!title) {
      return c.json({ error: 'Title is required' }, 400);
    }
    
    const timelineId = crypto.randomUUID();
    const timeline = {
      id: timelineId,
      title,
      description: description || '',
      moments: moments || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Salvar timeline
    await kv.set(`user:${user.id}:timeline:${timelineId}`, timeline);
    
    // Adicionar ID à lista de timelines do usuário
    const timelinesKey = `user:${user.id}:timelines`;
    const timelineIds = await kv.get(timelinesKey) || [];
    timelineIds.push(timelineId);
    await kv.set(timelinesKey, timelineIds);
    
    return c.json({ timeline });
  } catch (error) {
    console.log('Error creating timeline:', error);
    return c.json({ error: 'Failed to create timeline' }, 500);
  }
});

// Atualizar timeline
app.put('/timelines/:id', async (c) => {
  try {
    const { error: authError, user } = await verifyUser(c.req.raw);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const timelineId = c.req.param('id');
    const existingTimeline = await kv.get(`user:${user.id}:timeline:${timelineId}`);
    
    if (!existingTimeline) {
      return c.json({ error: 'Timeline not found' }, 404);
    }
    
    const { title, description, moments } = await c.req.json();
    
    const updatedTimeline = {
      ...existingTimeline,
      title: title ?? existingTimeline.title,
      description: description ?? existingTimeline.description,
      moments: moments ?? existingTimeline.moments,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`user:${user.id}:timeline:${timelineId}`, updatedTimeline);
    
    return c.json({ timeline: updatedTimeline });
  } catch (error) {
    console.log('Error updating timeline:', error);
    return c.json({ error: 'Failed to update timeline' }, 500);
  }
});

// Deletar timeline
app.delete('/timelines/:id', async (c) => {
  try {
    const { error: authError, user } = await verifyUser(c.req.raw);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const timelineId = c.req.param('id');
    
    // Remover timeline
    await kv.del(`user:${user.id}:timeline:${timelineId}`);
    
    // Remover da lista de timelines
    const timelinesKey = `user:${user.id}:timelines`;
    const timelineIds = await kv.get(timelinesKey) || [];
    const updatedIds = timelineIds.filter((id: string) => id !== timelineId);
    await kv.set(timelinesKey, updatedIds);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting timeline:', error);
    return c.json({ error: 'Failed to delete timeline' }, 500);
  }
});

// Iniciar autenticação com Spotify
app.get('/spotify/auth', async (c) => {
  try {
    const { error: authError, user } = await verifyUser(c.req.raw);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const clientId = Deno.env.get('SPOTIFY_CLIENT_ID');
    const functionName = "server"; // ou o nome correto
    const redirectUri = `${c.req.url.split('/' + functionName)[0]}/${functionName}/spotify/callback`;
    
    const scope = 'user-read-private user-read-email streaming user-read-playback-state user-modify-playback-state';
    const state = user.id; // Usar user ID como state
    
    const authUrl = `https://accounts.spotify.com/authorize?` +
      `response_type=code&` +
      `client_id=${clientId}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `state=${state}`;
    
    return c.json({ authUrl });
  } catch (error) {
    console.log('Error creating Spotify auth URL:', error);
    return c.json({ error: 'Failed to create auth URL' }, 500);
  }
});

// Callback do Spotify OAuth
app.get('/spotify/callback', async (c) => {
  try {
    const code = c.req.query('code');
    const state = c.req.query('state'); // user ID
    const error = c.req.query('error');
    
    if (error) {
      return c.redirect(`/?spotify_error=${error}`);
    }
    
    if (!code || !state) {
      return c.redirect('/?spotify_error=missing_code');
    }
    
    const clientId = Deno.env.get('SPOTIFY_CLIENT_ID');
    const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET');
    const functionName = "server"; // ou o nome correto
    const redirectUri = `${c.req.url.split('/server')[0]}/server/spotify/callback`;
    
    // Trocar code por access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
      }),
    });
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.log('Spotify token error:', errorData);
      return c.redirect('/?spotify_error=token_failed');
    }
    
    const tokens = await tokenResponse.json();
    
    // Salvar tokens no KV store
    await kv.set(`user:${state}:spotify_tokens`, {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Date.now() + (tokens.expires_in * 1000),
    });
    
    return c.redirect('/?spotify_connected=true');
  } catch (error) {
    console.log('Error in Spotify callback:', error);
    return c.redirect('/?spotify_error=callback_failed');
  }
});

// Obter access token do Spotify (com refresh se necessário)
app.get('/spotify/token', async (c) => {
  try {
    const { error: authError, user } = await verifyUser(c.req.raw);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const tokens = await kv.get(`user:${user.id}:spotify_tokens`);
    
    if (!tokens) {
      return c.json({ error: 'Not connected to Spotify' }, 404);
    }
    
    // Verificar se o token expirou
    if (Date.now() >= tokens.expires_at) {
      // Refresh token
      const clientId = Deno.env.get('SPOTIFY_CLIENT_ID');
      const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET');
      
      const refreshResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: tokens.refresh_token,
        }),
      });
      
      if (!refreshResponse.ok) {
        console.log('Failed to refresh Spotify token');
        return c.json({ error: 'Failed to refresh token' }, 500);
      }
      
      const newTokens = await refreshResponse.json();
      
      // Atualizar tokens
      const updatedTokens = {
        access_token: newTokens.access_token,
        refresh_token: newTokens.refresh_token || tokens.refresh_token,
        expires_at: Date.now() + (newTokens.expires_in * 1000),
      };
      
      await kv.set(`user:${user.id}:spotify_tokens`, updatedTokens);
      
      return c.json({ access_token: updatedTokens.access_token });
    }
    
    return c.json({ access_token: tokens.access_token });
  } catch (error) {
    console.log('Error getting Spotify token:', error);
    return c.json({ error: 'Failed to get token' }, 500);
  }
});

// Desconectar do Spotify
app.delete('/spotify/disconnect', async (c) => {
  try {
    const { error: authError, user } = await verifyUser(c.req.raw);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    await kv.del(`user:${user.id}:spotify_tokens`);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Error disconnecting Spotify:', error);
    return c.json({ error: 'Failed to disconnect' }, 500);
  }
});

Deno.serve(app.fetch);
