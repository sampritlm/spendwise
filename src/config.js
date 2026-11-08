/**
 * SpendWise Application Configuration
 * 
 * Supports switching between local mock prototype mode and live AWS Serverless 
 * (API Gateway -> Lambda -> DynamoDB) backend.
 */

// Allow runtime override via localStorage for demo purposes without needing to rebuild
const storedApiUrl = typeof window !== 'undefined' ? localStorage.getItem('spendwise_api_url') : null;
const storedUseMock = typeof window !== 'undefined' ? localStorage.getItem('spendwise_use_mock') : null;

export const config = {
  // Base URL for AWS API Gateway HTTP API
  apiBaseUrl: storedApiUrl || import.meta.env.VITE_API_BASE_URL || '',
  
  // Flag indicating whether to use local mock data & localStorage
  useMockApi: storedUseMock !== null 
    ? storedUseMock === 'true' 
    : (import.meta.env.VITE_USE_MOCK_API !== 'false' || !import.meta.env.VITE_API_BASE_URL),
    
  awsRegion: import.meta.env.VITE_AWS_REGION || 'ap-south-1',

  // Razorpay Gateway Integration
  razorpayKeyId: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_TxKEnjiiKSTa2q',
  
  // Currency defaults
  defaultCurrency: 'INR',
  currencySymbol: '₹',
  
  // App metadata
  appName: 'SpendWise',
  appSubtitle: 'Smart Expense Tracker',
  appVersion: '1.0.0 (AWS Serverless FaaS Demo)'
};

export const updateRuntimeConfig = (apiUrl, useMock) => {
  if (typeof window !== 'undefined') {
    if (apiUrl !== undefined) {
      localStorage.setItem('spendwise_api_url', apiUrl);
      config.apiBaseUrl = apiUrl;
    }
    if (useMock !== undefined) {
      localStorage.setItem('spendwise_use_mock', String(useMock));
      config.useMockApi = Boolean(useMock);
    }
  }
};

