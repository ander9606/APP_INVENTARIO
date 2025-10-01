/**
 * Renderiza la barra de navegación principal
 * @returns {string} HTML del navbar
 */
export function renderNavbar() {
    return `
        <nav class="bg-blue-600 text-white shadow-lg">
            <div class="container mx-auto px-4 py-4">
                <div class="flex justify-between items-center">
                    <!-- Logo / Título -->
                    <h1 class="text-2xl font-bold cursor-pointer hover:text-blue-200 transition" 
                        onclick="window.app.navegarA('dashboard')">
                        📦 Sistema de Inventario
                    </h1>
                    
                    <!-- Menú de navegación -->
                    <div class="flex space-x-4">
                        <button onclick="window.app.navegarA('dashboard')" 
                                class="px-4 py-2 hover:bg-blue-700 rounded transition font-medium"
                                id="nav-dashboard">
                            🏠 Dashboard
                        </button>
                        <button onclick="window.app.navegarA('categorias')" 
                                class="px-4 py-2 hover:bg-blue-700 rounded transition font-medium"
                                id="nav-categorias">
                            📁 Categorías
                        </button>
                        <button onclick="window.app.navegarA('inventario')" 
                                class="px-4 py-2 hover:bg-blue-700 rounded transition font-medium"
                                id="nav-inventario">
                            📦 Inventario
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    `;
}

/**
 * Marca visualmente la sección activa en el navbar
 * @param {string} seccionActiva - Nombre de la sección activa
 */
export function marcarSeccionActiva(seccionActiva) {
    // Remover clase activa de todos los botones
    const botones = document.querySelectorAll('nav button');
    botones.forEach(btn => {
        btn.classList.remove('bg-blue-700');
    });
    
    // Agregar clase activa al botón actual
    const botonActivo = document.getElementById(`nav-${seccionActiva}`);
    if (botonActivo) {
        botonActivo.classList.add('bg-blue-700');
    }
}

/**
 * Inicializar navbar al cargar la página
 */
function inicializarNavbar() {
    const navbarContainer = document.getElementById('navbar');
    if (navbarContainer) {
        navbarContainer.innerHTML = renderNavbar();
    }
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarNavbar);
} else {
    inicializarNavbar();
}