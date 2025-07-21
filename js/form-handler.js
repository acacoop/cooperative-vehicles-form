// =============================================
// MÓDULO DE GESTIÓN DE FORMULARIOS
// =============================================

// Configuración del endpoint
const ENDPOINT_URL =
  "https://prod-108.westus.logic.azure.com/workflows/9ade7b7e485f43b2bdaf3a229cb5ae77/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=I8iea2vFvNYzXQWVRYXdUGEkOc9FQ7Bo7G1BV220rY0";

let rowCounter = 1;
let isSubmitting = false;

// Función para agregar una fila a la tabla
function addRow() {
  const tableBody = document.querySelector("#unitsTable tbody");
  const rowId = `row-${rowCounter++}`;

  const row = document.createElement("tr");
  row.id = rowId;
  row.className = "vehicle-row";
  row.innerHTML = `
        <td data-label="Marca">
          <select name="brand" required>
            <option value="">Marca</option>
          </select>
        </td>
        <td data-label="Modelo">
          <select name="model" required disabled>
            <option value="">Modelo</option>
          </select>
        </td>
        <td data-label="Versión">
          <select name="version" required disabled>
            <option value="">Versión</option>
          </select>
        </td>
        <td data-label="Cantidad"><input type="number" name="quantity" required min="1" value="1"></td>
        <td data-label="Acciones"><button type="button" class="btn-remove" onclick="removeVehicleRow(this)">Eliminar</button></td>
    `;

  tableBody.appendChild(row);

  // Inicializar campos de vehículos para la nueva fila
  if (typeof initializeVehicleFields === "function") {
    initializeVehicleFields(row);
  }

  // Inicializar validación en tiempo real para la nueva fila
  initializeVehicleRowValidation(row);
}

function removeVehicleRow(button) {
  const row = button.closest("tr");
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
    const validCooperative = COOPERATIVES.find(
      (coop) => coop.name === cooperativeName && coop.code === cooperativeCode,
    );
    if (!validCooperative) {
      errors.push("La cooperativa seleccionada no es válida.");
    }
  }

  // Validar CUIT
  if (!cuit) {
    errors.push("El CUIT es requerido.");
  } else {
    const cuitRegex = /^\d{2}-\d{8}-\d{1}$/;
    if (!cuitRegex.test(cuit)) {
      errors.push("El CUIT debe tener el formato XX-XXXXXXXX-X.");
    }
  }

  // Validar email
  if (!contactEmail) {
    errors.push("El email de contacto es requerido.");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      errors.push("El email de contacto no es válido.");
    }
  }

  // Validar teléfono
  if (!contactPhone) {
    errors.push("El teléfono de contacto es requerido.");
  }

  // Validar vehículos
  const tableRows = document.querySelectorAll("#unitsTable tbody tr");
  if (tableRows.length === 0) {
    errors.push("Debe agregar al menos un vehículo.");
  }

  let vehicleErrors = [];
  tableRows.forEach((row, index) => {
    const brand = row.querySelector('select[name="brand"]').value.trim();
    const model = row.querySelector('select[name="model"]').value.trim();
    const version = row.querySelector('select[name="version"]').value.trim();
    const quantity = row.querySelector('input[name="quantity"]').value.trim();

    if (!brand) {
      vehicleErrors.push(`Vehículo ${index + 1}: La marca es requerida.`);
    }
    if (!model) {
      vehicleErrors.push(`Vehículo ${index + 1}: El modelo es requerido.`);
    }
    if (!version) {
      vehicleErrors.push(`Vehículo ${index + 1}: La versión es requerida.`);
    }
    if (!quantity || parseInt(quantity) < 1) {
      vehicleErrors.push(
        `Vehículo ${index + 1}: La cantidad debe ser mayor a 0.`,
      );
    }
  });

  errors.push(...vehicleErrors);

  // Validar período de entrega
  const deliveryPeriod = document.querySelector(
    'input[name="deliveryPeriod"]:checked',
  );
  if (!deliveryPeriod) {
    errors.push("Debe seleccionar un período de entrega.");
  }

  return errors;
}

