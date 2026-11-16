# Mini Portal de Colombia con API

## 1. Título del proyecto
**Mini Portal de Colombia con API** (`diego-rosas-api-colombia`)

## 2. Descripción
Aplicación web informativa construida con JavaScript moderno que consume datos reales en tiempo real desde la API pública **[API Colombia](https://api-colombia.com/)** y los renderiza dinámicamente en el DOM.

El portal desarrolla **2 secciones independientes** conectadas mediante hipervínculos nativos (`<a>`):
1. **Explorador de Departamentos de Colombia (`index.html`)**:
   - Consume el endpoint `/api/v1/Department` (apoyado por `/api/v1/Region`).
   - Muestra **nombre**, **región**, **población**, **superficie** (en km²) y **descripción** de los 33 departamentos/entidades territoriales de Colombia.
   - **Funcionalidad Extra implementada**: Conteo dinámico de departamentos agrupados por región natural (Andina, Caribe, Amazonía, Pacífica, Orinoquía e Insular).
2. **Sabores de Colombia (`sabores.html`)**:
   - Consume el endpoint `/api/v1/TypicalDish` (apoyado por `/api/v1/Department`).
   - Muestra **nombre**, **descripción**, **departamento de origen** e **imagen** de los platos típicos colombianos.
   - **Funcionalidad Extra implementada**: Conteo dinámico del total de platos típicos cargados desde la API.
   - **Respaldo de imágenes**: Incorpora validación de URLs y detección automática de errores (`error` event en `<img>`) para reemplazar cualquier imagen rota o faltante de la API por imágenes válidas verificadas.

## 3. Tecnologías usadas
- **HTML5**: Estructura semántica (`header`, `nav`, `main`, `section`, `article`, `dl`, `footer`) e hipervínculos nativos entre páginas.
- **CSS3**: Diseño responsivo basado en **CSS Grid**, **Flexbox**, variables CSS (`:root`) y animaciones nativas (`@keyframes`).
- **JavaScript (ES6+)**: Consumo asíncrono con `fetch`, `async/await`, manejo de errores con `try/catch`, y construcción dinámica del DOM (`document.createElement`, `DocumentFragment`, `setAttribute`, `textContent`).
- **API Pública**: [API Colombia (`https://api-colombia.com/`)](https://api-colombia.com/).

## 4. Instrucciones de uso
1. Clonar este repositorio público:
   ```bash
   git clone https://github.com/diegorosasguarin/diego-rosas-api-colombia.git
   ```
2. Ingresar a la carpeta del proyecto:
   ```bash
   cd diego-rosas-api-colombia
   ```
3. Ejecutar el proyecto en el navegador:
   - **Opción A (VS Code Live Server)**: Abrir la carpeta en VS Code, hacer clic derecho sobre `index.html` y seleccionar **Open with Live Server**.
   - **Opción B (Servidor local con Python)**:
     ```bash
     python3 -m http.server 8000
     ```
     Luego abrir `http://localhost:8000` en el navegador.
   - **Opción C (Directo)**: Abrir el archivo `index.html` con doble clic en cualquier navegador moderno (Chrome, Firefox, Edge, Safari) con conexión a internet.

## 5. Capturas (opcional)
- **Vista 1 (`index.html`)**: Panel superior con el conteo de departamentos por región y cuadrícula responsiva con las tarjetas de los 33 departamentos de Colombia.
- **Vista 2 (`sabores.html`)**: Contador total de platos típicos y galería gastronómica con fotografía, departamento de origen y descripción de cada receta.

## 6. Nombre del estudiante
**Frank Diego Rosas Guarín**
