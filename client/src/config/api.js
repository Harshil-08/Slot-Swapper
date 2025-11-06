// API Configuration
const isProduction = import.meta.env.PROD;
export const API_BASE_URL = isProduction 
  ? '' 
  : 'http://localhost:3000';

export const SOCKET_URL = isProduction
  ? window.location.origin 
  : 'http://localhost:3000';
