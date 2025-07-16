// Configuración del endpoint
const ENDPOINT_URL =
  "https://prod-108.westus.logic.azure.com/workflows/9ade7b7e485f43b2bdaf3a229cb5ae77/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=I8iea2vFvNYzXQWVRYXdUGEkOc9FQ7Bo7G1BV220rY0";

// =============================================
// CONFIGURACIÓN DE COOPERATIVAS
// =============================================
let COOPERATIVES = [];

// Función para cargar cooperativas desde CSV
async function loadCooperatives() {
  try {
    const response = await fetch("cooperatives.csv");
    const csvText = await response.text();

    // Parsear CSV (saltar la primera línea del header)
    const lines = csvText.trim().split("\n").slice(1);

    COOPERATIVES = lines.map((line) => {
      const [code, name] = line.split(";");
      return {
        code: code.trim(),
        name: name.trim(),
      };
    });

    console.log(`Cargadas ${COOPERATIVES.length} cooperativas`);
  } catch (error) {
    console.error("Error cargando cooperativas:", error);
    // Fallback con algunas cooperativas por defecto
    COOPERATIVES = [
      { code: "002", name: "Cooperativa Agrícola Ganadera Ltda. de Acevedo" },
      { code: "003", name: "Cooperativa Agropecuaria de Alcorta Ltda." },
      {
        code: "005",
        name: "Sociedad Cooperativa Agropecuaria de Almafuerte Ltda.",
      },
    ];
  }
}

let rowCounter = 0;
let isSubmitting = false;

// Inicializar la página
document.addEventListener("DOMContentLoaded", async function () {
  await loadCooperatives();
  initializeCooperativeSearch();
  initializeCuitValidation();
  addRow();
  document
    .getElementById("vehicleForm")
    .addEventListener("submit", handleSubmit);
});

// Función para inicializar la búsqueda de cooperativas
function initializeCooperativeSearch() {
  const cooperativeCodeInput = document.getElementById("cooperativeCode");
  const cooperativeNameInput = document.getElementById("cooperativeName");
  const dropdown = document.getElementById("cooperativeDropdown");

  if (!cooperativeCodeInput || !cooperativeNameInput || !dropdown) {
    console.error("Elementos de cooperativa no encontrados");
    return;
  }

  // Hacer el campo de código de solo display
  cooperativeCodeInput.readOnly = true;
  cooperativeCodeInput.style.backgroundColor = "#f8f9fa";
  cooperativeCodeInput.style.cursor = "default";
  cooperativeCodeInput.tabIndex = -1; // Quitar del tab order

  // Buscar por nombre
  cooperativeNameInput.addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase().trim();

    if (searchTerm.length === 0) {
      hideDropdown();
      cooperativeCodeInput.value = "";
      this.style.borderColor = "#e0e0e0"; // Color normal
      return;
    }

    const matches = COOPERATIVES.filter((coop) =>
      coop.name.toLowerCase().includes(searchTerm),
    );

    if (matches.length > 0) {
      showDropdown(matches);

      // Si hay coincidencia exacta, llenar automáticamente el código
      const exactMatch = matches.find(
        (coop) => coop.name.toLowerCase() === searchTerm,
      );
      if (exactMatch) {
        cooperativeCodeInput.value = exactMatch.code;
        hideDropdown();
        this.style.borderColor = "#28a745"; // Verde para indicar selección válida
      } else {
        cooperativeCodeInput.value = "";
        this.style.borderColor = "#e0e0e0"; // Color normal
      }
    } else {
      hideDropdown();
      cooperativeCodeInput.value = "";
      this.style.borderColor = "#dc3545"; // Rojo para indicar que no hay coincidencias
    }
  });

  // Manejar click fuera del dropdown
  document.addEventListener("click", function (event) {
    if (!event.target.closest(".form-group-large")) {
      hideDropdown();
    }
  });

  function showDropdown(matches) {
    dropdown.innerHTML = "";
    matches.forEach((coop) => {
      const item = document.createElement("div");
      item.className = "dropdown-item";
      item.textContent = coop.name; // Solo mostrar el nombre
      item.addEventListener("click", function () {
        cooperativeCodeInput.value = coop.code;
        cooperativeNameInput.value = coop.name;
        cooperativeNameInput.style.borderColor = "#28a745"; // Verde para indicar selección válida
        hideDropdown();
      });
      dropdown.appendChild(item);
    });
    dropdown.classList.add("show");
  }

  function hideDropdown() {
    dropdown.classList.remove("show");
  }
}

