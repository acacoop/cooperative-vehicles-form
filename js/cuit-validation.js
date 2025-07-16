// =============================================
// MÓDULO DE VALIDACIÓN DE CUIT
// =============================================

// Función para validar CUIT en tiempo real
function initializeCuitValidation() {
  const cuitInput = document.getElementById("cuit");

  if (!cuitInput) {
    console.error("Campo CUIT no encontrado");
    return;
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

  // Evento input para formatear en tiempo real
  cuitInput.addEventListener("input", function () {
    // Solo aplicar validación si el campo no está en readonly
    if (this.readOnly) return;

    const originalValue = this.value.replace(/\D/g, "");
    const formattedValue = formatCuit(originalValue);

    this.value = formattedValue;

    // Validar formato
    if (formattedValue.length === 0) {
      this.classList.remove("valid", "invalid");
    } else if (validateCuitFormat(formattedValue)) {
      this.classList.remove("invalid");
      this.classList.add("valid");
    } else {
      this.classList.remove("valid");
      this.classList.add("invalid");
    }
  });

  // Evento blur para validación final
  cuitInput.addEventListener("blur", function () {
    // Solo aplicar validación si el campo no está en readonly
    if (this.readOnly) return;

    const cuit = this.value.trim();
    if (cuit.length > 0 && !validateCuitFormat(cuit)) {
      this.classList.add("invalid");
    }
  });
}
