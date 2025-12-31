# Configuração do Spotify

Para usar a funcionalidade de login e reprodução do Spotify, você precisa criar um aplicativo no Spotify Developer Dashboard.

## Passos para configurar:

### 1. Criar um aplicativo no Spotify

1. Acesse: https://developer.spotify.com/dashboard
2. Faça login com sua conta Spotify
3. Clique em "Create app"
4. Preencha os campos:
   - **App name**: Timeline Musical (ou o nome que preferir)
   - **App description**: Aplicativo para criar timelines musicais
   - **Redirect URI**: `https://SEU_PROJECT_ID.supabase.co/functions/v1/make-server-f629248c/spotify/callback`
     - Substitua `SEU_PROJECT_ID` pelo ID real do seu projeto Supabase
   - **APIs used**: Marque "Web Playback SDK"
5. Aceite os termos e clique em "Save"

### 2. Obter as credenciais

1. Na página do seu app, você verá:
   - **Client ID**: Copie este valor
   - **Client Secret**: Clique em "View client secret" e copie

### 3. Configurar no Figma Make

1. Cole o **Client ID** quando solicitado
2. Cole o **Client Secret** quando solicitado

### 4. Requisitos

- O usuário precisa ter **Spotify Premium** para usar o Web Playback SDK
- Sem Spotify Premium, as músicas serão exibidas usando o player embed (somente visualização)

## Testando

Depois de configurar:

1. Vá em "Configurações" no dashboard
2. Clique em "Conectar com Spotify"
3. Faça login com sua conta Spotify Premium
4. Autorize o aplicativo
5. Agora você pode reproduzir músicas diretamente!
