/**
 * Aplicación Principal - Sistema de Inventario de Carpas
 * 
 * Este archivo orquesta toda la aplicación:
 * - Sistema de navegación (SPA)
 * - Gestión de vistas
 * - Inicialización de componentes
 * - Manejo de estado global
 * 
 * @version 1.0.0
 * @author Tu Nombre
 */

// ============================================
// IMPORTS - Todas las vistas y componentes
// ============================================

// Vistas principales
import { renderDashboard } from './pages/Dashboard.js';
import { renderCategorias } from './pages/Categorias.js';
import { renderInventario } from './pages/Inventario.js';

// Componentes
import { renderNavbar, marcarSeccionActiva } from './components/Navbar.js';
import { cerrarModal } from './components/Modal.js';
import { mostrarToast } from './components/Toast.js';

// Controladores
import { categoriaController } from './controllers/categoriaController.js';
import { inventarioController } from './controllers/inventario/inventarioController.js';

// Utilidades
import { API_BASE_URL } from './utils/constants.js';

// ============================================
// CLASE PRINCIPAL DE LA APLICACIÓN
// ============================================

class App {
    constructor() {
        // Estado de la aplicación
        this.vistaActual = 'dashboard';
        this.historial = [];
        this.cargando = false;

        // Registro de vistas disponibles
        this.vistas = {
            dashboard: renderDashboard,
            categorias: renderCategorias,
            inventario: renderInventario
        };

        // Referencias a elementos del DOM
        this.elementos = {
            contenido: null,
            navbar: null
        };
    }

    /**
     * Inicializa la aplicación
     * Se ejecuta cuando el DOM está listo
     */
    async iniciar() {
        console.log('🚀 Iniciando Sistema de Inventario...');
        
        try {
            // 1. Inicializar referencias al DOM
            this.inicializarDOM();

            // 2. Renderizar navbar
            this.renderizarNavbar();

            // 3. Configurar eventos globales
            this.configurarEventos();

            // 4. Verificar conexión con backend
            await this.verificarConexion();

            // 5. Cargar vista inicial (Dashboard)
            await this.navegarA('dashboard');

            console.log('✅ Aplicación iniciada correctamente');

        } catch (error) {
            console.error('❌ Error al iniciar la aplicación:', error);
            this.mostrarErrorInicial(error);
        }
    }

    /**
     * Inicializa referencias a elementos del DOM
     */
    inicializarDOM() {
        this.elementos.contenido = document.getElementById('app-content');
        this.elementos.navbar = document.getElementById('navbar');

        if (!this.elementos.contenido) {
            throw new Error('No se encontró el elemento #app-content');
        }

        console.log('📦 DOM inicializado');
    }

    /**
     * Renderiza la barra de navegación
     */
    renderizarNavbar() {
        if (this.elementos.navbar) {
            this.elementos.navbar.innerHTML = renderNavbar();
            console.log('🎨 Navbar renderizado');
        }
    }

