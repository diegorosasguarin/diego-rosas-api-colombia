/**
 * Explorador de Departamentos de Colombia
 * Consume https://api-colombia.com/api/v1/Department
 * Muestra: nombre, región, población, superficie y descripción.
 * Extra: conteo dinámico de departamentos por región.
 */

const DEPARTMENTS_API_URL = "https://api-colombia.com/api/v1/Department";
const REGIONS_API_URL = "https://api-colombia.com/api/v1/Region";

// Respaldo oficial de regiones de API Colombia en caso de que el objeto region venga nulo
const FALLBACK_REGIONS = {
  1: "Caribe",
  2: "Pacífico",
  3: "Orinoquía",
  4: "Amazonía",
  5: "Andina",
  6: "Insular",
};

const loaderElement = document.getElementById("loader");
const errorBoxElement = document.getElementById("error-box");
const departmentsGrid = document.getElementById("departments-grid");
const regionStatsContainer = document.getElementById("region-stats");
const departmentsCountBadge = document.getElementById("departments-count");

/**
 * Formatea valores numéricos al estándar colombiano con separador de miles.
 */
function formatearNumero(valor, sufijo = "") {
  if (valor === null || valor === undefined || Number.isNaN(Number(valor))) {
    return "No disponible";
  }
  const numeroFormateado = new Intl.NumberFormat("es-CO").format(Number(valor));
  return sufijo ? `${numeroFormateado} ${sufijo}` : numeroFormateado;
}

/**
 * Resuelve el nombre de la región de un departamento.
 */
function obtenerNombreRegion(departamento, mapaRegiones) {
  if (departamento.region && departamento.region.name) {
    return departamento.region.name;
  }
  if (mapaRegiones.has(departamento.regionId)) {
    return mapaRegiones.get(departamento.regionId);
  }
  return FALLBACK_REGIONS[departamento.regionId] || "Sin región";
}

/**
 * Extra: Calcula y renderiza en el DOM el conteo de departamentos por región.
 */
function renderizarConteoPorRegion(departamentos, mapaRegiones) {
  regionStatsContainer.innerHTML = "";
  const conteoRegiones = new Map();

  departamentos.forEach((depto) => {
    const nombreRegion = obtenerNombreRegion(depto, mapaRegiones);
    conteoRegiones.set(nombreRegion, (conteoRegiones.get(nombreRegion) || 0) + 1);
  });

  const fragmento = document.createDocumentFragment();

  // Tarjeta resumen total
  const totalCard = document.createElement("article");
  totalCard.className = "stat-card stat-card-highlight";

  const totalLabel = document.createElement("span");
  totalLabel.className = "stat-label";
  totalLabel.textContent = "Total Nacional";

  const totalValue = document.createElement("strong");
  totalValue.className = "stat-value";
  totalValue.textContent = String(departamentos.length);

  const totalDetail = document.createElement("span");
  totalDetail.className = "stat-detail";
  totalDetail.textContent = "Entidades territoriales";

  totalCard.append(totalLabel, totalValue, totalDetail);
  fragmento.appendChild(totalCard);

  // Tarjetas ordenadas de mayor a menor cantidad por región
  const regionesOrdenadas = Array.from(conteoRegiones.entries()).sort(
    (a, b) => b[1] - a[1]
  );

  regionesOrdenadas.forEach(([region, cantidad]) => {
    const card = document.createElement("article");
    card.className = "stat-card";

    const label = document.createElement("span");
    label.className = "stat-label";
    label.textContent = `Región ${region}`;

    const value = document.createElement("strong");
    value.className = "stat-value";
    value.textContent = String(cantidad);

    const detail = document.createElement("span");
    detail.className = "stat-detail";
    detail.textContent = cantidad === 1 ? "departamento" : "departamentos";

    card.append(label, value, detail);
    fragmento.appendChild(card);
  });

  regionStatsContainer.appendChild(fragmento);
}

/**
 * Construye dinámicamente en el DOM las tarjetas de cada departamento.
 */
