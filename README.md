# Multiplication Masters 🚀

¡Conviértete en un maestro de las matemáticas! Un juego interactivo diseñado para niños de 8 a 9 años para aprender y dominar las tablas de multiplicar del 1 al 10.

## ✨ Características

- **Modos de Juego**: Practica en orden (Secuencial) o desafíate con el modo "Saltando" (Aleatorio).
- **Control por Voz**: ¡Responde usando tu voz! (Requiere navegador compatible como Chrome o Edge).
- **Sistema de Medallas**: Gana medallas de Bronce, Plata, Oro y Diamante para cada tabla y cada modo.
- **Sala de Trofeos**: Visualiza tu progreso y colecciona las 20 medallas disponibles.
- **Estadísticas Detalladas**: Gráficos interactivos de velocidad para ver en qué multiplicaciones eres más rápido.
- **PWA (Progressive Web App)**: Instálalo en tu móvil y juega a pantalla completa, incluso sin conexión.
- **Modo Estudio**: Repasa las tablas e imprímelas para practicar en papel.

## 🛠️ Requisitos Previos

- [Node.js](https://nodejs.org/) (Versión 18 o superior recomendada)
- [npm](https://www.npmjs.com/) (Viene incluido con Node.js)

## 🚀 Instalación y Desarrollo

1. **Clona el repositorio** (o descarga el código):
   ```bash
   git clone <url-del-repositorio>
   cd multiplication-masters
   ```

2. **Instala las dependencias**:
   ```bash
   npm install
   ```

3. **Inicia el servidor de desarrollo**:
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:3000`.

## 🏗️ Construcción

Para generar la versión de producción (archivos estáticos optimizados):

```bash
npm run build
```
Los archivos se generarán en la carpeta `dist/`.

## 🚢 Despliegue en GitHub Pages

Esta aplicación está configurada para desplegarse fácilmente en GitHub Pages.

1. **Asegúrate de que tu repositorio esté en GitHub**.
2. **Ejecuta el comando de despliegue**:
   ```bash
   npm run deploy
   ```
   Este comando construirá la aplicación automáticamente y subirá los archivos a la rama `gh-pages`.

3. **Configuración en GitHub**:
   - Ve a los **Settings** de tu repositorio.
   - Entra en **Pages**.
   - Asegúrate de que la fuente sea **"Deploy from a branch"** y la rama sea **`gh-pages`**.

## 📱 Instalación como PWA

### En Android (Chrome)
1. Abre la URL de la aplicación.
2. Toca los tres puntos verticales (menú).
3. Selecciona **"Instalar aplicación"** o **"Añadir a la pantalla de inicio"**.

### En iOS (Safari)
1. Abre la URL de la aplicación.
2. Toca el botón **Compartir** (cuadrado con flecha arriba).
3. Desliza hacia abajo y toca **"Añadir a la pantalla de inicio"**.

---
Desarrollado con ❤️ para pequeños matemáticos.
