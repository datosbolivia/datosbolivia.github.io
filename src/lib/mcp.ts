import {
  DataMeshMcpClient,
  type McpServerConfig,
} from '@datosbolivia/datamesh-client';

export type { McpServerConfig };
export { DataMeshMcpClient };

export interface McpToolCallRequest {
  tool: string;
  arguments: Record<string, any>;
}

export interface McpToolCallResponse<T = any> {
  result?: T;
  content?: Array<{ type: string; text?: string; data?: any }>;
  isError?: boolean;
  error?: string;
}

/**
 * Obtiene la URL por defecto del backend/MCP configurada en variables de entorno.
 */
export function getDefaultBackendUrl(): string {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const saved = window.localStorage.getItem('datamesh_mcp_url');
      if (saved) return saved;
    } catch {}
  }
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.PUBLIC_DATAMESH_MCP_URL) {
    return (import.meta as any).env.PUBLIC_DATAMESH_MCP_URL;
  }
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.PUBLIC_DATAMESH_BACKEND_URL) {
    return (import.meta as any).env.PUBLIC_DATAMESH_BACKEND_URL;
  }
  if (typeof process !== 'undefined' && process.env?.DATAMESH_MCP_URL) {
    return process.env.DATAMESH_MCP_URL;
  }
  return 'http://localhost:8000/mcp';
}

/**
 * Instancia singleton por defecto para uso directo en scripts y navegador.
 */
export const datameshMcp = new DataMeshMcpClient({ serverUrl: getDefaultBackendUrl() });

/**
 * Comprueba si la conexión al servidor MCP / Backend está habilitada globalmente.
 */
export function isMcpEnabled(): boolean {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const saved = window.localStorage.getItem('datamesh_mcp_enabled');
      if (saved !== null) {
        return saved === 'true';
      }
    } catch {}
  }
  return true; // Habilitado por defecto si existe backend local
}

/**
 * Habilita o deshabilita la conexión al servidor MCP / Backend (persiste en localStorage).
 */
export function setMcpEnabled(enabled: boolean): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem('datamesh_mcp_enabled', enabled ? 'true' : 'false');
    } catch {}
  }
}

/**
 * Persiste la URL de servidor MCP en localStorage.
 */
export function setCustomMcpUrl(url: string) {
  const trimmed = url.trim();
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      if (trimmed) {
        window.localStorage.setItem('datamesh_mcp_url', trimmed);
      } else {
        window.localStorage.removeItem('datamesh_mcp_url');
      }
    } catch {}
  }
  datameshMcp.setServerUrl(trimmed || getDefaultBackendUrl());
}
