// API Service Layer

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers?: Record<string, string>;
}

export class ApiService {
  private client: AxiosInstance;
  private token: string | null = null;
  private isRefreshing: boolean = false;
  private failedQueue: any[] = [];

  // Activity-based refresh configuration
  private lastRefreshTime: number = Date.now();
  private lastActivityTime: number = Date.now();
  private readonly REFRESH_THRESHOLD_MS = 10 * 60 * 1000; // Refresh if token is 10+ minutes old
  private readonly ACTIVITY_CHECK_INTERVAL_MS = 60 * 1000; // Check activity every 1 minute
  private activityCheckInterval: NodeJS.Timeout | null = null;
  private activityListenersAttached: boolean = false;

  constructor(config: ApiConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      withCredentials: true, // Enable cookies for refresh token
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });

    this.setupInterceptors();
  }

  private processQueue(error: any, token: string | null = null): void {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });

    this.failedQueue = [];
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Check if Canvas re-authentication is required (Canvas OAuth token expired)
        if (error.response?.status === 401 && this.isCanvasReauthRequired(error)) {
          console.warn('Canvas re-authentication required');
          this.handleCanvasReauthRequired();
          return Promise.reject(error);
        }

        // Don't retry refresh endpoint or if it's already a retry
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
          if (this.isRefreshing) {
            // If already refreshing, queue this request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.client.request(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;

          try {
            await this.refreshToken();
            this.processQueue(null, this.token);
            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${this.token}`;
            return this.client.request(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            // Refresh failed - session expired, redirect with friendly message
            this.handleSessionExpired();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  setToken(token: string): void {
    this.token = token;
    this.lastRefreshTime = Date.now();
    // Start activity monitoring when token is set
    this.startActivityMonitoring();
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken(): void {
    this.token = null;
    // Stop activity monitoring
    this.stopActivityMonitoring();
    // Clear any auth-related localStorage items
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('vt-ai-auth-user');
  }

  /**
   * Start monitoring user activity for proactive token refresh.
   * This prevents unexpected session expiry for active users.
   */
  private startActivityMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Attach activity listeners if not already attached
    if (!this.activityListenersAttached) {
      const activityHandler = this.handleUserActivity.bind(this);
      window.addEventListener('click', activityHandler, { passive: true });
      window.addEventListener('keydown', activityHandler, { passive: true });
      window.addEventListener('scroll', activityHandler, { passive: true });
      window.addEventListener('mousemove', this.throttledActivityHandler.bind(this), { passive: true });
      this.activityListenersAttached = true;
    }

    // Start periodic check for proactive refresh
    if (!this.activityCheckInterval) {
      this.activityCheckInterval = setInterval(() => {
        this.checkAndRefreshIfNeeded();
      }, this.ACTIVITY_CHECK_INTERVAL_MS);
    }
  }

  /**
   * Stop activity monitoring (called on logout/token clear)
   */
  private stopActivityMonitoring(): void {
    if (this.activityCheckInterval) {
      clearInterval(this.activityCheckInterval);
      this.activityCheckInterval = null;
    }
    // Note: We don't remove event listeners to avoid complexity
    // They will simply do nothing when token is null
  }

  /**
   * Handle user activity - update last activity timestamp
   */
  private handleUserActivity(): void {
    this.lastActivityTime = Date.now();
  }

  /**
   * Throttled handler for high-frequency events like mousemove
   */
  private mouseMoveThrottleTime: number = 0;
  private throttledActivityHandler(): void {
    const now = Date.now();
    if (now - this.mouseMoveThrottleTime > 5000) { // Throttle to every 5 seconds
      this.mouseMoveThrottleTime = now;
      this.handleUserActivity();
    }
  }

  /**
   * Check if we should proactively refresh the token.
   * Refreshes if:
   * 1. User has been active recently (within last 2 minutes)
   * 2. Token is older than REFRESH_THRESHOLD_MS (10 minutes)
   * 3. Not already refreshing
   */
  private async checkAndRefreshIfNeeded(): Promise<void> {
    if (!this.token || this.isRefreshing) return;

    const now = Date.now();
    const timeSinceLastRefresh = now - this.lastRefreshTime;
    const timeSinceLastActivity = now - this.lastActivityTime;

    // Only refresh if user was active in the last 2 minutes
    const isUserActive = timeSinceLastActivity < 2 * 60 * 1000;
    // And token is getting stale (older than threshold)
    const isTokenStale = timeSinceLastRefresh > this.REFRESH_THRESHOLD_MS;

    if (isUserActive && isTokenStale) {
      try {
        await this.refreshToken();
      } catch (error) {
        // Proactive refresh failed - don't redirect yet
        // The reactive refresh on 401 will handle it
        console.debug('Proactive token refresh failed, will retry on next API call');
      }
    }
  }

  private async refreshToken(): Promise<void> {
    this.isRefreshing = true;
    try {
      // Refresh token is in HTTP-only cookie, no need to send it in body
      const response = await this.client.post('/auth/refresh');

      // Extract access token from response
      const responseData = response.data;
      if (responseData && responseData.data && responseData.data.accessToken) {
        this.token = responseData.data.accessToken;
        this.lastRefreshTime = Date.now();
      } else {
        throw new Error('No access token in refresh response');
      }
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Handle session expiry - redirect to login with friendly message
   */
  private handleSessionExpired(): void {
    this.clearToken();
    // Redirect to login with session expired flag for friendly message
    window.location.href = '/login?sessionExpired=true';
  }

  /**
   * Handle Canvas re-authentication required.
   * This is called when the Canvas OAuth token has expired and cannot be refreshed.
   */
  private handleCanvasReauthRequired(): void {
    // Redirect to login with Canvas re-auth flag
    // The user needs to re-authenticate with Canvas OAuth
    window.location.href = '/login?canvasReauthRequired=true';
  }

  /**
   * Check if an error response indicates Canvas re-authentication is required
   */
  private isCanvasReauthRequired(error: any): boolean {
    const errorData = error.response?.data?.data;
    return errorData?.errorCode === 'CANVAS_REAUTH_REQUIRED';
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }

  // Method to get full response (including non-data fields)
  async getFullResponse<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get(url, config);
    return response.data; // This returns the full response data object
  }
}

// Create singleton instance
// Default timeout of 60 seconds for slow Canvas API operations
if (!process.env.REACT_APP_API_BASE_URL) {
  throw new Error('REACT_APP_API_BASE_URL environment variable is required. Please set it in your .env file.');
}

const apiConfig: ApiConfig = {
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || '60000'),
};

// Log the baseURL for debugging (remove in production)
console.log('API Base URL:', apiConfig.baseURL);

export const apiService = new ApiService(apiConfig);

// Token is managed in memory and via HTTP-only cookies
// No need to initialize from localStorage
