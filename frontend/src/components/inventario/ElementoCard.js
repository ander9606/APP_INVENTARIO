// frontend/src/components/inventario/ElementoCard.js

import { ElementoCardHeader } from '../../components/inventario/ElementoCardHeader.js';
import { ElementoCardBody } from '../../components/inventario/ElementoCardBody.js';
import { ElementoCardFooter } from '../../components/inventario/ElementoCardFooter.js';

/**
 * Componente: Tarjeta completa de elemento
 * Orquesta los subcomponentes: Header, Body, Footer
 * 
 * RESPONSABILIDAD: Ensamblar la tarjeta completa coordinando los subcomponentes
 */
export const ElementoCard = {
    
    /**
     * Renderiza la tarjeta completa de un elemento
     * @param {object} elemento - Datos del elemento
     * @param {number} index - Índice en el grid (para animación escalonada)
     * @returns {string} HTML de la tarjeta completa
     */
    render(elemento, index = 0) {
        return `
            <div 
                class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-blue-300 fade-in-up"
                style="animation-delay: ${index * 0.05}s"
                data-elemento-id="${elemento.id}"
                data-tipo="${elemento.requiere_series ? 'series' : 'lotes'}">
                
                ${ElementoCardHeader.render(elemento)}
                ${ElementoCardBody.render(elemento)}
                ${ElementoCardFooter.render(elemento)}
            </div>
        `;
    },

    /**
     * Renderiza una versión compacta de la tarjeta
     * Para usar en listas o vistas reducidas
     */
    renderCompacta(elemento) {
        return `
            <div 
                class="bg-white rounded-lg shadow hover:shadow-md transition border border-gray-200"
                data-elemento-id="${elemento.id}">
                
                ${ElementoCardHeader.renderCompacto(elemento)}
                ${ElementoCardBody.renderCompacto(elemento)}
                ${ElementoCardFooter.renderCompacto(elemento)}
            </div>
        `;
    },

    /**
     * Renderiza versión tipo lista (horizontal)
     */
    renderLista(elemento, index = 0) {
        return `
            <div 
                class="bg-white rounded-lg shadow hover:shadow-md transition border border-gray-200 p-4 flex items-center gap-4 fade-in"
                style="animation-delay: ${index * 0.03}s"
                data-elemento-id="${elemento.id}">
                
                <!-- Icono tipo elemento -->
                <div class="flex-shrink-0">
                    ${this.renderIconoTipo(elemento)}
                </div>
                
                <!-- Info principal -->
                <div class="flex-1 min-w-0">
                    <h4 class="font-semibold text-gray-800 truncate">
                        ${elemento.nombre}
                    </h4>
                    <p class="text-sm text-gray-600 truncate">
                        ${this.obtenerDescripcionCorta(elemento)}
                    </p>
                </div>
                
                <!-- Cantidad/Estado -->
                <div class="flex-shrink-0 text-right">
                    ${this.renderInfoCantidad(elemento)}
                </div>
                
                <!-- Botones -->
                <div class="flex-shrink-0">
                    ${ElementoCardFooter.renderListado(elemento)}
                </div>
            </div>
        `;
    },

    /**
     * Renderiza el ícono según el tipo de elemento
     */
    renderIconoTipo(elemento) {
        if (elemento.requiere_series) {
            return `
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                    </svg>
                </div>
            `;
        } else {
            return `
                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                </div>
            `;
        }
    },

    /**
     * Obtiene una descripción corta del elemento
     */
    obtenerDescripcionCorta(elemento) {
        if (elemento.requiere_series) {
            return `${elemento.cantidad} unidad${elemento.cantidad !== 1 ? 'es' : ''} con series`;
        }

        if (elemento.es_grupo) {
            return `${elemento.total_unidades} unidades en ${elemento.lotes.length} lote${elemento.lotes.length !== 1 ? 's' : ''}`;
        }

        return `${elemento.cantidad} unidades - Lote ${elemento.lote_numero || ''}`;
    },

    /**
     * Renderiza información de cantidad/estado compacta
     */
    renderInfoCantidad(elemento) {
        if (elemento.requiere_series) {
            return `
                <div class="text-2xl font-bold text-blue-600">
                    ${elemento.cantidad}
                </div>
                <div class="text-xs text-gray-500">
                    series
                </div>
            `;
        }

        if (elemento.es_grupo) {
            const disponible = elemento.distribucion_estados?.AVAILABLE || 0;
            return `
                <div class="text-2xl font-bold text-green-600">
                    ${disponible}
                </div>
                <div class="text-xs text-gray-500">
                    de ${elemento.total_unidades}
                </div>
            `;
        }

        return `
            <div class="text-2xl font-bold text-gray-700">
                ${elemento.cantidad}
            </div>
            <div class="text-xs text-gray-500">
                unidades
            </div>
        `;
    },

    /**
     * Renderiza múltiples tarjetas en un grid
     * @param {Array} elementos - Array de elementos
     * @param {string} vista - 'grid' | 'lista' | 'compacta'
     * @returns {string} HTML del grid completo
     */
    renderMultiples(elementos, vista = 'grid') {
        if (!elementos || elementos.length === 0) {
            return '';
        }

        // Seleccionar método de renderizado según vista
        const renderMethod = {
            grid: this.render.bind(this),
            lista: this.renderLista.bind(this),
            compacta: this.renderCompacta.bind(this)
        }[vista] || this.render.bind(this);

        // Generar HTML de todas las tarjetas
        const tarjetasHTML = elementos
            .map((elem, index) => renderMethod(elem, index))
            .join('');

        // Clase de contenedor según vista
        const containerClass = {
            grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
            lista: 'space-y-3',
            compacta: 'grid grid-cols-1 md:grid-cols-2 gap-3'
        }[vista] || 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4';

        return `
            <div class="${containerClass}">
                ${tarjetasHTML}
            </div>
        `;
    }
};

// Exponer globalmente
window.ElementoCard = ElementoCard;

export default ElementoCard;