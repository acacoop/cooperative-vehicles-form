// =============================================
// MÓDULO DE COOPERATIVAS
// =============================================

let COOPERATIVES = [];

// Función para cargar cooperativas desde CSV
async function loadCooperatives() {
  try {
    const response = await fetch("../data/cooperatives.csv");
    const csvText = await response.text();

    // Parsear CSV (saltar la primera línea del header)
    const lines = csvText.trim().split("\n").slice(1);

    COOPERATIVES = lines.map((line) => {
      const [code, cuit, name] = line.split(";");
      return {
        code: code.trim(),
        cuit: cuit.trim(),
        name: name.trim(),
      };
    });

    console.log(`Cargadas ${COOPERATIVES.length} cooperativas`);
  } catch (error) {
    console.error("Error cargando cooperativas:", error);
  }
}

// Función para formatear CUIT desde número (para auto-completar)
function formatCuitFromNumber(cuitNumber) {
  // Convertir a string y limpiar
  const cuitStr = cuitNumber.toString().replace(/\D/g, "");

  // Debe tener 11 dígitos
  if (cuitStr.length === 11) {
    return `${cuitStr.slice(0, 2)}-${cuitStr.slice(2, 10)}-${cuitStr.slice(
      10,
    )}`;
  }

  // Si no tiene 11 dígitos, devolver el número original
  return cuitNumber;
}

// Función para completar CUIT automáticamente
function fillCuitAutomatically(coop) {
  const cuitInput = document.getElementById("cuit");
  if (cuitInput && coop.cuit) {
    const cuitFormatted = formatCuitFromNumber(coop.cuit);
    cuitInput.value = cuitFormatted;
    cuitInput.readOnly = true;
    cuitInput.style.backgroundColor = "#f8f9fa";
    cuitInput.style.cursor = "default";
    cuitInput.style.borderColor = "#28a745";
    cuitInput.tabIndex = -1;
  }
}

// Función para limpiar CUIT y hacerlo editable
function clearCuitField() {
  const cuitInput = document.getElementById("cuit");
  if (cuitInput) {
    cuitInput.value = "";
    cuitInput.readOnly = false;
    cuitInput.style.backgroundColor = "";
    cuitInput.style.cursor = "";
    cuitInput.style.borderColor = "#e0e0e0";
    cuitInput.tabIndex = 0;
  }
}

// Función para inicializar búsqueda de cooperativas
function initializeCooperativeSearch() {
  const cooperativeCodeInput = document.getElementById("cooperativeCode");
  const cooperativeNameInput = document.getElementById("cooperativeName");
  const dropdown = document.getElementById("cooperativeDropdown");

  if (!cooperativeCodeInput || !cooperativeNameInput || !dropdown) {
    console.error("Elementos de cooperativas no encontrados");
    return;
  }

  // Configurar campo de código como readonly
  cooperativeCodeInput.readOnly = true;
  cooperativeCodeInput.style.backgroundColor = "#f8f9fa";
  cooperativeCodeInput.style.cursor = "default";
  cooperativeCodeInput.tabIndex = -1;

  let selectedIndex = -1;
  let currentMatches = [];

  // Manejar entrada de texto
  cooperativeNameInput.addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase().trim();

    if (searchTerm.length === 0) {
      hideDropdown();
      cooperativeCodeInput.value = "";
      clearCuitField();
      this.style.borderColor = "#e0e0e0";
      return;
    }

    const matches = COOPERATIVES.filter((coop) =>
      coop.name.toLowerCase().includes(searchTerm),
    );

    currentMatches = matches;
    selectedIndex = -1;

    if (matches.length > 0) {
      showDropdown(matches);

      // Si hay coincidencia exacta, llenar automáticamente
      const exactMatch = matches.find(
        (coop) => coop.name.toLowerCase() === searchTerm,
      );
      if (exactMatch) {
        cooperativeCodeInput.value = exactMatch.code;
        fillCuitAutomatically(exactMatch);
        hideDropdown();
        this.style.borderColor = "#28a745";
      } else {
        cooperativeCodeInput.value = "";
        clearCuitField();
        this.style.borderColor = "#e0e0e0";
      }
    } else {
      hideDropdown();
      cooperativeCodeInput.value = "";
      clearCuitField();
      this.style.borderColor = "#dc3545";
    }
  });

  // Manejar navegación con teclado
  cooperativeNameInput.addEventListener("keydown", function (e) {
    if (!dropdown.classList.contains("show")) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, currentMatches.length - 1);
        updateSelection();
        break;

      case "ArrowUp":
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, -1);
        updateSelection();
        break;

      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && currentMatches[selectedIndex]) {
          selectCooperative(currentMatches[selectedIndex]);
        }
        break;

      case "Escape":
        e.preventDefault();
        hideDropdown();
        selectedIndex = -1;
        break;
    }
  });

  function showDropdown(matches) {
    dropdown.innerHTML = "";
    matches.forEach((coop, index) => {
      const item = document.createElement("div");
      item.className = "dropdown-item";
      item.textContent = coop.name;
      item.addEventListener("click", function () {
        selectCooperative(coop);
      });
      dropdown.appendChild(item);
    });
    dropdown.classList.add("show");
  }

  function hideDropdown() {
    dropdown.classList.remove("show");
  }

  function updateSelection() {
    const items = dropdown.querySelectorAll(".dropdown-item");
    items.forEach((item, index) => {
      if (index === selectedIndex) {
        item.classList.add("selected");
      } else {
        item.classList.remove("selected");
      }
    });
  }

  function selectCooperative(coop) {
    cooperativeCodeInput.value = coop.code;
    cooperativeNameInput.value = coop.name;
    cooperativeNameInput.style.borderColor = "#28a745";
    fillCuitAutomatically(coop);
    hideDropdown();
    selectedIndex = -1;
  }

  // Cerrar dropdown al hacer clic fuera
  document.addEventListener("click", function (e) {
    if (
      !cooperativeNameInput.contains(e.target) &&
      !dropdown.contains(e.target)
    ) {
      hideDropdown();
    }
  });
}
