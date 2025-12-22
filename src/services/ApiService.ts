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
          this.isRefreshing = true;

          try {
            await this.refreshToken();
            this.processQueue(null, this.token);
            this.isRefreshing = false;
            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${this.token}`;
            return this.client.request(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            this.isRefreshing = false;
            // Refresh failed, redirect to login
            this.clearToken();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  setToken(token: string): void {
    this.token = token;
    // Don't store token in localStorage for security
    // Token is in memory only, refresh token is in HTTP-only cookie
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken(): void {
    this.token = null;
    // Clear any auth-related localStorage items
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  }

  private async refreshToken(): Promise<void> {
    // Refresh token is in HTTP-only cookie, no need to send it in body
    const response = await this.client.post('/auth/refresh');

    // Extract access token from response
    const responseData = response.data;
    if (responseData && responseData.data && responseData.data.accessToken) {
      this.setToken(responseData.data.accessToken);
    } else {
      throw new Error('No access token in refresh response');
    }
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
const apiConfig: ApiConfig = {
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3167/api',
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || '60000'),
};

export const apiService = new ApiService(apiConfig);

// Token is managed in memory and via HTTP-only cookies
// No need to initialize from localStorage
