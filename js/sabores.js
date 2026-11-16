/**
 * Sabores de Colombia - Catálogo de Platos Típicos
 * Consume https://api-colombia.com/api/v1/TypicalDish
 * Muestra: nombre, descripción, departamento e imagen (con respaldo ante enlaces rotos).
 * Extra: conteo dinámico total de platos típicos.
 */

const DISHES_API_URL = "https://api-colombia.com/api/v1/TypicalDish";
const DEPARTMENTS_API_URL = "https://api-colombia.com/api/v1/Department";

// Imágenes válidas verificadas en Wikimedia Commons para reemplazar enlaces rotos o vacíos de la API
const IMAGEN_RESPALDO_GENERAL =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Bandeja_paisa%2C_plato_t%C3%ADpico_de_Colombia.jpg/640px-Bandeja_paisa%2C_plato_t%C3%ADpico_de_Colombia.jpg";

const REEMPLAZOS_POR_PLATO = [
  {
    clave: "bandeja",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Bandeja_paisa%2C_plato_t%C3%ADpico_de_Colombia.jpg/640px-Bandeja_paisa%2C_plato_t%C3%ADpico_de_Colombia.jpg",
  },
  {
    clave: "ajiaco",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Ajiaco_bogotano.jpg/640px-Ajiaco_bogotano.jpg",
  },
  {
    clave: "sancocho",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Sancocho_de_gallina.jpg/640px-Sancocho_de_gallina.jpg",
  },
  {
    clave: "arepa",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Arepas_colombianas.jpg/640px-Arepas_colombianas.jpg",
  },
  {
    clave: "lechona",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Lechona_tolimense.jpg/640px-Lechona_tolimense.jpg",
  },
  {
    clave: "tamal",
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/85/Tamal_tolimense_sin_abrir.jpg/960px-Tamal_tolimense_sin_abrir.jpg?utm_source=es.wikipedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
  },
  {
    clave: "empanada",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Empanadas_colombianas.jpg/640px-Empanadas_colombianas.jpg",
  },
  {
    clave: "changua",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Changua_colombiana.jpg/640px-Changua_colombiana.jpg",
  },
  {
    clave: "arroz con coco",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Arroz_con_coco_y_pescado_frito.jpg/640px-Arroz_con_coco_y_pescado_frito.jpg",
  },

{
    clave: "arroz de lisa",
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/db/Arroz_de_liza.jpg/960px-Arroz_de_liza.jpg?utm_source=es.wikipedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
  },


  {
    clave: "dulce de guayaba",
    url: "https://upload.wikimedia.org/wikipedia/commons/6/60/Bocadillo.jpg?utm_source=es.wikipedia.org&utm_campaign=imageinfo&utm_content=original",
  },

  {
    clave: "pandebono",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Pandebono_colombiano.jpg/640px-Pandebono_colombiano.jpg",
  },
];

