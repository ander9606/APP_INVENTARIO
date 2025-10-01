import { Card } from '../Card.js';

/**
 * Componente de información del sistema para Dashboard
 * Muestra datos generales sobre el sistema de inventario
 */
export const DashboardInfo = {
    /**
     * Renderiza la sección completa de información del sistema
     * @param {object} datos - Datos opcionales del sistema
     * @returns {string} HTML de la sección
     */
    render(datos = {}) {
        const {
            version = '1.0.0',
            proposito = 'Gestión de carpas y materiales',
            caracteristicas = 'Series individuales + Stock general'
        } = datos;

        return `
            <div class="mt-12 max-w-6xl mx-auto">
                ${this.renderInfoCard(version, proposito, caracteristicas)}
            </div>
        `;
    },

    /**
     * Renderiza la tarjeta principal de información
     * @param {string} version - Versión del sistema
     * @param {string} proposito - Propósito del sistema
     * @param {string} caracteristicas - Características principales
     * @returns {string} HTML de la tarjeta
     */
    renderInfoCard(version, proposito, caracteristicas) {
        return `
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    ${this.getIconInfo()}
                    Información del Sistema
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    ${Card.renderInfoCard({
                        label: 'Sistema de gestión de inventario',
                        value: `Versión ${version}`,
                        icon: '📦',
                        color: 'blue'
                    })}
                    ${Card.renderInfoCard({
                        label: 'Diseñado para',
                        value: proposito,
                        icon: '🎯',
                        color: 'green'
                    })}
                    ${Card.renderInfoCard({
                        label: 'Características',
                        value: caracteristicas,
                        icon: '✨',
                        color: 'purple'
                    })}
                </div>
            </div>
        `;
    },

    /**
     * Renderiza sección con estadísticas del sistema (futuro)
     * @param {object} stats - Objeto con estadísticas
     * @returns {string} HTML con estadísticas
     */
    renderStats(stats = {}) {
        const {
            totalElementos = 0,
            totalCategorias = 0,
            elementosConSeries = 0,
            elementosSinSeries = 0
        } = stats;

        return `
            <div class="mt-6">
                <h4 class="text-md font-semibold text-gray-700 mb-3">Estadísticas</h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    ${this.renderStatCard('Total Elementos', totalElementos, '📦', 'blue')}
                    ${this.renderStatCard('Categorías', totalCategorias, '📁', 'green')}
                    ${this.renderStatCard('Con Series', elementosConSeries, '🔢', 'purple')}
                    ${this.renderStatCard('Stock General', elementosSinSeries, '📊', 'orange')}
                </div>
            </div>
        `;
    },

    /**
     * Renderiza una tarjeta de estadística pequeña
     * @param {string} label - Etiqueta
     * @param {number} value - Valor numérico
     * @param {string} icon - Emoji
     * @param {string} color - Color del tema
     * @returns {string} HTML de la tarjeta
     */
    renderStatCard(label, value, icon, color) {
        return `
            <div class="bg-white p-3 rounded-lg shadow-sm border border-gray-200 text-center">
                <div class="text-2xl mb-1">${icon}</div>
                <div class="text-2xl font-bold text-gray-800">${value}</div>
                <div class="text-xs text-gray-600">${label}</div>
            </div>
        `;
    },

    /**
     * Obtiene el ícono SVG de información
     * @returns {string} SVG del icono
     */
    getIconInfo() {
        return `
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
        `;
    },

    /**
     * Obtiene el ícono SVG de estadísticas
     * @returns {string} SVG del icono
     */
    getIconStats() {
        return `
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
        `;
    }
};