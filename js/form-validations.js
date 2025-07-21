// =============================================
// MÓDULO UNIFICADO DE VALIDACIONES DEL FORMULARIO
// =============================================

// =============================================
// FUNCIONES UTILITARIAS PARA VALIDACIÓN VISUAL
// =============================================

// Función para aplicar validación visual uniforme
function applyValidationClass(element, isValid) {
  if (isValid) {
    element.classList.remove("form-field-invalid");
    element.classList.add("form-field-valid");
  } else {
    element.classList.remove("form-field-valid");
    element.classList.add("form-field-invalid");
  }
}

// Función para limpiar validación visual
function clearValidationClass(element) {
  element.classList.remove("form-field-valid", "form-field-invalid");
}

// =============================================
// FUNCIONES DE VALIDACIÓN DE DATOS
// =============================================

// Función para validar email
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Función para validar teléfono (básico)
function validatePhone(phone) {
  // Permitir números con espacios, guiones y paréntesis
  const phoneRegex = /^[\d\s\-\(\)\+]{7,}$/;
  return phoneRegex.test(phone.trim());
}

// Función para validar campos requeridos
function validateRequired(value) {
  return value.trim().length > 0;
}

// Función para validar formato de CUIT
function validateCuitFormat(cuit) {
  // Formato: XX-XXXXXXXX-X
  const cuitRegex = /^\d{2}-\d{8}-\d{1}$/;
  return cuitRegex.test(cuit);
}

// Función para formatear CUIT mientras se escribe
function formatCuit(value) {
  // Remover todo lo que no sea dígito
  const cleanValue = value.replace(/\D/g, "");

  // Aplicar formato XX-XXXXXXXX-X
  let formattedValue = cleanValue;
  if (cleanValue.length >= 2) {
    formattedValue = cleanValue.slice(0, 2) + "-" + cleanValue.slice(2);
  }
  if (cleanValue.length >= 10) {
    formattedValue =
      cleanValue.slice(0, 2) +
      "-" +
      cleanValue.slice(2, 10) +
      "-" +
      cleanValue.slice(10, 11);
  }

  return formattedValue;
}

// =============================================
// FUNCIONES PÚBLICAS PARA VALIDACIÓN EXTERNA
// =============================================

// Función pública para validar código de cooperativa (llamada desde cooperatives.js)
function validateCooperativeCode() {
  const cooperativeCodeInput = document.getElementById("cooperativeCode");
  if (cooperativeCodeInput) {
    const value = cooperativeCodeInput.value.trim();
    if (value.length > 0 && value !== "---") {
      applyValidationClass(cooperativeCodeInput, true);
    } else {
      clearValidationClass(cooperativeCodeInput);
    }
  }
}

// =============================================
// VALIDACIONES ESPECÍFICAS POR CAMPO
// =============================================

// Función para validar período de entrega
function validateDeliveryPeriod() {
  const deliveryPeriod = document.querySelector(
    'input[name="deliveryPeriod"]:checked',
  );
  return deliveryPeriod !== null;
}

// =============================================
// INICIALIZADORES DE VALIDACIÓN POR CAMPO
// =============================================

// Función para inicializar validación de CUIT
function initializeCuitValidation() {
  const cuitInput = document.getElementById("cuit");

  if (!cuitInput) {
    console.error("Campo CUIT no encontrado");
    return;
  }

  // Evento input para formatear en tiempo real
  cuitInput.addEventListener("input", function () {
    // Solo aplicar validación si el campo no está en readonly
    if (this.readOnly) return;

    const originalValue = this.value.replace(/\D/g, "");
    const formattedValue = formatCuit(originalValue);

    this.value = formattedValue;

    // Validar formato
    if (formattedValue.length === 0) {
      clearValidationClass(this);
    } else if (validateCuitFormat(formattedValue)) {
      applyValidationClass(this, true);
    } else {
      applyValidationClass(this, false);
    }
  });

  // Evento blur para validación final
  cuitInput.addEventListener("blur", function () {
    // Solo aplicar validación si el campo no está en readonly
    if (this.readOnly) return;

    const cuit = this.value.trim();
    if (cuit.length > 0 && !validateCuitFormat(cuit)) {
      applyValidationClass(this, false);
    }
  });
}

