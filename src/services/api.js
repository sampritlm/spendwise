import { config } from '../config';

/**
 * Low-level HTTP API client for SpendWise
 * Communicates with Amazon API Gateway (HTTP API) backing AWS Lambda functions.
 */
class ApiClient {
  constructor() {
    this.timeoutMs = 10000;
  }

  /**
   * Helper to construct full URL for API Gateway endpoints
   * @param {string} endpoint 
   */
  getUrl(endpoint) {
    const base = config.apiBaseUrl ? config.apiBaseUrl.replace(/\/+$/, '') : '';
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${base}${path}`;
  }

  /**
   * Universal fetch wrapper with timeout and standardized error handling
   * @param {string} endpoint 
   * @param {RequestInit} options 
   */
  async request(endpoint, options = {}) {
    const url = this.getUrl(endpoint);
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle non-2xx HTTP responses
      if (!response.ok) {
        let errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
        try {
          const errData = await response.json();
          if (errData && errData.message) {
            errorMessage = errData.message;
          }
        } catch {
          // If response body is not JSON, use status text
        }
        throw new Error(errorMessage);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return { success: true };
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('API Request timed out. Please check your AWS API Gateway status.');
      }
      throw error;
    }
  }

  get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  post(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  delete(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
export default api;

