/**
 * OAuth Configuration for Canvas LMS Integration
 * Using fake_oauth_canvas for development/testing
 */

export const oauthConfig = {
  // fake_oauth_canvas server URL
  authServerUrl: process.env.REACT_APP_OAUTH_SERVER_URL || 'http://localhost:8457',
  
  // OAuth client credentials
  clientId: process.env.REACT_APP_OAUTH_CLIENT_ID || 'vt-ai-lecture-assistant',
  clientSecret: process.env.REACT_APP_OAUTH_CLIENT_SECRET || 'fake-client-secret',
  
  // Redirect URI for OAuth callback
  redirectUri: process.env.REACT_APP_OAUTH_REDIRECT_URI || 'http://localhost:3000/auth/callback',
  
  // OAuth scopes (not strictly enforced by fake_oauth_canvas)
  scope: 'url:GET|/api/v1/courses url:GET|/api/v1/users/:user_id',
  
  // OAuth endpoints
  endpoints: {
    authorize: '/login/oauth2/auth',
    token: '/login/oauth2/token',
    userInfo: '/api/v1/users/self',
  }
};

/**
 * Generates the OAuth authorization URL
 */
export function getAuthorizationUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: oauthConfig.clientId,
    response_type: 'code',
    redirect_uri: oauthConfig.redirectUri,
    scope: oauthConfig.scope,
  });

  if (state) {
    params.append('state', state);
  }

  return `${oauthConfig.authServerUrl}${oauthConfig.endpoints.authorize}?${params.toString()}`;
}

/**
 * Exchanges authorization code for access token
 */
export interface TokenResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  expires_in: number;
  user?: {
    id: number;
    name: string;
    email?: string;
  };
}

export async function exchangeCodeForToken(code: string): Promise<TokenResponse> {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: oauthConfig.clientId,
    client_secret: oauthConfig.clientSecret,
    redirect_uri: oauthConfig.redirectUri,
    code: code,
  });

  const response = await fetch(`${oauthConfig.authServerUrl}${oauthConfig.endpoints.token}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange authorization code for token');
  }

  return await response.json();
}

