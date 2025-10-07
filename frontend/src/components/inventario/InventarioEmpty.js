// frontend/src/components/inventario/InventarioEmpty.js

/**
 * Componente: Estado vacío del inventario
 * Se muestra cuando no hay elementos registrados
 * 
 * RESPONSABILIDAD: Renderizar una vista amigable y educativa cuando el inventario está vacío
 */
export const InventarioEmpty = {
    
    /**
     * Renderiza el estado vacío completo
     */
    render() {
        return `
            <div class="text-center py-16 fade-in">
                ${this.renderIcono()}
                ${this.renderMensajePrincipal()}
                ${this.renderBotonAccion()}
                ${this.renderInfoCards()}
            </div>
        `;
    },

    /**
     * Renderiza el ícono principal
     */
    renderIcono() {
        return `
            <div class="mb-6">
                <svg class="w-24 h-24 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                </svg>
            </div>
        `;
    },

    /**
     * Renderiza el mensaje principal
     */
    renderMensajePrincipal() {
        return `
            <h3 class="text-xl font-semibold text-gray-700 mb-2">
                No hay elementos en el inventario
            </h3>
            <p class="text-gray-500 mb-6">
                Comienza agregando tu primer elemento
            </p>
        `;
    },

    /**
     * Renderiza el botón de acción principal
     */
    renderBotonAccion() {
        return `
            <button 
                onclick="window.inventarioController.crearElemento()" 
                class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold inline-flex items-center gap-2 shadow-md hover:shadow-lg">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Crear Primer Elemento
            </button>
        `;
    },

    /**
     * Renderiza las tarjetas informativas sobre tipos de elementos
     */
    renderInfoCards() {
        return `
            <div class="mt-12 max-w-4xl mx-auto">
                <h4 class="text-lg font-semibold text-gray-700 mb-4">
                    Tipos de elementos que puedes gestionar
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${this.renderInfoCard({
                        icon: '🔢',
                        title: 'Elementos con Series',
                        description: 'Identificación única para cada unidad',
                        examples: 'Carpas, equipos de sonido, proyectores',
                        color: 'blue'
                    })}
                    ${this.renderInfoCard({
                        icon: '📊',
                        title: 'Elementos por Lotes',
                        description: 'Gestión por cantidad con seguimiento de estados',
                        examples: 'Tubos, lonas, tornillos, cables',
                        color: 'green'
                    })}
                </div>
            </div>
        `;
    },

    /**
     * Renderiza una tarjeta informativa individual
     */
    renderInfoCard({ icon, title, description, examples, color }) {
        const colorClasses = this.getColorClasses(color);
        
        return `
            <div class="${colorClasses.bg} border ${colorClasses.border} rounded-lg p-6 text-left">
                <div class="text-3xl mb-3">${icon}</div>
                <h5 class="font-semibold text-gray-800 mb-2">${title}</h5>
                <p class="text-sm text-gray-600 mb-3">${description}</p>
                <p class="text-xs text-gray-500">
                    <strong>Ejemplos:</strong> ${examples}
                </p>
            </div>
        `;
    },

    /**
     * Obtiene las clases de color según el tipo
     */
    getColorClasses(color) {
        const colors = {
            blue: {
                bg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
                border: 'border-blue-200'
            },
            green: {
                bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
                border: 'border-green-200'
            },
            purple: {
                bg: 'bg-gradient-to-br from-purple-50 to-pink-50',
                border: 'border-purple-200'
            }
        };

        return colors[color] || colors.blue;
    },

    /**
     * Renderiza una versión compacta (para usar en otras vistas)
     */
    renderCompacto({ mensaje = 'No hay elementos', accion = null }) {
        return `
            <div class="text-center py-8">
                <div class="mb-4">
                    <svg class="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                    </svg>
                </div>
                <p class="text-gray-500 mb-4">${mensaje}</p>
                ${accion ? `
                    <button 
                        onclick="${accion.onclick}" 
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                        ${accion.texto}
                    </button>
                ` : ''}
            </div>
        `;
    }
};

// Exponer globalmente
window.InventarioEmpty = InventarioEmpty;

export default InventarioEmpty;