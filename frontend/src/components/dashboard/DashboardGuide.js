/**
 * Componente de Guía Rápida para Dashboard
 * Muestra instrucciones paso a paso para usar el sistema
 */
export const DashboardGuide = {
    /**
     * Renderiza la guía rápida completa
     * @returns {string} HTML de la guía
     */
    render() {
        const pasos = this.getPasos();
        
        return `
            <div class="mt-8 max-w-6xl mx-auto">
                <div class="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        ${this.getIconGuide()}
                        Guía Rápida de Uso
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        ${pasos.map(paso => this.renderPaso(paso)).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Obtiene el array de pasos de la guía
     * @returns {Array} Array de objetos con información de cada paso
     */
    getPasos() {
        return [
            {
                numero: 1,
                titulo: 'Crear Categorías',
                descripcion: 'Organiza tu inventario creando categorías como "Carpas", "Tubos", "Lonas", etc.',
                color: 'blue'
            },
            {
                numero: 2,
                titulo: 'Agregar Elementos',
                descripcion: 'Registra tus elementos eligiendo si necesitan números de serie individuales o solo cantidad.',
                color: 'green'
            },
            {
                numero: 3,
                titulo: 'Gestionar Series',
                descripcion: 'Para elementos con series (carpas, equipos), asigna identificadores únicos como "C10X10-001".',
                color: 'purple'
            },
            {
                numero: 4,
                titulo: 'Controlar Stock',
                descripcion: 'Mantén el control de cantidades y estados de cada elemento en tu inventario.',
                color: 'orange'
            }
        ];
    },

    /**
     * Renderiza un paso individual de la guía
     * @param {object} paso - Objeto con datos del paso
     * @returns {string} HTML del paso
     */
    renderPaso(paso) {
        return `
            <div class="flex gap-3">
                <div class="flex-shrink-0 w-8 h-8 bg-${paso.color}-100 text-${paso.color}-600 rounded-full flex items-center justify-center font-bold">
                    ${paso.numero}
                </div>
                <div>
                    <p class="font-semibold text-gray-800 mb-1">${paso.titulo}</p>
                    <p class="text-gray-600 leading-relaxed">${paso.descripcion}</p>
                </div>
            </div>
        `;
    },

    /**
     * Renderiza consejos adicionales
     * @returns {string} HTML de los consejos
     */
    renderConsejos() {
        const consejos = [
            {
                icono: '💡',
                titulo: 'Tip: Usa subcategorías',
                descripcion: 'Dentro de "Carpas" puedes crear "Carpas grandes", "Carpas medianas", etc.'
            },
            {
                icono: '🎯',
                titulo: 'Elementos con series',
                descripcion: 'Usa series cuando necesites rastrear cada pieza individualmente (ej: equipos caros).'
            },
            {
                icono: '📊',
                titulo: 'Stock general',
                descripcion: 'Para materiales como tornillos o lonas, usa cantidad sin series.'
            }
        ];

        return `
            <div class="mt-6 pt-6 border-t border-gray-200">
                <h4 class="text-md font-semibold text-gray-700 mb-3">Consejos Útiles</h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    ${consejos.map(consejo => this.renderConsejo(consejo)).join('')}
                </div>
            </div>
        `;
    },

    /**
     * Renderiza un consejo individual
     * @param {object} consejo - Objeto con datos del consejo
     * @returns {string} HTML del consejo
     */
    renderConsejo(consejo) {
        return `
            <div class="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <div class="flex items-center gap-2 mb-1">
                    <span class="text-xl">${consejo.icono}</span>
                    <span class="font-semibold text-gray-800 text-sm">${consejo.titulo}</span>
                </div>
                <p class="text-xs text-gray-600">${consejo.descripcion}</p>
            </div>
        `;
    },

    /**
     * Renderiza una guía extendida con consejos
     * @returns {string} HTML de la guía completa con consejos
     */
    renderExtendida() {
        const pasos = this.getPasos();
        
        return `
            <div class="mt-8 max-w-6xl mx-auto">
                <div class="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        ${this.getIconGuide()}
                        Guía Rápida de Uso
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        ${pasos.map(paso => this.renderPaso(paso)).join('')}
                    </div>
                    ${this.renderConsejos()}
                </div>
            </div>
        `;
    },

    /**
     * Obtiene el ícono SVG de guía/bombilla
     * @returns {string} SVG del icono
     */
    getIconGuide() {
        return `
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
        `;
    }
};