function renderizarDepartamentos(departamentos, mapaRegiones) {
  departmentsGrid.innerHTML = "";
  const fragmento = document.createDocumentFragment();

  departamentos.forEach((depto) => {
    const nombreRegion = obtenerNombreRegion(depto, mapaRegiones);

    const card = document.createElement("article");
    card.className = "card department-card";

    // Cabecera de tarjeta: región y municipios
    const cardTop = document.createElement("div");
    cardTop.className = "card-top";

    const regionBadge = document.createElement("span");
    regionBadge.className = "badge region-badge";
    regionBadge.textContent = `Región ${nombreRegion}`;

    const metaTag = document.createElement("span");
    metaTag.className = "card-meta-tag";
    metaTag.textContent = depto.municipalities
      ? `${depto.municipalities} municipios`
      : "Colombia";

    cardTop.append(regionBadge, metaTag);

    // Nombre del departamento
    const title = document.createElement("h3");
    title.className = "card-title";
    title.textContent = depto.name || "Departamento sin nombre";

    // Métricas: Población y Superficie
    const metricsList = document.createElement("dl");
    metricsList.className = "card-metrics";

    const popItem = document.createElement("div");
    popItem.className = "metric-item";
    const popDt = document.createElement("dt");
    popDt.textContent = "Población";
    const popDd = document.createElement("dd");
    popDd.textContent = formatearNumero(depto.population, "hab.");
    popItem.append(popDt, popDd);

    const surfItem = document.createElement("div");
    surfItem.className = "metric-item";
    const surfDt = document.createElement("dt");
    surfDt.textContent = "Superficie";
    const surfDd = document.createElement("dd");
    surfDd.textContent = formatearNumero(depto.surface, "km²");
    surfItem.append(surfDt, surfDd);

    metricsList.append(popItem, surfItem);

    // Descripción
    const description = document.createElement("p");
    description.className = "card-description";
    description.textContent =
      depto.description || "Sin descripción registrada en la API.";

    card.append(cardTop, title, metricsList, description);
    fragmento.appendChild(card);
  });

  departmentsGrid.appendChild(fragmento);
  departmentsCountBadge.textContent = `${departamentos.length} departamentos`;
}

/**
 * Renderiza el estado de error en el DOM con opción de reintentar.
 */
function mostrarError(mensaje) {
  errorBoxElement.innerHTML = "";
  errorBoxElement.classList.remove("hidden");

  const errorTitle = document.createElement("p");
  errorTitle.className = "error-title";
  errorTitle.textContent = "No fue posible cargar los departamentos";

  const errorDetail = document.createElement("p");
  errorDetail.textContent = mensaje;

  const retryButton = document.createElement("button");
  retryButton.type = "button";
  retryButton.className = "retry-btn";
  retryButton.textContent = "Reintentar conexión";
  retryButton.addEventListener("click", cargarDepartamentos);

  errorBoxElement.append(errorTitle, errorDetail, retryButton);
}

/**
 * Consume los datos desde la API usando fetch y maneja errores con catch.
 */
async function cargarDepartamentos() {
  loaderElement.classList.remove("hidden");
  errorBoxElement.classList.add("hidden");
  departmentsGrid.innerHTML = "";
  regionStatsContainer.innerHTML = "";

  try {
    const [deptResponse, regionResponse] = await Promise.all([
      fetch(DEPARTMENTS_API_URL),
      fetch(REGIONS_API_URL).catch(() => null),
    ]);

    if (!deptResponse.ok) {
      throw new Error(
        `La API respondió con estado ${deptResponse.status} (${deptResponse.statusText}).`
      );
    }

    const departamentos = await deptResponse.json();

    if (!Array.isArray(departamentos) || departamentos.length === 0) {
      throw new Error("La respuesta de la API no contiene departamentos válidos.");
    }

    const mapaRegiones = new Map();
    if (regionResponse && regionResponse.ok) {
      const regiones = await regionResponse.json();
      if (Array.isArray(regiones)) {
        regiones.forEach((reg) => {
          if (reg && reg.id && reg.name) {
            mapaRegiones.set(reg.id, reg.name);
          }
        });
      }
    }

    const departamentosOrdenados = [...departamentos].sort((a, b) =>
      (a.name || "").localeCompare(b.name || "", "es")
    );

    renderizarConteoPorRegion(departamentosOrdenados, mapaRegiones);
    renderizarDepartamentos(departamentosOrdenados, mapaRegiones);
  } catch (error) {
    console.error("Error al obtener departamentos de Colombia:", error);
    mostrarError(
      error.message || "Ocurrió un error inesperado al consultar la API de Colombia."
    );
  } finally {
    loaderElement.classList.add("hidden");
  }
}

document.addEventListener("DOMContentLoaded", cargarDepartamentos);
