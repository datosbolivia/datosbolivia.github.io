---
title: "Interoperabilidad Semántica y Agentes de IA"
type: document
description: "Cómo los estándares OKF v0.2 y Frictionless previenen alucinaciones en modelos de lenguaje."
timestamp: "2026-09-27T16:00:00Z"
author: "datos-bolivia"
status: "Publicado"
---

# Interoperabilidad Semántica y Agentes de IA

A medida que los agentes autónomos y los modelos de lenguaje (LLMs) asumen tareas de análisis de datos, la ambigüedad sintáctica se convierte en el principal causante de errores y alucinaciones.

## El Rol de los Contratos Sintácticos

Un archivo tabular sin esquema obliga al modelo a "adivinar" si una columna numérica representa montos monetarios, porcentajes o identificadores categóricos. En el catálogo DataMesh, cada recurso declara su esquema en formato Frictionless:

- Tipado estricto a nivel de campo (`integer`, `number`, `string`, `datetime`).
- Restricciones matemáticas explícitas (`minimum`, `maximum`, `required`).
- Políticas de acceso (*Zero-Microdata*) que garantizan la no divulgación de datos personales sensibles.

## Rutas Canónicas para Agentes

El portal implementa los estándares de exposición para agentes:
- `/llms.txt`: Índice conciso para descubrimiento rápido.
- `/llms-full.txt`: Compendio completo de todos los nodos y sus contratos sintácticos.
- `/raw/`: Acceso directo a los archivos Markdown y descriptores sin formato HTML intermedio.
