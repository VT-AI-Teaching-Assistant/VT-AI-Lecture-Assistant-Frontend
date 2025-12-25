/**
 * OAuth Configuration for Canvas LMS Integration
 * Using fake_oauth_canvas for development/testing
 *
 * SECURITY NOTE: Token exchange is now handled by the backend.
 * The client_secret is never exposed to the frontend.
 */

export const oauthConfig = {
  // fake_oauth_canvas server URL
  authServerUrl: process.env.REACT_APP_OAUTH_SERVER_URL || 'http://localhost:8457',

  // OAuth client ID (public, safe to include in frontend)
  clientId: process.env.REACT_APP_OAUTH_CLIENT_ID || 'vt-ai-lecture-assistant',

  // Redirect URI for OAuth callback
  redirectUri: process.env.REACT_APP_OAUTH_REDIRECT_URI || 'http://localhost:3000/auth/callback',

  // OAuth scopes (not strictly enforced by fake_oauth_canvas)
  scope: 'url:GET|/api/v1/courses url:GET|/api/v1/users/:user_id',

  // OAuth endpoints
  endpoints: {
    authorize: '/login/oauth2/auth',
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
 * Generates a cryptographically secure state parameter for CSRF protection
 */
export function generateOAuthState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

