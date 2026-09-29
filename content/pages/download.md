---
type: page
title: "Instalar y Descargar DataMesh Bolivia"
description: "Acceso offline, instalación PWA y aplicación de escritorio con capacidades de cómputo local."
---

# Instalación

DataMesh Bolivia está diseñado para operar en múltiples entornos, desde navegadores móviles ligeros hasta estaciones de trabajo con procesamiento analítico local:

[Descargar Instaladores en GitHub Releases](https://github.com/andres-chirinos/catalogo-datamesh/releases)

## Ejecución Local desde Código Fuente

Si deseas ejecutar o compilar la aplicación de escritorio en tu máquina de desarrollo:

```bash
# 1. Clonar el repositorio
git clone https://github.com/andres-chirinos/catalogo-datamesh.git
cd catalogo-datamesh

# 2. Instalar dependencias
npm install

# 3. Lanzar la aplicación en modo Electron
npm run electron:dev

# 4. Generar el instalador ejecutable
npm run electron:build
```
