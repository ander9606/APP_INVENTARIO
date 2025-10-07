// frontend/src/components/inventario/ElementoCardBody.js

import { truncateText, cantidadDisponible } from '../../utils/inventarioHelpers.js';
import { EstadoBar } from './EstadoBar.js';

/**
 * Componente: Body de tarjeta de elemento
 * Distingue entre elementos con series y elementos con lotes
 * 
 * RESPONSABILIDAD: Renderizar el contenido principal de la tarjeta
 * - Para elementos con series: muestra cantidad de series
 * - Para elementos con lotes: muestra distribución de estados con barras
 */
export const ElementoCardBody = {
    
    /**
     * Renderiza el body completo
     * Delega a métodos específicos según el tipo de elemento
     */
    render(elemento) {
        return `
            <div class="p-5">
                ${this.renderDescripcion(elemento)}
                ${this.renderInfoBasica(elemento)}
                ${elemento.requiere_series 
                    ? this.renderInfoSeries(elemento)
                    : this.renderInfoLotes(elemento)
                }
            </div>
        `;
    },

    /**
     * Renderiza la descripción (si existe)
     */
    renderDescripcion(elemento) {
        if (!elemento.descripcion) return '';
        
        return `
            <p class="text-sm text-gray-600 mb-3 line-clamp-2" title="${elemento.descripcion}">
                ${truncateText(elemento.descripcion, 100)}
            </p>
        `;
    },

    /**
     * Renderiza información básica (categoría, ubicación)
     */
    renderInfoBasica(elemento) {
        const items = [];

        // Categoría
        const categoria = elemento.categoria_nombre || elemento.subcategoria_nombre;
        if (categoria) {
            items.push(this.renderInfoRow('Categoría', categoria, '📁'));
        }

        // Ubicación (solo si no tiene series y no es grupo)
        if (!elemento.requiere_series && !elemento.es_grupo && elemento.ubicacion) {
            items.push(this.renderInfoRow('Ubicación', elemento.ubicacion, '📍'));
        }

        return items.length > 0 ? `
            <div class="space-y-2 text-sm mb-3">
                ${items.join('')}
            </div>
        ` : '';
    },

    /**
     * Renderiza información para elementos con series
     */
    renderInfoSeries(elemento) {
        return `
            <div class="space-y-2 text-sm">
                ${this.renderInfoRow('Cantidad', elemento.cantidad, '📦')}
                <div class="flex items-center gap-2 text-blue-600 text-sm font-medium pt-2 border-t">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                    </svg>
                    <span>Con series individuales</span>
                </div>
            </div>
        `;
    },

    /**
     * Renderiza información para elementos con lotes (distribución de estados)
     */
    renderInfoLotes(elemento) {
        if (!elemento.es_grupo) {
            // Es un lote individual, no un grupo
            return this.renderLoteIndividual(elemento);
        }

        // Es un grupo de lotes - mostrar distribución
        return `
            <div class="space-y-3">
                <div class="flex justify-between items-center text-sm">
                    <span class="text-gray-600 font-medium">Distribución de estados</span>
                    <span class="text-gray-500">
                        ${cantidadDisponible(elemento)} disponibles
                    </span>
                </div>
                ${EstadoBar.renderCompacta(
                    elemento.distribucion_estados, 
                    elemento.total_unidades
                )}
                <div class="flex items-center gap-2 text-gray-500 text-sm">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                    <span>Gestión por lotes</span>
                </div>
            </div>
        `;
    },

    /**
     * Renderiza información de un lote individual (no agrupado)
     */
    renderLoteIndividual(elemento) {
        return `
            <div class="space-y-2 text-sm">
                ${this.renderInfoRow('Cantidad', elemento.cantidad, '📦')}
                ${elemento.lote_numero ? this.renderInfoRow('Lote', elemento.lote_numero, '🏷️') : ''}
                <div class="flex items-center gap-2 text-gray-500 text-sm pt-2 border-t">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                    <span>Lote individual</span>
                </div>
            </div>
        `;
    },

    /**
     * Renderiza una fila de información (helper)
     */
    renderInfoRow(label, value, icon) {
        return `
            <div class="flex items-start gap-2">
                <span class="text-base flex-shrink-0">${icon}</span>
                <div class="flex-1 min-w-0">
                    <span class="text-gray-500 text-xs">${label}:</span>
                    <span class="text-gray-800 font-medium ml-1 truncate">${value}</span>
                </div>
            </div>
        `;
    },

    /**
     * Renderiza versión compacta del body
     */
    renderCompacto(elemento) {
        if (elemento.requiere_series) {
            return `
                <div class="p-3 text-sm text-gray-600">
                    ${elemento.cantidad} unidad${elemento.cantidad !== 1 ? 'es' : ''} con series
                </div>
            `;
        }

        if (elemento.es_grupo) {
            return `
                <div class="p-3">
                    ${EstadoBar.renderSimple(
                        elemento.distribucion_estados,
                        elemento.total_unidades
                    )}
                </div>
            `;
        }

        return `
            <div class="p-3 text-sm text-gray-600">
                ${elemento.cantidad} unidades en lote
            </div>
        `;
    }
};

// Exponer globalmente
window.ElementoCardBody = ElementoCardBody;

export default ElementoCardBody;