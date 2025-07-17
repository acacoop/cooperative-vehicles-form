// =============================================
// MÓDULO DE GESTIÓN DE VEHÍCULOS - VERSIÓN SIMPLE
// =============================================

let VEHICLES = [];

// Función para cargar vehículos desde el CSV
async function loadVehicles() {
  try {
    const response = await fetch("data/vehicles.csv");
    const csvText = await response.text();

    VEHICLES = csvText
      .trim()
      .split("\n")
      .slice(1) // Saltar header
      .map((line) => {
        const [brand, model, version] = line.split(";");
        return {
          marca: brand.trim(),
          modelo: model.trim(),
          version: version.trim(),
        };
      });

    console.log("Vehículos cargados:", VEHICLES.length);
  } catch (error) {
    console.error("Error cargando vehículos:", error);
  }
}

// Función para obtener marcas únicas
function getUniqueMarks() {
  const marks = [...new Set(VEHICLES.map((v) => v.marca))];
  return marks.sort();
}

// Función para obtener modelos únicos para una marca
function getModelsForMark(mark) {
  const models = VEHICLES.filter((v) => v.marca === mark).map((v) => v.modelo);
  return [...new Set(models)].sort();
}

// Función para obtener versiones únicas para una marca y modelo
function getVersionsForMarkAndModel(mark, model) {
  const versions = VEHICLES.filter(
    (v) => v.marca === mark && v.modelo === model,
  ).map((v) => v.version);
  return [...new Set(versions)].sort();
}

// Función para inicializar campos de vehículos en una fila
function initializeVehicleFields(row) {
  const brandInput = row.querySelector('select[name="brand"]');
  const modelInput = row.querySelector('select[name="model"]');
  const versionInput = row.querySelector('select[name="version"]');

  if (!brandInput || !modelInput || !versionInput) {
    console.error("No se encontraron todos los elementos select en la fila");
    return;
  }

  // Verificar si los vehículos están cargados
  if (!VEHICLES || VEHICLES.length === 0) {
    console.error("Los vehículos no están cargados aún");
    return;
  }

  // Poblar marcas
  const brands = getUniqueMarks();
  brands.forEach((brand) => {
    const option = document.createElement("option");
    option.value = brand;
    option.textContent = brand;
    brandInput.appendChild(option);
  });

  // Configurar eventos de cascada
  brandInput.addEventListener("change", function () {
    const mark = this.value;

    // Limpiar y resetear modelo y versión
    modelInput.innerHTML = '<option value="">Modelo</option>';
    versionInput.innerHTML = '<option value="">Versión</option>';

    versionInput.disabled = true;

    if (mark) {
      const models = getModelsForMark(mark);
      models.forEach((model) => {
        const option = document.createElement("option");
        option.value = model;
        option.textContent = model;
        modelInput.appendChild(option);
      });
      modelInput.disabled = false;
    } else {
      modelInput.disabled = true;
    }
  });

  modelInput.addEventListener("change", function () {
    const marca = brandInput.value;
    const modelo = this.value;

    // Limpiar y resetear versión
    versionInput.innerHTML = '<option value="">Versión</option>';

    if (marca && modelo) {
      const versions = getVersionsForMarkAndModel(marca, modelo);
      versions.forEach((version) => {
        const option = document.createElement("option");
        option.value = version;
        option.textContent = version;
        versionInput.appendChild(option);
      });
      versionInput.disabled = false;
    } else {
      versionInput.disabled = true;
    }
  });
}

// Función para agregar botón de búsqueda a una fila (vacía ya que no hay buscador)
function addSearchButtonToRow(row) {
  // No hacer nada - sin buscador
}

// Función para inicializar búsqueda de vehículos (vacía ya que no hay buscador)
function initializeVehicleSearch() {
  // No hacer nada - sin buscador
}