    /**
     * Configura eventos globales de la aplicación
     */
    configurarEventos() {
        // Prevenir comportamiento por defecto de enlaces
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' && e.target.dataset.route) {
                e.preventDefault();
                this.navegarA(e.target.dataset.route);
            }
        });

        // Manejo de teclas globales
        document.addEventListener('keydown', (e) => {
            // ESC para cerrar modal
            if (e.key === 'Escape') {
                cerrarModal();
            }
        });

        // Manejo de navegación del navegador (back/forward)
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.vista) {
                this.navegarA(e.state.vista, false);
            }
        });

        console.log('⚙️ Eventos globales configurados');
    }

    /**
     * Verifica la conexión con el backend
     * @returns {Promise<boolean>}
     */
    async verificarConexion() {
        try {
            const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
            
            if (response.ok) {
                console.log('✅ Conexión con backend establecida');
                return true;
            } else {
                throw new Error('Backend no responde correctamente');
            }
        } catch (error) {
            console.warn('⚠️ No se pudo conectar con el backend:', error.message);
            mostrarToast('Advertencia: No hay conexión con el servidor', 'warning');
            return false;
        }
    }

    /**
     * Navega a una vista específica
     * @param {string} nombreVista - Nombre de la vista a cargar
     * @param {boolean} agregarHistorial - Si debe agregarse al historial del navegador
     */
    async navegarA(nombreVista, agregarHistorial = true) {
        // Validar que la vista existe
        if (!this.vistas[nombreVista]) {
            console.error(`❌ Vista "${nombreVista}" no existe`);
            mostrarToast(`Vista "${nombreVista}" no encontrada`, 'error');
            return;
        }

        // Evitar navegación si ya estamos en esa vista
        if (this.vistaActual === nombreVista && !this.cargando) {
            console.log(`ℹ️ Ya estás en la vista: ${nombreVista}`);
            return;
        }

        console.log(`📍 Navegando a: ${nombreVista}`);

        try {
            // Marcar como cargando
            this.cargando = true;
            this.mostrarCargando();

            // Ejecutar la función de renderizado de la vista
            const html = await this.vistas[nombreVista]();

            // Actualizar contenido
            this.elementos.contenido.innerHTML = html;

            // Actualizar estado
            this.vistaActual = nombreVista;

            // Agregar al historial del navegador
            if (agregarHistorial) {
                this.agregarAlHistorial(nombreVista);
            }

            // Marcar sección activa en navbar
            if (typeof marcarSeccionActiva === 'function') {
                marcarSeccionActiva(nombreVista);
            }

            // Scroll al inicio
            window.scrollTo({ top: 0, behavior: 'smooth' });

            console.log(`✅ Vista "${nombreVista}" cargada correctamente`);

        } catch (error) {
            console.error(`❌ Error al cargar vista "${nombreVista}":`, error);
            this.mostrarErrorVista(error);
            mostrarToast(`Error al cargar la vista: ${error.message}`, 'error');

        } finally {
            this.cargando = false;
        }
    }

    /**
     * Muestra un indicador de carga
     */
    mostrarCargando() {
        this.elementos.contenido.innerHTML = `
            <div class="flex items-center justify-center min-h-[400px]">
                <div class="text-center">
                    <div class="animate-spin h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p class="text-gray-600 text-lg font-medium">Cargando...</p>
                </div>
            </div>
        `;
    }

    /**
     * Muestra un mensaje de error en la vista
     * @param {Error} error - Error a mostrar
     */
    mostrarErrorVista(error) {
        this.elementos.contenido.innerHTML = `
            <div class="max-w-2xl mx-auto text-center py-16">
                <div class="mb-6">
                    <svg class="w-20 h-20 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <h3 class="text-2xl font-bold text-gray-800 mb-3">Error al cargar la vista</h3>
                <p class="text-gray-600 mb-2">${error.message}</p>
                <p class="text-sm text-gray-500 mb-8">Por favor, intenta de nuevo o contacta al soporte técnico.</p>
                <div class="flex gap-4 justify-center">
                    <button 
                        onclick="location.reload()" 
                        class="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold">
                        Recargar Página
                    </button>
                    <button 
                        onclick="window.app.navegarA('dashboard')" 
                        class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
                        Ir al Dashboard
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Muestra error inicial cuando la app no puede arrancar
     * @param {Error} error - Error a mostrar
     */
    mostrarErrorInicial(error) {
        if (this.elementos.contenido) {
            this.elementos.contenido.innerHTML = `
                <div class="max-w-2xl mx-auto text-center py-16">
                    <div class="mb-6">
                        <svg class="w-24 h-24 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                    </div>
                    <h3 class="text-2xl font-bold text-gray-800 mb-3">Error al iniciar la aplicación</h3>
                    <p class="text-gray-600 mb-2">${error.message}</p>
                    <p class="text-sm text-gray-500 mb-8">Revisa la consola del navegador para más detalles.</p>
                    <button 
                        onclick="location.reload()" 
                        class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
                        Reintentar
                    </button>
                </div>
            `;
        }
    }

    /**
     * Agrega la vista actual al historial del navegador
     * @param {string} vista - Nombre de la vista
     */
    agregarAlHistorial(vista) {
        const estado = { vista };
        const titulo = `${vista.charAt(0).toUpperCase() + vista.slice(1)} - Sistema de Inventario`;
        const url = `#/${vista}`;

        history.pushState(estado, titulo, url);
        document.title = titulo;

        this.historial.push(vista);
    }

    /**
     * Obtiene información sobre el estado actual de la aplicación
     * @returns {object} Estado de la aplicación
     */
    obtenerEstado() {
        return {
            vistaActual: this.vistaActual,
            cargando: this.cargando,
            historial: [...this.historial],
            vistasDisponibles: Object.keys(this.vistas)
        };
    }

    /**
     * Método para debugging - imprime estado en consola
     */
    debug() {
        console.group('🔍 Estado de la Aplicación');
        console.log('Vista actual:', this.vistaActual);
        console.log('Cargando:', this.cargando);
        console.log('Historial:', this.historial);
        console.log('Vistas disponibles:', Object.keys(this.vistas));
        console.groupEnd();
    }
}

// ============================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ============================================

// Crear instancia global de la aplicación
const app = new App();

// Exponer globalmente para acceso desde HTML (onclick, etc.)
window.app = app;
window.cerrarModal = cerrarModal;

// Exponer controladores globalmente
window.categoriaController = categoriaController;
window.inventarioController = inventarioController;

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.iniciar());
} else {
    // DOM ya está listo
    app.iniciar();
}

// ============================================
// MANEJO DE ERRORES NO CAPTURADOS
// ============================================

window.addEventListener('error', (event) => {
    console.error('❌ Error no capturado:', event.error);
    mostrarToast('Ha ocurrido un error inesperado', 'error');
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promise rechazada no manejada:', event.reason);
    mostrarToast('Error en operación asíncrona', 'error');
});

// ============================================
// EXPORTS (para testing futuro)
// ============================================

export default app;