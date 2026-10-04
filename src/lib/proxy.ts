/**
 * Utilidades de resolución y descarga con soporte para proxies CORS.
 * Permite descargar datasets y recursos desde dominios que restringen solicitudes directas
 * de navegador (Kaggle, Google Docs/Sheets, APIs gubernamentales bolivianas .gob.bo, etc.).
 */

import {
  KNOWN_CORS_RESTRICTED_DOMAINS,
  DEFAULT_PROXY_PROVIDERS,
  pingProxy,
  isCorsRestrictedDomain as sdkIsCorsRestrictedDomain,
} from '@datosbolivia/datamesh-client';

export { KNOWN_CORS_RESTRICTED_DOMAINS, DEFAULT_PROXY_PROVIDERS, pingProxy };

/**
 * Configuración de proxies CORS.
 */
export interface CorsProxyConfig {
  /**
   * Habilita o deshabilita el uso de proxies CORS.
   * Si está en false, solo se intentará fetch directo.
   */
  enabled: boolean;

  /**
   * Proveedores o plantillas de proxy en orden de prioridad.
   * Valores posibles: 'local', 'allorigins', 'corsproxy', o una URL con '{url}' o '?url='.
   */
  providers: string[];

  /**
   * Lista de dominios o sufijos TLD que deben saltar fetch directo y usar proxy de inmediato.
   */
  restrictedDomains: string[];

  /**
   * Timeout en milisegundos para solicitudes a través de proxy.
   */
  timeoutMs?: number;
}

const isEnvProxyEnabled =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.PUBLIC_CORS_PROXY_ENABLED === 'true') ||
  (typeof process !== 'undefined' && process.env?.PUBLIC_CORS_PROXY_ENABLED === 'true');

export const DEFAULT_PROXY_CONFIG: CorsProxyConfig = {
  enabled: isEnvProxyEnabled,
  providers: ['local', 'allorigins', 'corsproxy'],
  restrictedDomains: [...KNOWN_CORS_RESTRICTED_DOMAINS],
  timeoutMs: 15000,
};

let activeConfig: CorsProxyConfig = {
  ...DEFAULT_PROXY_CONFIG,
  providers: [...DEFAULT_PROXY_CONFIG.providers],
  restrictedDomains: [...DEFAULT_PROXY_CONFIG.restrictedDomains],
};

// Inicialización dinámica desde localStorage en navegadores
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    const savedCustomProxy = window.localStorage.getItem('datamesh_custom_proxy');
    const savedProxyEnabled = window.localStorage.getItem('datamesh_proxy_enabled');
    if (savedCustomProxy) {
      activeConfig.providers = [savedCustomProxy, ...DEFAULT_PROXY_CONFIG.providers.filter((p) => p !== savedCustomProxy)];
    }
    if (savedProxyEnabled !== null) {
      activeConfig.enabled = savedProxyEnabled === 'true';
    }
  } catch {
    // localStorage no disponible o restringido
  }
}

/**
 * Guarda y activa un proxy personalizado elegido por el usuario (persiste en localStorage).
 */
export function setUserCustomProxy(proxyUrlOrTemplate: string, enabled: boolean = true): CorsProxyConfig {
  const trimmed = proxyUrlOrTemplate.trim();
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      if (trimmed) {
        window.localStorage.setItem('datamesh_custom_proxy', trimmed);
      } else {
        window.localStorage.removeItem('datamesh_custom_proxy');
      }
      window.localStorage.setItem('datamesh_proxy_enabled', enabled ? 'true' : 'false');
    } catch {
      // Ignorar fallos de almacenamiento
    }
  }

  activeConfig.enabled = enabled;
  if (trimmed) {
    activeConfig.providers = [trimmed, ...DEFAULT_PROXY_CONFIG.providers.filter((p) => p !== trimmed)];
  } else {
    activeConfig.providers = [...DEFAULT_PROXY_CONFIG.providers];
  }

  return getCorsProxyConfig();
}

/**
 * Obtiene el proxy personalizado guardado por el usuario, o cadena vacía si no hay ninguno.
 */
export function getUserCustomProxy(): string {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      return window.localStorage.getItem('datamesh_custom_proxy') || '';
    } catch {
      return '';
    }
  }
  return '';
}

/**
 * Comprueba si el proxy CORS está habilitado globalmente.
 */