// Respaldo SVG embebido de último recurso si falla la red al cargar la imagen externa
const SVG_RESPALDO_OFFLINE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">
      <rect width="640" height="400" fill="#e8f0fe"/>
      <circle cx="320" cy="175" r="76" fill="#ffffff" stroke="#003893" stroke-width="6"/>
      <circle cx="320" cy="175" r="54" fill="#fcd116" opacity="0.45"/>
      <text x="320" y="295" text-anchor="middle" font-family="sans-serif" font-size="22" font-weight="bold" fill="#003893">Gastronomía de Colombia</text>
    </svg>`
  );

const loaderElement = document.getElementById("loader");
const errorBoxElement = document.getElementById("error-box");
const dishesGrid = document.getElementById("dishes-grid");
const dishesSummaryContainer = document.getElementById("dishes-summary");
const dishesCountBadge = document.getElementById("dishes-count");

/**
 * Busca una imagen válida de internet acorde al nombre del plato.
 */
function obtenerImagenReemplazo(nombrePlato = "") {
  const nombreNormalizado = nombrePlato.toLowerCase();
  const coincidencia = REEMPLAZOS_POR_PLATO.find((item) =>
    nombreNormalizado.includes(item.clave)
  );
  return coincidencia ? coincidencia.url : IMAGEN_RESPALDO_GENERAL;
}

/**
 * Valida la URL entregada por la API; si viene vacía o mal formada, asigna una válida.
 */
function obtenerUrlImagenInicial(plato) {
  const url = typeof plato.imageUrl === "string" ? plato.imageUrl.trim() : "";
  if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
    return url;
  }
  return obtenerImagenReemplazo(plato.name);
}

/**
 * Resuelve el nombre del departamento de origen del plato.
 */
function obtenerNombreDepartamento(plato, mapaDepartamentos) {
  if (plato.department && plato.department.name) {
    return plato.department.name;
  }
  if (mapaDepartamentos.has(plato.departmentId)) {
    return mapaDepartamentos.get(plato.departmentId);
  }
  return "Colombia";
}

/**
 * Extra: Renderiza dinámicamente en el DOM el conteo total de platos típicos.
 */
function renderizarResumenPlatos(platos, mapaDepartamentos) {
  dishesSummaryContainer.innerHTML = "";
  const departamentosUnicos = new Set(
    platos.map((plato) => obtenerNombreDepartamento(plato, mapaDepartamentos))
  );

  const fragmento = document.createDocumentFragment();

  // Tarjeta principal: Conteo total de platos
  const totalCard = document.createElement("article");
  totalCard.className = "stat-card stat-card-highlight";

  const totalLabel = document.createElement("span");
  totalLabel.className = "stat-label";
  totalLabel.textContent = "Total de Platos Típicos";

  const totalValue = document.createElement("strong");
  totalValue.className = "stat-value";
  totalValue.textContent = String(platos.length);

  const totalDetail = document.createElement("span");
  totalDetail.className = "stat-detail";
  totalDetail.textContent = "Recetas tradicionales registradas";

  totalCard.append(totalLabel, totalValue, totalDetail);
  fragmento.appendChild(totalCard);

  // Tarjeta complementaria: Departamentos representados
  const deptCard = document.createElement("article");
  deptCard.className = "stat-card";

  const deptLabel = document.createElement("span");
  deptLabel.className = "stat-label";
  deptLabel.textContent = "Departamentos Representados";

  const deptValue = document.createElement("strong");
  deptValue.className = "stat-value";
  deptValue.textContent = String(departamentosUnicos.size);

  const deptDetail = document.createElement("span");
  deptDetail.className = "stat-detail";
  deptDetail.textContent = "Regiones gastronómicas";

  deptCard.append(deptLabel, deptValue, deptDetail);
  fragmento.appendChild(deptCard);

  dishesSummaryContainer.appendChild(fragmento);
}

/**
 * Construye dinámicamente en el DOM las tarjetas de los platos típicos.
 */
function renderizarPlatos(platos, mapaDepartamentos) {
  dishesGrid.innerHTML = "";
  const fragmento = document.createDocumentFragment();

  platos.forEach((plato) => {
    const nombreDepartamento = obtenerNombreDepartamento(plato, mapaDepartamentos);

    const card = document.createElement("article");
    card.className = "card dish-card";

    // Imagen del plato con fallback automático si el enlace de la API falla
    const img = document.createElement("img");
    img.className = "dish-image";
    img.setAttribute("src", obtenerUrlImagenInicial(plato));
    img.setAttribute("alt", `Plato típico: ${plato.name || "Gastronomía colombiana"}`);
    img.setAttribute("loading", "lazy");

    let intentosFallback = 0;
    img.addEventListener("error", () => {
      intentosFallback += 1;
      if (intentosFallback === 1) {
        const reemplazoWeb = obtenerImagenReemplazo(plato.name);
        if (img.src !== reemplazoWeb) {
          img.src = reemplazoWeb;
          return;
        }
      }
      img.src = SVG_RESPALDO_OFFLINE;
    });

    // Etiqueta del departamento
    const cardTop = document.createElement("div");
    cardTop.className = "card-top";

    const deptBadge = document.createElement("span");
    deptBadge.className = "badge department-badge";
    deptBadge.textContent = nombreDepartamento;

    cardTop.appendChild(deptBadge);

    // Nombre del plato
    const title = document.createElement("h3");
    title.className = "card-title";
    title.textContent = plato.name || "Plato típico sin nombre";

    // Descripción del plato
    const description = document.createElement("p");
    description.className = "card-description";
    description.textContent =
      plato.description || "Sin descripción disponible para este plato típico.";

    card.append(img, cardTop, title, description);
    fragmento.appendChild(card);
  });

  dishesGrid.appendChild(fragmento);
  dishesCountBadge.textContent = `${platos.length} platos típicos`;
}

/**
 * Renderiza mensaje de error en el DOM cuando falla la petición fetch.
 */
function mostrarError(mensaje) {
  errorBoxElement.innerHTML = "";
  errorBoxElement.classList.remove("hidden");

  const errorTitle = document.createElement("p");
  errorTitle.className = "error-title";
  errorTitle.textContent = "No fue posible cargar los platos típicos";

  const errorDetail = document.createElement("p");
  errorDetail.textContent = mensaje;

  const retryButton = document.createElement("button");
  retryButton.type = "button";
  retryButton.className = "retry-btn";
  retryButton.textContent = "Reintentar conexión";
  retryButton.addEventListener("click", cargarPlatosTipicos);

  errorBoxElement.append(errorTitle, errorDetail, retryButton);
}

/**
 * Consume los datos de platos típicos desde la API con fetch y maneja errores con catch.
 */
async function cargarPlatosTipicos() {
  loaderElement.classList.remove("hidden");
  errorBoxElement.classList.add("hidden");
  dishesGrid.innerHTML = "";
  dishesSummaryContainer.innerHTML = "";

  try {
    const [dishesResponse, deptResponse] = await Promise.all([
      fetch(DISHES_API_URL),
      fetch(DEPARTMENTS_API_URL).catch(() => null),
    ]);

    if (!dishesResponse.ok) {
      throw new Error(
        `La API respondió con estado ${dishesResponse.status} (${dishesResponse.statusText}).`
      );
    }

    const platos = await dishesResponse.json();

    if (!Array.isArray(platos) || platos.length === 0) {
      throw new Error("La respuesta de la API no contiene platos típicos válidos.");
    }

    const mapaDepartamentos = new Map();
    if (deptResponse && deptResponse.ok) {
      const departamentos = await deptResponse.json();
      if (Array.isArray(departamentos)) {
        departamentos.forEach((dept) => {
          if (dept && dept.id && dept.name) {
            mapaDepartamentos.set(dept.id, dept.name);
          }
        });
      }
    }

    renderizarResumenPlatos(platos, mapaDepartamentos);
    renderizarPlatos(platos, mapaDepartamentos);
  } catch (error) {
    console.error("Error al obtener platos típicos de Colombia:", error);
    mostrarError(
      error.message || "Ocurrió un error inesperado al consultar la API de Colombia."
    );
  } finally {
    loaderElement.classList.add("hidden");
  }
}

document.addEventListener("DOMContentLoaded", cargarPlatosTipicos);