// Función para recopilar datos del formulario
function collectFormData() {
  const cooperativeName = document
    .getElementById("cooperativeName")
    .value.trim();
  const cooperativeCode = document
    .getElementById("cooperativeCode")
    .value.trim();
  const cuit = document.getElementById("cuit").value.trim();
  const contactEmail = document.getElementById("contactEmail").value.trim();
  const contactPhone = document.getElementById("contactPhone").value.trim();

  // Recopilar datos de vehículos según el esquema requerido
  const requestedUnits = [];
  const tableRows = document.querySelectorAll("#unitsTable tbody tr");
  tableRows.forEach((row) => {
    const brand = row.querySelector('select[name="brand"]').value.trim();
    const model = row.querySelector('select[name="model"]').value.trim();
    const version = row.querySelector('select[name="version"]').value.trim();
    const quantity = parseInt(
      row.querySelector('input[name="quantity"]').value.trim(),
    );

    requestedUnits.push({
      brand,
      model,
      version,
      quantity,
    });
  });

  // Período de entrega
  const deliveryPeriod = document.querySelector(
    'input[name="deliveryPeriod"]:checked',
  ).value;

  // Observaciones (notes en el esquema)
  const notes = document.getElementById("observations").value.trim();

  // Formato según el esquema requerido
  return {
    applicationDate: new Date().toISOString(),
    cooperativeData: {
      code: cooperativeCode,
      name: cooperativeName,
      cuit: cuit,
      contactEmail: contactEmail,
      contactPhone: contactPhone,
    },
    requestedUnits: requestedUnits,
    deliveryPeriod: deliveryPeriod,
    notes: notes,
  };
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

    if (response.ok) {
      // Verificar si la respuesta tiene contenido antes de intentar parsear JSON
      const responseText = await response.text();
      let result = null;

      if (responseText.trim()) {
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          console.warn("La respuesta no es JSON válido:", responseText);
          result = { message: "Solicitud procesada exitosamente" };
        }
      } else {
        // Respuesta vacía pero exitosa
        result = { message: "Solicitud procesada exitosamente" };
      }

      return { success: true, data: result };
    } else {
      const errorText = await response.text();
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText || response.statusText}`,
      };
    }
  } catch (error) {
    console.error("Error enviando datos:", error);
    return { success: false, error: error.message };
  }
}

// Función para mostrar mensajes de éxito
function showSuccess(message) {
  const container = document.querySelector(".form-container");
  const successDiv = document.createElement("div");
  successDiv.className = "success-message";
  successDiv.textContent = message;
  container.insertBefore(successDiv, container.firstChild);

  // Scroll al top
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Función para mostrar mensajes de error
function showErrors(errors) {
  const container = document.querySelector(".form-container");
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message-global";
  errorDiv.innerHTML = `
    <strong>Por favor corrija los siguientes errores:</strong>
    <ul>
      ${errors.map((error) => `<li>${error}</li>`).join("")}
    </ul>
  `;
  container.insertBefore(errorDiv, container.firstChild);

  // Scroll al top
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Función para limpiar mensajes anteriores
function clearMessages() {
  const successMessages = document.querySelectorAll(".success-message");
  const errorMessages = document.querySelectorAll(".error-message-global");

  successMessages.forEach((msg) => msg.remove());
  errorMessages.forEach((msg) => msg.remove());
}

// Función principal para enviar el formulario
async function submitForm() {
  if (isSubmitting) return;

  // Limpiar mensajes anteriores
  clearMessages();

  // Validar formulario
  const errors = validateForm();
  if (errors.length > 0) {
    showErrors(errors);
    return;
  }

  // Recopilar datos
  const formData = collectFormData();

  console.log("Datos a enviar:", JSON.stringify(formData, null, 2));

  const submitButton = document.getElementById("submitBtn");
  const form = document.getElementById("vehicleForm");

  // Marcar como enviando
  isSubmitting = true;
  submitButton.disabled = true;
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
      showErrors([
        `Error al enviar la solicitud: ${result.error}. Por favor intente nuevamente.`,
      ]);
      // Reactivar el formulario en caso de error
      isSubmitting = false;
      submitButton.disabled = false;
      form.style.pointerEvents = "auto";
      form.style.opacity = "1";
    }
  } catch (error) {
    showErrors([
      "Error de conexión. Por favor verifique su conexión a internet e intente nuevamente.",
    ]);
    // Reactivar el formulario en caso de error
    isSubmitting = false;
    submitButton.disabled = false;
    form.style.pointerEvents = "auto";
    form.style.opacity = "1";
  }
}

// Inicialización del formulario
document.addEventListener("DOMContentLoaded", async function () {
  // Cargar datos
  if (typeof loadCooperatives === "function") {
    loadCooperatives();
  }

  if (typeof loadVehicles === "function") {
    await loadVehicles();
  }

  // Inicializar módulos
  if (typeof initializeCooperativeSearch === "function") {
    initializeCooperativeSearch();
  }

  initializeFormValidations();

  if (typeof initializeVehicleSearch === "function") {
    initializeVehicleSearch();
  }

  // Agregar primera fila automáticamente después de cargar los vehículos
  addRow();

  // Manejar envío del formulario
  const form = document.getElementById("vehicleForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      submitForm();
    });
  }
});