export function isCorsProxyEnabled(): boolean {
  return activeConfig.enabled;
}

/**
 * Obtiene la plantilla del proxy actualmente activo (ej. para inyectar en DataMeshClient).
 */
export function getActiveProxyTemplate(): string | undefined {
  if (!activeConfig.enabled) return undefined;
  return activeConfig.providers[0];
}

/**
 * Obtiene la configuración actual de proxies CORS.
 */
export function getCorsProxyConfig(): CorsProxyConfig {
  return {
    ...activeConfig,
    providers: [...activeConfig.providers],
    restrictedDomains: [...activeConfig.restrictedDomains],
  };
}

/**
 * Actualiza la configuración global de proxies CORS.
 */
export function configureCorsProxy(options: Partial<CorsProxyConfig>): CorsProxyConfig {
  activeConfig = {
    ...activeConfig,
    ...options,
    providers: options.providers ? [...options.providers] : activeConfig.providers,
    restrictedDomains: options.restrictedDomains ? [...options.restrictedDomains] : activeConfig.restrictedDomains,
  };
  return getCorsProxyConfig();
}

/**
 * Restaura la configuración de proxies CORS a sus valores por defecto.
 */
export function resetCorsProxyConfig(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem('datamesh_custom_proxy');
      window.localStorage.removeItem('datamesh_proxy_enabled');
    } catch {
      // ignore
    }
  }
  activeConfig = {
    ...DEFAULT_PROXY_CONFIG,
    providers: [...DEFAULT_PROXY_CONFIG.providers],
    restrictedDomains: [...DEFAULT_PROXY_CONFIG.restrictedDomains],
  };
}

/**
 * Determina si una URL pertenece a un dominio con restricciones conocidas de CORS.
 */
export function isCorsRestrictedDomain(url: string, customDomains?: string[]): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../')) {
    return false;
  }
  const domainsToCheck = customDomains || activeConfig.restrictedDomains;
  return sdkIsCorsRestrictedDomain(trimmed, domainsToCheck);
}

/**
 * Construye una URL a través de un servicio proxy CORS de respaldo.
 * 
 * @param targetUrl URL original del recurso a descargar
 * @param proxyProvider Nombre del proveedor ('allorigins', 'corsproxy') o plantilla URL
 */
export function buildProxyUrl(targetUrl: string, proxyProvider?: string): string {
  if (!targetUrl || typeof targetUrl !== 'string') {
    return targetUrl;
  }

  const provider = proxyProvider || activeConfig.providers[0] || 'allorigins';

  // Si coincide con un proveedor predefinido
  if (provider in DEFAULT_PROXY_PROVIDERS) {
    return DEFAULT_PROXY_PROVIDERS[provider](targetUrl);
  }

  // Plantilla con marcador explícito {url} o %s
  if (provider.includes('{url}')) {
    return provider.replace('{url}', encodeURIComponent(targetUrl));
  }
  if (provider.includes('%s')) {
    return provider.replace('%s', encodeURIComponent(targetUrl));
  }

  // Plantilla que termina en parámetro query
  if (provider.endsWith('=') || provider.endsWith('?url=') || provider.endsWith('&url=')) {
    return `${provider}${encodeURIComponent(targetUrl)}`;
  }

  // URL base genérica
  if (provider.startsWith('http://') || provider.startsWith('https://')) {
    const sep = provider.includes('?') ? '&' : '?';
    return `${provider}${sep}url=${encodeURIComponent(targetUrl)}`;
  }

  // Fallback por defecto a allorigins
  return DEFAULT_PROXY_PROVIDERS.allorigins(targetUrl);
}

/**
 * Registro de un intento de fetch directo o vía proxy.
 */
export interface ProxyAttempt {
  provider: string;
  url: string;
  error?: string;
  status?: number;
}

/**
 * Error descriptivo cuando todas las vías de descarga (directa y proxies) fallan.
 */
export class CorsProxyError extends Error {
  public readonly targetUrl: string;
  public readonly attempts: ProxyAttempt[];

