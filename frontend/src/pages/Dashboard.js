import { Card } from '../components/Card.js';
import { DashboardInfo } from '../components/dashboard/DashboardInfo.js';
import { DashboardGuide } from '../components/dashboard/DashboardGuide.js';

/**
 * Página Dashboard - Vista principal del sistema
 * Orquesta los componentes: Card, DashboardInfo, DashboardGuide
 * 
 * RESPONSABILIDAD ÚNICA: Ensamblar la vista del dashboard
 */

/**
 * Renderiza la vista completa del Dashboard
 * @returns {string} HTML de la página dashboard
 */
export function renderDashboard() {
    return `
        <div class="fade-in">
            ${renderHeader()}
            ${renderActionCards()}
            ${DashboardInfo.render()}
            ${DashboardGuide.render()}
        </div>
    `;
}

/**
 * Renderiza el encabezado del dashboard
 * @returns {string} HTML del header
 */
function renderHeader() {
    return `
        <div class="text-center py-8 mb-8">
            <h2 class="text-4xl font-bold text-gray-800 mb-3">
                Bienvenido al Sistema de Inventario
            </h2>
            <p class="text-lg text-gray-600">
                Gestiona tus carpas, materiales y accesorios de manera eficiente
            </p>
        </div>
    `;
}

/**
 * Renderiza el grid de tarjetas de acción
 * @returns {string} HTML del grid de tarjetas
 */
function renderActionCards() {
    const tarjetas = getConfiguracionTarjetas();
    
    return `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            ${tarjetas.map(tarjeta => renderTarjeta(tarjeta)).join('')}
        </div>
    `;
}

/**
 * Obtiene la configuración de todas las tarjetas
 * @returns {Array} Array de objetos con configuración de tarjetas
 */
function getConfiguracionTarjetas() {
    return [
        {
            icono: '📁',
            titulo: 'Categorías',
            descripcion: 'Organiza tu inventario en categorías y subcategorías',
            accion: 'categorias',
            color: 'blue',
            habilitado: true
        },
        {
            icono: '📦',
            titulo: 'Inventario',
            descripcion: 'Gestiona elementos con o sin números de serie',
            accion: 'inventario',
            color: 'green',
            habilitado: true
        },
        {
            icono: '📊',
            titulo: 'Reportes',
            descripcion: 'Análisis y estadísticas del inventario',
            accion: 'reportes',
            color: 'purple',
            habilitado: false
        },
        {
            icono: '🏷️',
            titulo: 'Materiales',
            descripcion: 'Gestiona los tipos de materiales',
            accion: 'materiales',
            color: 'orange',
            habilitado: false
        },
        {
            icono: '📏',
            titulo: 'Unidades',
            descripcion: 'Define unidades de medida',
            accion: 'unidades',
            color: 'indigo',
            habilitado: false
        },
        {
            icono: '⚙️',
            titulo: 'Configuración',
            descripcion: 'Ajustes del sistema',
            accion: 'configuracion',
            color: 'gray',
            habilitado: false
        }
    ];
}

/**
 * Renderiza una tarjeta según su configuración
 * Delega al componente Card la construcción del HTML
 * @param {object} config - Configuración de la tarjeta
 * @returns {string} HTML de la tarjeta
 */
function renderTarjeta(config) {
    if (config.habilitado) {
        return Card.renderActionCard({
            icon: config.icono,
            title: config.titulo,
            description: config.descripcion,
            action: config.accion,
            color: config.color
        });
    } else {
        return Card.renderDisabledCard({
            icon: config.icono,
            title: config.titulo,
            description: config.descripcion
        });
    }
}

/**
 * Obtiene estadísticas del sistema (para futuras implementaciones)
 * @returns {Promise<object>} Objeto con estadísticas
 */
export async function obtenerEstadisticas() {
    // Aquí podrías hacer llamadas a la API
    // const elementos = await elementoService.obtenerTodos();
    // const categorias = await categoriaService.obtenerTodas();
    
    return {
        totalElementos: 0,
        totalCategorias: 0,
        elementosConSeries: 0,
        elementosSinSeries: 0
    };
}