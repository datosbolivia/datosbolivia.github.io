---
type: page
title: "Instalación y Descargas del Ecosistema DataMesh"
description: "Descarga de SDKs (Python, TypeScript, Go CLI), aplicación de escritorio Electron y acceso offline PWA."
---

# Ecosistema de Herramientas y SDK

DataMesh Bolivia ofrece múltiples vías de integración soberana y descentralizada: desde paquetes de código para científicos de datos y desarrolladores web, hasta aplicaciones de escritorio y agentes de inteligencia artificial.

---

## 1. SDK de Python

El SDK de Python integra el motor analítico DuckDB y permite ejecutar consultas ANSI SQL directamente sobre cualquier recurso de datos federado en memoria.

### Instalación

```bash
pip install git+https://github.com/datosbolivia/datamesh.git#subdirectory=bindings/python
```

### Ejemplo de Uso Rápido

```python
import datamesh as dm

# 1. Descubrir catálogo federado
catalogo = dm.discover()
print(f"Nodos disponibles: {len(catalogo.nodes)}")

# 2. Consultar recursos tabulares con SQL en una sola línea
df = dm.sql("""
    SELECT 
        lugar_nombre, 
        ROUND(AVG(valor_ica), 1) AS promedio_ica
    FROM 'bolivia:air_quality:air_quality_compilaci_n_de_datos_de_calidad_del_aire_de_bolivia'
    GROUP BY lugar_nombre
    ORDER BY promedio_ica DESC
    LIMIT 5
""").to_df()

print(df)
```

Para una guía más detallada, consulta la [Guía Completa del SDK DataMesh](/docs/guia-sdk-datamesh).

---

## 2. Cliente TypeScript / JavaScript (Node.js & Web)

El paquete oficial `@datosbolivia/datamesh-client` permite conectar aplicaciones frontend y servicios backend con el catálogo soberano.

### Instalación

```bash
npm install @datosbolivia/datamesh-client
```

### Ejemplo de Uso

```typescript
import { datamesh } from '@datosbolivia/datamesh-client';

// Consultar registros filtrados
const records = await datamesh.query({
  resource_uri: 'bolivia:financial_entities:financial_entities_places',
  limit: 25,
  filters: {
    departamento: 'La Paz'
  }
});

console.log(records);
```

---

## 3. Herramienta de Línea de Comandos (CLI en Go)

La herramienta de línea de comandos `datamesh` permite inspeccionar esquemas y ejecutar consultas analíticas en la terminal sin necesidad de configurar un entorno de desarrollo.

### Descarga del Binario

Los ejecutables pre-compilados para Linux (AMD64/ARM64), macOS (Apple Silicon/Intel) y Windows están disponibles en el repositorio de lanzamientos:

- [Repositorio de Releases de DataMesh](https://github.com/datosbolivia/datamesh/releases)

### Comandos de Ejemplo

```bash
# Descubrir datasets disponibles
datamesh discover

# Inspeccionar esquema de un dataset
datamesh inspect "bolivia:air_quality:air_quality_compilaci_n_de_datos_de_calidad_del_aire_de_bolivia"

# Ejecutar consulta SQL y exportar a CSV o JSON
datamesh sql "SELECT * FROM 'bolivia:agetic_data:estadisticas_ciudadania_digital'" --format=json > export.json
```

---

## 4. Servidor MCP para Agentes de Inteligencia Artificial

DataMesh implementa nativamente el protocolo **Model Context Protocol (MCP)**, permitiendo que asistentes como Claude Desktop, Cursor o Antigravity interroguen el catálogo de forma autónoma.

```bash
# Iniciar servidor MCP en modo stdio
datamesh mcp-serve
```

Configuración para `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "datamesh": {
      "command": "datamesh",
      "args": ["mcp-serve"],
      "env": {
        "DATAMESH_CATALOG_URL": "https://datosbolivia.github.io/llms.txt"
      }
    }
  }
}
```

---

## 5. Aplicación de Escritorio (Desktop Electron)

Para estaciones de trabajo que requieran procesamiento analítico local y validación continua sin conexión a internet:

- [Descargar Instalador Desktop (GitHub Releases)](https://github.com/datosbolivia/catalogo-datamesh/releases)

### Compilación desde Código Fuente

```bash
# 1. Clonar el repositorio
git clone https://github.com/datosbolivia/catalogo-datamesh.git
cd catalogo-datamesh

# 2. Instalar dependencias
npm install

# 3. Lanzar la aplicación en modo desarrollo
npm run electron:dev

# 4. Generar el instalador ejecutable de escritorio
npm run electron:build
```
