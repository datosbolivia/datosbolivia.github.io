/**
 * Cliente de conexión a Servidor Backend y Model Context Protocol (MCP) para DataMesh Bolivia.
 * Permite ejecutar consultas SQL, streaming tabular y lectura de recursos directamente
 * en un backend o servidor MCP local/remoto, evitando restricciones de CORS del navegador
 * y delegando el procesamiento computacional pesado (DuckDB, Parquet masivos).
 */

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

export interface McpServerConfig {
  /**
   * URL base del servidor backend o endpoint HTTP/SSE de MCP.
   * Ej: "http://localhost:8000/mcp" o "http://localhost:8000/mcp/sse"
   */
  serverUrl: string;

  /**
   * Timeout en milisegundos para solicitudes RPC al servidor.
   */
  timeoutMs?: number;

  /**
   * Headers HTTP adicionales (p.ej. Authorization, X-DataMesh-Client).
   */
  headers?: Record<string, string>;
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

/**
 * Cliente TypeScript para interactuar con servidores MCP y backends federados DataMesh.
 */
export class DataMeshMcpClient {
  private serverUrl: string;
  private timeoutMs: number;
  private headers: Record<string, string>;
  private requestId: number = 1;

  constructor(config?: Partial<McpServerConfig>) {
    this.serverUrl = config?.serverUrl || getDefaultBackendUrl();
    this.timeoutMs = config?.timeoutMs || 30000;
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      ...(config?.headers || {}),
    };
  }

  /**
   * Actualiza la URL del servidor backend o MCP.
   */
  setServerUrl(url: string) {
    this.serverUrl = url;
  }

  /**
   * Comprueba si el backend o servidor MCP está en línea y accesible.
   */
  async ping(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${this.serverUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
      }).catch(() => null);
      clearTimeout(id);
      if (res && res.ok) return true;

      // Fallback: intentar llamada JSON-RPC ping
      const rpcRes = await this.callRpc('ping', {}, 3000).catch(() => null);
      return Boolean(rpcRes);
    } catch {
      return false;
    }
  }

  /**
   * Realiza una llamada JSON-RPC 2.0 al servidor MCP o backend.
   */
  async callRpc(method: string, params: Record<string, any> = {}, customTimeout?: number): Promise<any> {
    const id = this.requestId++;
    const payload = {
      jsonrpc: '2.0',
      id,
      method,
      params,
    };

    const controller = new AbortController();
    const timeout = customTimeout || this.timeoutMs;
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(this.serverUrl, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!res.ok) {
        throw new Error(`MCP backend HTTP ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      if (json.error) {
        throw new Error(json.error.message || `MCP Error ${json.error.code}`);
      }

      return json.result;
    } catch (err: any) {
      clearTimeout(timer);
      if (err.name === 'AbortError') {
        throw new Error(`Tiempo de espera agotado al conectar al servidor backend/MCP (${timeout}ms)`);
      }
      throw err;
    }
  }

  /**
   * Invoca una herramienta MCP registrada (ej. 'query', 'sql', 'read_resource').
   */
  async callTool<T = any>(name: string, args: Record<string, any> = {}): Promise<T> {
    // Protocolo estándar MCP: method "tools/call"
    const rpcResult = await this.callRpc('tools/call', {
      name,
      arguments: args,
    });

    if (rpcResult?.isError) {
      const errMsg = rpcResult.content?.map((c: any) => c.text).filter(Boolean).join('\n') || 'Error en herramienta MCP';
      throw new Error(errMsg);
    }

    // Si devuelve content con formato estándar MCP
    if (Array.isArray(rpcResult?.content) && rpcResult.content.length > 0) {
      const first = rpcResult.content[0];
      if (first.type === 'text') {
        try {
          return JSON.parse(first.text);
        } catch {
          return first.text as unknown as T;
        }
      }
      if (first.data !== undefined) {
        return first.data;
      }
    }

    return rpcResult as T;
  }

  /**
   * Ejecuta una consulta SQL en el motor DuckDB del backend MCP.
   * Permite procesar grandes volúmenes de datos sin sobrecargar el navegador.
   */
  async querySql(sql: string, options?: { catalog?: string; dataset?: string; resource?: string }): Promise<{
    columns: string[];
    rows: any[][];
    row_count: number;
  }> {
    return this.callTool('query_sql', {
      sql,
      ...options,
    });
  }

  /**
   * Descarga o lee un recurso a través del backend MCP evitando restricciones CORS.
   */
  async readResource(resourceUriOrUrl: string): Promise<{
    uri: string;
    content: string;
    mime_type?: string;
  }> {
    return this.callTool('read_resource', {
      uri: resourceUriOrUrl,
    });
  }

  /**
   * Lista las herramientas disponibles en el servidor MCP.
   */
  async listTools(): Promise<Array<{ name: string; description?: string; inputSchema?: any }>> {
    const res = await this.callRpc('tools/list', {});
    return res?.tools || [];
  }
}

/**
 * Instancia singleton por defecto para uso directo en scripts y navegador.
 */
export const datameshMcp = new DataMeshMcpClient();
