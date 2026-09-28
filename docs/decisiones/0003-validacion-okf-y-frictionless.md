---
type: decision
title: "ADR 0003: Validación Rigurosa OKF y Frictionless DataPackage"
status: Aceptado
timestamp: 2026-09-27T00:00:00Z
tags: [linter, okf, frictionless, calidad, validacion]
---

# ADR 0003: Validación Rigurosa OKF y Frictionless DataPackage

## Estado
Aceptado

## Fecha
2026-09-27

## Contexto
El ecosistema DataMesh Bolivia opera bajo un modelo de federación abierta mediante Pull Requests. Sin un mecanismo de auditoría estricto, es común que se introduzcan archivos Markdown con YAML frontmatter mal formado, tipos de columna no reconocidos por los motores analíticos o contratos sintácticos rotos.

Para mantener la integridad con el Core SDK (`datamesh-sdk`), se requiere un linter nativo y rápido que valide tanto los documentos de conocimiento como los paquetes de datos.

## Decisión
Desarrollar un validador automatizado (`scripts/lint-okf.mjs`) que ejecute las siguientes comprobaciones:
1. **Conformidad OKF**:
   - Cada archivo `.md` no reservado debe tener Frontmatter YAML delimitado y parseable.
   - Campo `type` obligatorio (`dataset`, `catalog`, `concept`, `decision`, `normative`).
   - Timestamps en formato ISO 8601 UTC.
2. **Conformidad Frictionless DataPackage**:
   - Existencia de la clave `resources` como arreglo de tablas.
   - Cada recurso debe poseer `name`, `path` o `data` y `schema.fields`.
   - Cada columna debe declarar un `name` y un `type` válido en Frictionless (`string`, `integer`, `number`, `boolean`, `datetime`, `date`, `geojson`, etc.).
   - Validación de la política de acceso `policy` (`allow_all`, `zero_microdata`, `deny`).
3. **Auditoría Documental y Enlaces**:
   - Valida que los enlaces relativos `[...](...)` apunten a archivos existentes en disco.
   - Valida la estructura formal de los ADRs en `docs/decisiones/`.

## Consecuencias
- Cero dispersión o degradación en la calidad de los metadatos.
- Se puede integrar fácilmente en GitHub Actions o `pre-commit` mediante el comando `npm run lint:okf` o `make lint`.