// Función para inicializar validación de email
function initializeEmailValidation() {
  const emailInput = document.getElementById("contactEmail");
  if (emailInput) {
    emailInput.addEventListener("input", function () {
      const value = this.value.trim();
      if (value.length === 0) {
        clearValidationClass(this);
      } else {
        applyValidationClass(this, validateEmail(value));
      }
    });

    emailInput.addEventListener("blur", function () {
      const value = this.value.trim();
      if (value.length > 0) {
        applyValidationClass(this, validateEmail(value));
      }
    });
  }
}

// Función para inicializar validación de teléfono
function initializePhoneValidation() {
  const phoneInput = document.getElementById("contactPhone");
  if (phoneInput) {
    phoneInput.addEventListener("input", function () {
      const value = this.value.trim();
      if (value.length === 0) {
        clearValidationClass(this);
      } else {
        applyValidationClass(this, validatePhone(value));
      }
    });

    phoneInput.addEventListener("blur", function () {
      const value = this.value.trim();
      if (value.length > 0) {
        applyValidationClass(this, validatePhone(value));
      }
    });
  }
}

// Función para inicializar validación de cooperativa
function initializeCooperativeValidation() {
  // Validación de nombre de cooperativa
  const cooperativeNameInput = document.getElementById("cooperativeName");
  if (cooperativeNameInput) {
    cooperativeNameInput.addEventListener("input", function () {
      const value = this.value.trim();
      if (value.length === 0) {
        clearValidationClass(this);
      } else {
        // Verificar si existe en la lista de cooperativas
        const validCooperative =
          COOPERATIVES &&
          COOPERATIVES.find((coop) =>
            coop.name.toLowerCase().includes(value.toLowerCase()),
          );
        applyValidationClass(this, validCooperative !== undefined);
      }
    });
  }

  // Validación de código de cooperativa
  const cooperativeCodeInput = document.getElementById("cooperativeCode");
  if (cooperativeCodeInput) {
    // Validación inicial si ya tiene valor
    validateCooperativeCode();

    // Escuchar cambios directos (por si acaso)
    cooperativeCodeInput.addEventListener("input", function () {
      validateCooperativeCode();
    });
  }
}

// Función para validar filas de vehículos
function initializeVehicleRowValidation(row) {
  const brandSelect = row.querySelector('select[name="brand"]');
  const modelSelect = row.querySelector('select[name="model"]');
  const versionSelect = row.querySelector('select[name="version"]');
  const quantityInput = row.querySelector('input[name="quantity"]');

  // Validación de marca
  if (brandSelect) {
    brandSelect.addEventListener("change", function () {
      const value = this.value.trim();
      if (value.length === 0) {
        clearValidationClass(this);
      } else {
        applyValidationClass(this, true);
      }
    });
  }

  // Validación de modelo
  if (modelSelect) {
    modelSelect.addEventListener("change", function () {
      const value = this.value.trim();
      if (value.length === 0) {
        clearValidationClass(this);
      } else {
        applyValidationClass(this, true);
      }
    });
  }

  // Validación de versión
  if (versionSelect) {
    versionSelect.addEventListener("change", function () {
      const value = this.value.trim();
      if (value.length === 0) {
        clearValidationClass(this);
      } else {
        applyValidationClass(this, true);
      }
    });
  }

  // Validación de cantidad
  if (quantityInput) {
    quantityInput.addEventListener("input", function () {
      const value = parseInt(this.value);
      if (isNaN(value) || value < 1) {
        applyValidationClass(this, false);
      } else {
        applyValidationClass(this, true);
      }
    });

    quantityInput.addEventListener("blur", function () {
      const value = parseInt(this.value);
      if (isNaN(value) || value < 1) {
        applyValidationClass(this, false);
      } else {
        applyValidationClass(this, true);
      }
    });
  }
}

// =============================================
// INICIALIZADOR PRINCIPAL DE VALIDACIONES
// =============================================

// Función principal para inicializar todas las validaciones
function initializeFormValidations() {
  console.log("Inicializando validaciones del formulario...");

  // Inicializar todas las validaciones
  initializeCuitValidation();
  initializeEmailValidation();
  initializePhoneValidation();
  initializeCooperativeValidation();

  console.log("Validaciones inicializadas correctamente");
}
