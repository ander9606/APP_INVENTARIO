// frontend/src/components/inventario/ElementoCardHeader.js

import { 
    CURRENT_STATUS_INFO, 
    COLORES_ESTADO_CLASICO,
    truncateText,
    obtenerEstadoDominante 
} from '../../utils/inventarioHelpers.js';

/**
 * Componente: Header de tarjeta de elemento
 * Muestra nombre y estado principal
 * 
 * RESPONSABILIDAD: Renderizar la parte superior de la tarjeta
 * - Nombre del elemento (truncado si es necesario)
 * - Badge de estado principal
 */
export const ElementoCardHeader = {
    
    /**
     * Renderiza el header completo
     * @param {object} elemento - Datos del elemento
     * @returns {string} HTML del header
     */
    render(elemento) {
        const estadoPrincipal = this.obtenerEstadoPrincipal(elemento);
        const colorEstado = this.obtenerColorEstado(elemento, estadoPrincipal);
        
        return `
            <div class="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200">
                <div class="flex justify-between items-start gap-2">
                    ${this.renderNombre(elemento)}
                    ${this.renderBadgeEstado(estadoPrincipal, colorEstado)}
                </div>
                ${elemento.es_grupo ? this.renderIndicadorGrupo(elemento) : ''}
            </div>
        `;
    },

    /**
     * Renderiza el nombre del elemento
     */
    renderNombre(elemento) {
        const nombreTruncado = truncateText(elemento.nombre, 35);
        const tieneTitulo = elemento.nombre.length > 35;
        
        return `
            <h3 
                class="font-bold text-lg text-gray-800 leading-tight flex-1" 
                ${tieneTitulo ? `title="${elemento.nombre}"` : ''}>
                ${nombreTruncado}
            </h3>
        `;
    },

    /**
     * Renderiza el badge de estado
     */
    renderBadgeEstado(estado, colorClass) {
        return `
            <span class="px-2 py-1 text-xs rounded-full font-medium ${colorClass} whitespace-nowrap">
                ${estado}
            </span>
        `;
    },

    /**
     * Renderiza indicador de que es un grupo de lotes
     */
    renderIndicadorGrupo(elemento) {
        return `
            <div class="mt-2 flex items-center gap-2 text-xs text-gray-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
                <span>${elemento.lotes.length} lote${elemento.lotes.length !== 1 ? 's' : ''}</span>
                <span class="text-gray-400">•</span>
                <span class="font-medium">${elemento.total_unidades} unidades totales</span>
            </div>
        `;
    },

    /**
     * Obtiene el estado principal a mostrar
     */
    obtenerEstadoPrincipal(elemento) {
        if (elemento.requiere_series) {
            // Para series, usar el estado clásico
            return elemento.estado || 'bueno';
        }

        if (elemento.es_grupo && elemento.distribucion_estados) {
            // Para grupos, usar el estado dominante
            const estadoDominante = obtenerEstadoDominante(elemento.distribucion_estados);
            const info = CURRENT_STATUS_INFO[estadoDominante];
            return info?.label || estadoDominante;
        }

        // Para lotes individuales
        const info = CURRENT_STATUS_INFO[elemento.current_status];
        return info?.label || elemento.current_status;
    },

    /**
     * Obtiene el color del estado
     */
    obtenerColorEstado(elemento, estadoPrincipal) {
        if (elemento.requiere_series) {
            // Para series, usar colores clásicos
            return COLORES_ESTADO_CLASICO[elemento.estado] || 'bg-gray-100 text-gray-800';
        }

        // Para lotes, buscar en el mapeo de current_status
        if (elemento.es_grupo && elemento.distribucion_estados) {
            const estadoDominante = obtenerEstadoDominante(elemento.distribucion_estados);
            const info = CURRENT_STATUS_INFO[estadoDominante];
            return info?.color || 'bg-gray-100 text-gray-800';
        }

        const info = CURRENT_STATUS_INFO[elemento.current_status];
        return info?.color || 'bg-gray-100 text-gray-800';
    },

    /**
     * Renderiza header compacto (sin indicador de grupo)
     */
    renderCompacto(elemento) {
        const estadoPrincipal = this.obtenerEstadoPrincipal(elemento);
        const colorEstado = this.obtenerColorEstado(elemento, estadoPrincipal);
        
        return `
            <div class="flex justify-between items-center p-3 bg-gray-50 border-b">
                <h4 class="font-semibold text-gray-800 truncate flex-1">
                    ${truncateText(elemento.nombre, 30)}
                </h4>
                <span class="px-2 py-1 text-xs rounded-full font-medium ${colorEstado} ml-2">
                    ${estadoPrincipal}
                </span>
            </div>
        `;
    }
};

// Exponer globalmente
window.ElementoCardHeader = ElementoCardHeader;

export default ElementoCardHeader;