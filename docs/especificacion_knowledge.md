---
type: normative
title: "Especificación de Nodos DataMesh Bolivia (ODKF v0.2)"
description: "Estándar normativo unificado para la federación de conocimiento y contratos de datos en la red DataMesh Bolivia."
timestamp: 2026-09-27T00:00:00Z
tags: [especificacion, okf, odkf, datapackage, contratos, federacion]
---

# Especificación Normativa de Nodos DataMesh Bolivia (ODKF v0.2)

**Versión:** 0.2 — Estándar Normativo  
**Ecosistema:** DataMesh Bolivia / Open Data Knowledge Format  
**Fuente Maestra:** [`datamesh-sdk/specificacion_knowledge.md`](file:///home/andreschirinos/Proyectos/datamesh-sdk/specificacion_knowledge.md)

---

## 1. Propósito y Filosofía

Esta especificación define la estructura obligatoria que debe cumplir cualquier repositorio o directorio para ser admitido como **Nodo Federado** dentro del catálogo central de **DataMesh Bolivia**.

Se basa en el principio fundacional: **"Si puedes usar `git` y `cat`, puedes operar y consultar DataMesh"**.

### Principios Rectores:
1. **Legibilidad Humana y Artificial**: Archivos Markdown UTF-8 con Frontmatter YAML estándar. Cero formatos binarios propietarios en la capa de metadatos.
2. **Interoperabilidad Semántica (SKOS)**: Anclaje ontológico explícito a vocabularios W3C (SKOS, Wikidata, Schema.org) para evitar ambigüedades en agentes de IA.
3. **Contratos Sintácticos Duros (Frictionless DataPackage)**: Declaración rigurosa de esquemas de columnas, tipos y políticas de acceso.
4. **Política Zero-Microdata**: El catálogo solo indexa metadatos, descripciones y esquemas. Los microdatos sensibles o masivos residen externamente en sus repositorios custodios (Kaggle, URLs gubernamentales, Google Sheets, S3).
5. **Trazabilidad Criptográfica**: Cada transformación o versión declara huellas SHA-256 para auditoría de integridad.

---

## 2. Anatomía de un Directorio de Nodo

Cada nodo en `knowledge/nodes/<slug>/` debe poseer como mínimo:

```text
knowledge/nodes/mi-institucion-datos/
├── index.md                  # Documento principal del nodo (Frontmatter + Narrativa)
├── datapackage.yaml          # Contrato sintáctico Frictionless (o datapackage.json / .yml)
├── concepts/                 # (Opcional) Glosario semántico de conceptos SKOS
│   ├── concepto_a.md
│   └── concepto_b.md
└── knowledge/                # (Opcional) Contexto metodológico extendido
    └── context.md
```

---

## 3. Especificación del Archivo `index.md`

El archivo `index.md` combina un bloque delimitado de YAML con texto explicativo en Markdown:

```yaml
---
type: dataset
title: Nombre Legible del Dataset
dimensions:
  - fecha
  - departamento
  - categoria
contracts:
  - type: datapackage
    path: ./datapackage.yaml
lineage:
  source:
    - url: https://datos.gob.bo/recurso.csv
  version: 1.0.0
  updated_at: 2026-09-27T00:00:00Z
tags: [finanzas, estadisticas, gobierno, bolivia]
---

# Nombre Legible del Dataset

Descripción detallada para investigadores, analistas y modelos de IA. Explica el origen institucional, periodicidad de actualización y precauciones metodológicas.

## Conceptos Relacionados (SKOS)
- [Definición de Concepto](concepts/concepto_a.md) - [Q12345](https://www.wikidata.org/wiki/Q12345)

## Uso Analítico y Consultas
```sql
SELECT departamento, COUNT(*) 
FROM mi_tabla 
GROUP BY departamento;
```
```

---

## 4. Especificación del Contrato Frictionless (`datapackage.yaml` / `.json`)

El contrato describe el esquema tabular exacto de cada recurso disponible:

```yaml
name: mi-dataset
resources:
  - name: tabla_principal
    path: https://fuente-oficial.gob.bo/archivo.csv
    format: csv
    mediatype: text/csv
    policy: allow_all  # allow_all | zero_microdata | deny
    schema:
      fields:
        - name: id
          type: integer
          description: Identificador numérico único
        - name: fecha
          type: date
          description: Fecha de registro en formato ISO 8601
        - name: monto
          type: number
          description: Importe monetario en Bolivianos (BOB)
        - name: entidad
          type: string
          description: Razón social de la institución
```

### Tipos de Datos Frictionless Válidos:
- `string`: Cadenas de texto.
- `number`: Números de coma flotante o decimales.
- `integer`: Números enteros.
- `boolean`: Valores verdadero/falso.
- `date`: Fechas (`YYYY-MM-DD`).
- `datetime`: Marcas de tiempo ISO (`YYYY-MM-DDTHH:MM:SSZ`).
- `geojson` / `geopoint`: Geometrías espaciales.
- `array` / `object`: Estructuras anidadas.

---

## 5. Proceso de Incorporación de un Nuevo Nodo (Federación)

1. Crear una rama o fork del repositorio del catálogo.
2. Añadir la carpeta `knowledge/nodes/<slug>/` con su `index.md` y `datapackage.yaml`.
3. Ejecutar el validador:
   ```bash
   npm run lint:okf
   ```
4. Añadir la referencia al nodo en `knowledge/index.md` bajo la categoría correspondiente.
5. Enviar un **Pull Request** para revisión y verificación criptográfica.