// Función para validar CUIT en tiempo real
function initializeCuitValidation() {
  const cuitInput = document.getElementById("cuit");

  if (!cuitInput) {
    console.error("Campo CUIT no encontrado");
    return;
  }

  // Función para validar formato de CUIT
  function validateCuitFormat(cuit) {
    // Formato: XX-XXXXXXXX-X (2 dígitos, guión, 8 dígitos, guión, 1 dígito)
    const cuitRegex = /^\d{2}-\d{8}-\d{1}$/;
    return cuitRegex.test(cuit);
  }

  // Función para formatear CUIT mientras se escribe
  function formatCuit(value) {
    // Remover todos los caracteres que no sean dígitos
    let numbers = value.replace(/\D/g, "");

    // Limitar a 11 dígitos
    if (numbers.length > 11) {
      numbers = numbers.substring(0, 11);
    }

    // Agregar guiones en las posiciones correctas
    if (numbers.length >= 2) {
      numbers = numbers.substring(0, 2) + "-" + numbers.substring(2);
    }
    if (numbers.length >= 12) {
      // 2 + 1 (guión) + 8 + 1 (guión)
      numbers = numbers.substring(0, 11) + "-" + numbers.substring(11);
    }

    return numbers;
  }

  // Validación en tiempo real
  cuitInput.addEventListener("input", function () {
    const originalValue = this.value;
    const formattedValue = formatCuit(originalValue);

    // Actualizar el valor formateado
    this.value = formattedValue;

    // Validar formato
    if (formattedValue.length === 0) {
      this.style.borderColor = "#e0e0e0"; // Color normal
    } else if (validateCuitFormat(formattedValue)) {
      this.style.borderColor = "#28a745"; // Verde para válido
    } else {
      this.style.borderColor = "#dc3545"; // Rojo para inválido
    }
  });

  // Validación al perder el foco
  cuitInput.addEventListener("blur", function () {
    const cuit = this.value.trim();
    if (cuit.length > 0 && !validateCuitFormat(cuit)) {
      this.style.borderColor = "#dc3545"; // Rojo para inválido
    }
  });
}

// Función para agregar una fila a la tabla
function addRow() {
  const tableBody = document.querySelector("#unitsTable tbody");
  const rowId = `row-${rowCounter++}`;

  const row = document.createElement("tr");
  row.id = rowId;
  row.innerHTML = `
        <td data-label="Marca"><input type="text" name="brand" required placeholder="Ej: Toyota"></td>
        <td data-label="Modelo"><input type="text" name="model" required placeholder="Ej: Corolla"></td>
        <td data-label="Versión"><input type="text" name="version" required placeholder="Ej: XLI"></td>
        <td data-label="Cantidad"><input type="number" name="quantity" required min="1" placeholder="1"></td>
        <td data-label="Acciones"><button type="button" class="btn-remove" onclick="removeRow('${rowId}')">Eliminar</button></td>
    `;

  tableBody.appendChild(row);
}

function removeRow(rowId) {
  const row = document.getElementById(rowId);
  if (row) {
    const tableBody = document.querySelector("#unitsTable tbody");
    if (tableBody.children.length > 1) {
      row.remove();
    } else {
      alert("Debe mantener al menos un vehículo en la solicitud.");
    }
  }
}

function validateForm() {
  const errors = [];

  const cooperativeName = document
    .getElementById("cooperativeName")
    .value.trim();
  const cooperativeCode = document
    .getElementById("cooperativeCode")
    .value.trim();
  const cuit = document.getElementById("cuit").value.trim();
  const contactEmail = document.getElementById("contactEmail").value.trim();
  const contactPhone = document.getElementById("contactPhone").value.trim();

  // Validar que el código y nombre coincidan con una cooperativa válida
  if (!cooperativeName) {
    errors.push("Debe buscar y seleccionar una cooperativa de la lista.");
  } else {
    // Verificar que la cooperativa existe en la lista
    const validCoop = COOPERATIVES.find(
      (coop) => coop.name === cooperativeName,
    );
    if (!validCoop) {
      errors.push(
        "Debe seleccionar una cooperativa válida de la lista desplegable.",
      );
    } else if (validCoop.code !== cooperativeCode) {
      errors.push(
        "Error interno: código y nombre no coinciden. Vuelva a seleccionar la cooperativa.",
      );
    }
  }

  if (!cuit) {
    errors.push("El CUIT es obligatorio.");
  } else {
    // Validar formato de CUIT
    const cuitRegex = /^\d{2}-\d{8}-\d{1}$/;
    if (!cuitRegex.test(cuit)) {
      errors.push(
        "El CUIT debe tener el formato XX-XXXXXXXX-X (ej: 20-12345678-9).",
      );
    }
  }
  if (!contactEmail) errors.push("El email de contacto es obligatorio.");
  if (!contactPhone) errors.push("El teléfono de contacto es obligatorio.");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (contactEmail && !emailRegex.test(contactEmail)) {
    errors.push("El formato del email no es válido.");
  }

  const tableRows = document.querySelectorAll("#unitsTable tbody tr");
  let hasValidRow = false;

  tableRows.forEach((row, index) => {
    const brand = row.querySelector('input[name="brand"]').value.trim();
    const model = row.querySelector('input[name="model"]').value.trim();
    const version = row.querySelector('input[name="version"]').value.trim();
    const quantity = row.querySelector('input[name="quantity"]').value.trim();

    if (brand && model && version && quantity) {
      hasValidRow = true;
      if (isNaN(quantity) || parseInt(quantity) <= 0) {
        errors.push(
          `La cantidad en la fila ${index + 1} debe ser un número mayor a 0.`,
        );
      }
    } else if (brand || model || version || quantity) {
      errors.push(`Todos los campos en la fila ${index + 1} son obligatorios.`);
    }
  });

  if (!hasValidRow) {
    errors.push("Debe agregar al menos un vehículo a la solicitud.");
  }

  return errors;
}

