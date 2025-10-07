// frontend/src/components/inventario/ElementoCardFooter.js

/**
 * Componente: Footer de tarjeta de elemento
 * Contiene los botones de acción
 * 
 * RESPONSABILIDAD: Renderizar los botones de acción
 * - Ver detalle
 * - Editar
 * - Eliminar
 * - Gestionar estados (para lotes)
 */
export const ElementoCardFooter = {
    
    /**
     * Renderiza el footer completo con todos los botones
     */
    render(elemento) {
        return `
            <div class="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                ${this.renderBotonVer(elemento)}
                ${this.renderBotonEditar(elemento)}
                ${elemento.es_grupo && !elemento.requiere_series 
                    ? this.renderBotonGestionarEstados(elemento)
                    : ''
                }
                ${this.renderBotonEliminar(elemento)}
            </div>
        `;
    },

    /**
     * Renderiza el botón "Ver"
     */
    renderBotonVer(elemento) {
        return `
            <button 
                onclick="window.inventarioController.verDetalle(${elemento.id})" 
                class="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium flex items-center justify-center gap-1"
                title="Ver detalles completos">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                Ver
            </button>
        `;
    },

    /**
     * Renderiza el botón "Editar"
     */
    renderBotonEditar(elemento) {
        return `
            <button 
                onclick="window.inventarioController.editarElemento(${elemento.id})" 
                class="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-medium"
                title="Editar elemento">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
            </button>
        `;
    },

    /**
     * Renderiza el botón "Gestionar Estados" (solo para grupos de lotes)
     */
    renderBotonGestionarEstados(elemento) {
        return `
            <button 
                onclick="window.inventarioController.gestionarEstados(${elemento.id})" 
                class="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition text-sm font-medium"
                title="Gestionar estados de lotes">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                </svg>
            </button>
        `;
    },

    /**
     * Renderiza el botón "Eliminar"
     */
    renderBotonEliminar(elemento) {
        return `
            <button 
                onclick="window.inventarioController.eliminar(${elemento.id})" 
                class="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium"
                title="Eliminar elemento">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
            </button>
        `;
    },

    /**
     * Renderiza footer compacto (solo botón ver)
     */
    renderCompacto(elemento) {
        return `
            <div class="pt-3 border-t">
                <button 
                    onclick="window.inventarioController.verDetalle(${elemento.id})" 
                    class="w-full px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium">
                    Ver Detalles
                </button>
            </div>
        `;
    },

    /**
     * Renderiza footer para listado (botones horizontales compactos)
     */
    renderListado(elemento) {
        return `
            <div class="flex gap-1">
                <button 
                    onclick="window.inventarioController.verDetalle(${elemento.id})" 
                    class="flex-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition"
                    title="Ver">
                    👁
                </button>
                <button 
                    onclick="window.inventarioController.editarElemento(${elemento.id})" 
                    class="flex-1 px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition"
                    title="Editar">
                    ✏️
                </button>
                ${elemento.es_grupo && !elemento.requiere_series ? `
                    <button 
                        onclick="window.inventarioController.gestionarEstados(${elemento.id})" 
                        class="flex-1 px-2 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 transition"
                        title="Estados">
                        🔄
                    </button>
                ` : ''}
                <button 
                    onclick="window.inventarioController.eliminar(${elemento.id})" 
                    class="flex-1 px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition"
                    title="Eliminar">
                    🗑️
                </button>
            </div>
        `;
    }
};

// Exponer globalmente
window.ElementoCardFooter = ElementoCardFooter;

export default ElementoCardFooter;