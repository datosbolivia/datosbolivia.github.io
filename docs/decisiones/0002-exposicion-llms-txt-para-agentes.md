---
type: decision
title: "ADR 0002: Exposición de Endpoints llms.txt y Markdown Crudo"
status: Aceptado
timestamp: 2026-09-27T00:00:00Z
tags: [llm, agentes, llms-txt, raw, ai]
---

# ADR 0002: Exposición de Endpoints llms.txt y Markdown Crudo

## Estado
Aceptado

## Fecha
2026-09-27

## Contexto
Los catálogos tradicionales de datos abiertos están diseñados exclusivamente para consumo humano visual a través de interfaces gráficas. Sin embargo, en el contexto actual, una gran parte de los investigadores y analistas emplean Agentes de IA (como Claude, GPT, Gemini o agentes locales) para descubrir fuentes de datos y redactar consultas analíticas.

Obligar a los agentes a parsear HTML complejo o interactuar con APIs propietarias genera alucinaciones sobre los nombres de columnas, esquemas incorrectos y alto consumo de tokens.

## Decisión
1. Implementar la especificación canónica **[llmstxt.org](https://llmstxt.org)** en la ruta `/llms.txt` y `/llm.txt`.
2. Proveer una ruta consolidada `/llms-full.txt` que agrupa todos los esquemas, conceptos semánticos y descripciones en un único texto continuo para modelos con ventanas de contexto extendidas.
3. Exponer el endpoint `/raw/[...slug]` que entrega el archivo Markdown original exacto con cabecera `Content-Type: text/markdown; charset=utf-8`.

## Consecuencias
- Agentes de IA pueden consultar y entender todo el ecosistema de datos de Bolivia en un solo llamado HTTP directo.
- Se eliminan las alucinaciones de esquemas al basarse en los contratos sintácticos originales de cada nodo.
- Compatibilidad directa con herramientas CLI como `curl`, `jq` y scripts de Python.
