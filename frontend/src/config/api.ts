/// <reference types="vite/client" />

/**
 * Centralized API Configuration & Endpoints
 * Supports both local Vite Proxy and remote deployed backend URLs via .env
 */

export const API_BASE_URL: string = (import.meta.env?.VITE_API_URL as string) || '';

export const API_ENDPOINTS = {
  campusStatus: `${API_BASE_URL}/api/campus-status`,
  resolveLeak: `${API_BASE_URL}/api/resolve-leak`,
  triggerDemoLeak: `${API_BASE_URL}/api/trigger-demo-leak`,
  campusHistory: `${API_BASE_URL}/api/campus-history`,
  auditLogs: `${API_BASE_URL}/api/audit-logs`,
  leaderboard: `${API_BASE_URL}/api/leaderboard`,
  messForecast: (params: string) => `${API_BASE_URL}/api/mess-forecast${params}`,
  scanPlate: `${API_BASE_URL}/api/scan-plate`,
};