  constructor(targetUrl: string, attempts: ProxyAttempt[]) {
    const summary = attempts
      .map((a) => `  - [${a.provider}] ${a.status ? `HTTP ${a.status}: ` : ''}${a.error || 'Fallo desconocido'}`)
      .join('\n');

    const message = [
      `No se pudo descargar el recurso remoto desde '${targetUrl}'.`,
      'Todos los intentos (directo y proxies CORS de respaldo) fueron rechazados:',
      summary,
      '',
      'Para consultar o descargar este dataset sin restricciones de navegador (CORS), utiliza el SDK o CLI de DataMesh Bolivia:',
      `  • CLI: datamesh sql "SELECT * FROM '${targetUrl}' LIMIT 25"`,
      `  • Python SDK: import datamesh as dm; res = dm.sql("SELECT * FROM '${targetUrl}'")`,
      `  • TypeScript SDK: import { datamesh } from '@datosbolivia/datamesh-client';`,
      `                    const res = await datamesh.query({ resource_uri: '${targetUrl}' });`,
    ].join('\n');

    super(message);
    this.name = 'CorsProxyError';
    this.targetUrl = targetUrl;
    this.attempts = attempts;
  }
}

/**
 * Descarga una URL remota gestionando automáticamente restricciones CORS.
 * 
 * Flujo:
 * 1. Si no es un dominio bloqueado conocido, intenta primero un fetch directo.
 * 2. Si el fetch directo falla por TypeError (Error de red/CORS) o 401/403 por CORS,
 *    o si es un dominio restringido conocido, reintenta automáticamente usando los proxies
 *    configurados en orden de prioridad ('allorigins', 'corsproxy', etc.).
 * 3. Si todos fallan o no hay proxies disponibles, lanza un CorsProxyError con instrucciones
 *    claras para el SDK y CLI.
 */
export async function fetchWithCorsProxy(url: string, options?: RequestInit): Promise<Response> {
  const config = getCorsProxyConfig();
  const attempts: ProxyAttempt[] = [];

  const isRestricted = isCorsRestrictedDomain(url, config.restrictedDomains);

  // 1. Intento directo si el proxy está deshabilitado o si el dominio no es restringido conocido
  if (!isRestricted || !config.enabled) {
    try {
      const directResponse = await fetch(url, options);
      if (directResponse.ok) {
        return directResponse;
      }

      // Si devuelve 401 o 403, podría ser restricción CORS o política de origen
      attempts.push({
        provider: 'direct',
        url,
        status: directResponse.status,
        error: `HTTP ${directResponse.status} ${directResponse.statusText}`,
      });

      // Si no es un error de autorización/CORS y el proxy está deshabilitado, retornar la respuesta
      if (!config.enabled || (directResponse.status !== 401 && directResponse.status !== 403)) {
        return directResponse;
      }
    } catch (err: any) {
      attempts.push({
        provider: 'direct',
        url,
        error: err?.message || 'TypeError: Network/CORS Error',
      });

      if (!config.enabled) {
        throw new CorsProxyError(url, attempts);
      }
    }
  } else {
    attempts.push({
      provider: 'direct (saltado)',
      url,
      error: 'Dominio en lista de restricciones conocidas de CORS',
    });
  }

  // 2. Si los proxies están deshabilitados, lanzar error directamente
  if (!config.enabled || config.providers.length === 0) {
    throw new CorsProxyError(url, attempts);
  }

  // 3. Intento único en el proxy configurado (sin fallback secundario en cascada)
  const provider = config.providers[0];
  const proxyUrl = buildProxyUrl(url, provider);

  let signal = options?.signal;
  let timeoutId: any;

  if (!signal && config.timeoutMs && config.timeoutMs > 0) {
    if (typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal) {
      signal = AbortSignal.timeout(config.timeoutMs);
    } else if (typeof AbortController !== 'undefined') {
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), config.timeoutMs);
      signal = controller.signal;
    }
  }

  try {
    const proxyResponse = await fetch(proxyUrl, {
      ...options,
      signal,
    });

    if (proxyResponse.ok) {
      return proxyResponse;
    }

    attempts.push({
      provider,
      url: proxyUrl,
      status: proxyResponse.status,
      error: `HTTP ${proxyResponse.status} ${proxyResponse.statusText}`,
    });
  } catch (err: any) {
    attempts.push({
      provider,
      url: proxyUrl,
      error: err?.message || 'Error de conexión con servicio proxy',
    });
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }

  // Falló la solicitud: salir con error directo sin fallback a otros proxies
  throw new CorsProxyError(url, attempts);
}