function collectFormData() {
  const formData = {
    applicationDate: new Date().toISOString().split("T")[0],
    cooperativeData: {
      code: document.getElementById("cooperativeCode").value.trim(),
      name: document.getElementById("cooperativeName").value.trim(),
      cuit: document.getElementById("cuit").value.trim(),
      contactEmail: document.getElementById("contactEmail").value.trim(),
      contactPhone: document.getElementById("contactPhone").value.trim(),
    },
    deliveryPeriod:
      document.querySelector('input[name="deliveryPeriod"]:checked')?.value ||
      "",
    notes: document.getElementById("observations").value.trim(),
    requestedUnits: [],
  };

  const tableRows = document.querySelectorAll("#unitsTable tbody tr");
  tableRows.forEach((row) => {
    const brand = row.querySelector('input[name="brand"]').value.trim();
    const model = row.querySelector('input[name="model"]').value.trim();
    const version = row.querySelector('input[name="version"]').value.trim();
    const quantity = row.querySelector('input[name="quantity"]').value.trim();

    if (brand && model && version && quantity) {
      formData.requestedUnits.push({
        brand: brand,
        model: model,
        version: version,
        quantity: parseInt(quantity),
      });
    }
  });

  return formData;
}

function showErrors(errors) {
  const existingErrorDiv = document.querySelector(".error-message-global");
  if (existingErrorDiv) {
    existingErrorDiv.remove();
  }

  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message-global";
  errorDiv.innerHTML = `
        <strong>Por favor corrige los siguientes errores:</strong>
        <ul>
            ${errors.map((error) => `<li>${error}</li>`).join("")}
        </ul>
    `;

  const form = document.getElementById("vehicleForm");
  form.insertBefore(errorDiv, form.firstChild);
  window.scrollTo(0, 0);
}

function showSuccess(message) {
  const existingMessages = document.querySelectorAll(
    ".success-message, .error-message-global",
  );
  existingMessages.forEach((msg) => msg.remove());

  const successDiv = document.createElement("div");
  successDiv.className = "success-message";
  successDiv.innerHTML = `<strong>${message}</strong>`;

  const form = document.getElementById("vehicleForm");
  form.insertBefore(successDiv, form.firstChild);
  window.scrollTo(0, 0);
}

// Función para enviar datos al endpoint
async function sendToEndpoint(data) {
  try {
    const response = await fetch(ENDPOINT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Para endpoints que devuelven 201 sin contenido
    return {
      success: true,
      data: {
        status: response.status,
        message: "Solicitud enviada correctamente",
      },
    };
  } catch (error) {
    console.error("Error enviando datos:", error);
    return { success: false, error: error.message };
  }
}

// Función principal para manejar el envío del formulario
async function handleSubmit(event) {
  event.preventDefault();

  // Prevenir dobles envíos
  if (isSubmitting) {
    return;
  }

  const errors = validateForm();
  if (errors.length > 0) {
    showErrors(errors);
    return;
  }

  const formData = collectFormData();
  console.log("Datos a enviar:", JSON.stringify(formData, null, 2));

  const submitButton = document.getElementById("submitBtn");
  const form = document.getElementById("vehicleForm");
  const originalText = submitButton.textContent;

  // Marcar como enviando
  isSubmitting = true;
  submitButton.disabled = true;
  submitButton.textContent = "Enviando...";
  form.style.pointerEvents = "none";
  form.style.opacity = "0.7";

  try {
    const result = await sendToEndpoint(formData);

    if (result.success) {
      showSuccess(
        "¡Solicitud enviada exitosamente! Le enviaremos un correo confirmando la recepción de su solicitud.",
      );
      // No hacer nada más - mantener el formulario como está
    } else {
      showErrors(["Error al enviar la solicitud: " + result.error]);
      // Solo rehabilitar en caso de error
      isSubmitting = false;
      submitButton.disabled = false;
      submitButton.textContent = originalText;
      form.style.pointerEvents = "auto";
      form.style.opacity = "1";
    }
  } catch (error) {
    console.error("Error:", error);
    showErrors(["Error inesperado al procesar la solicitud."]);
    // Solo rehabilitar en caso de error
    isSubmitting = false;
    submitButton.disabled = false;
    submitButton.textContent = originalText;
    form.style.pointerEvents = "auto";
    form.style.opacity = "1";
  }
}

// Funciones de utilidad para debugging
function exportFormData() {
  const formData = collectFormData();
  console.log("Datos del formulario:", JSON.stringify(formData, null, 2));
  return formData;
}

function clearForm() {
  document.getElementById("vehicleForm").reset();
  const tableBody = document.querySelector("#unitsTable tbody");
  tableBody.innerHTML = "";
  rowCounter = 0;
  addRow();
}
