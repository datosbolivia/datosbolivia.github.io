---
type: page
title: "Instalar y Descargar DataMesh Bolivia"
description: "Acceso offline, instalación PWA y aplicación de escritorio con capacidades de cómputo local."
---

# Acceso e Instalación Multiplataforma

DataMesh Bolivia está diseñado para operar en múltiples entornos, desde navegadores móviles ligeros hasta estaciones de trabajo con procesamiento analítico local:

---

## 1. Aplicación Web Progresiva (PWA)

Puedes instalar este catálogo directamente desde tu navegador sin descargar archivos ejecutables ni requerir permisos de administrador:

- **Compatibilidad**: Chrome, Edge, Safari, Firefox en Android, iOS, Windows, macOS y Linux.
- **Modo Offline**: Gracias al Service Worker integrado, una vez instalada puedes navegar todos los esquemas, tablas de contratos y documentos sin conexión a internet.
- **Instalación**: Haz clic en el botón **"Instalar App"** en la barra superior o en el menú de opciones de tu navegador ("Instalar DataMesh Bolivia").

---

## 2. Aplicación de Escritorio (Electron Desktop)

Para analistas de datos, investigadores y operadores de nodos que necesitan interactuar con datos en sus máquinas locales, ofrecemos la versión de escritorio empaquetada:

### Capacidades Extendidas en Desktop:
- **Motor de Cómputo Local**: Ejecuta consultas analíticas SQL directamente sobre los recursos sin limitaciones de memoria del navegador.
- **Ranura de Integración SDK (Go / Python)**: La aplicación de escritorio cuenta con un puente IPC preparado para conectarse al binario de alto rendimiento de `datamesh-core` (compilado en Go) o a la CLI de Python para validaciones criptográficas SHA-256 e inferencia de esquemas.
- **Validador de Nodos en Vivo**: Inspecciona y audita carpetas locales con el linter ODKF v0.2 antes de publicar tus datos o abrir un Pull Request hacia el catálogo.

### Descargas de Ejecutables
Los instaladores para cada sistema operativo están disponibles en la sección de releases de GitHub:

- **Linux**: Paquete AppImage portable y `.deb` para distribuciones basadas en Debian/Ubuntu.
- **Windows**: Instalador ejecutable `.exe` y versión portable `.zip`.
- **macOS**: Instalador `.dmg` compatible con procesadores Apple Silicon e Intel.

[Descargar Instaladores en GitHub Releases](https://github.com/andres-chirinos/catalogo-datamesh/releases)

---

## 3. Ejecución Local desde Código Fuente

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
