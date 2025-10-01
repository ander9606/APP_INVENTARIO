/**
 * Componente genérico de tarjeta (Card)
 * Reutilizable en cualquier parte del sistema
 * 
 * USO:
 * import { Card } from './components/Card.js';
 * 
 * const html = Card.render({
 *   title: 'Mi Tarjeta',
 *   description: 'Descripción...',
 *   onClick: () => console.log('Click!')
 * });
 */

export const Card = {
    /**
     * Renderiza una tarjeta básica
     * @param {object} opciones - Configuración de la tarjeta
     * @param {string} opciones.title - Título de la tarjeta
     * @param {string} opciones.description - Descripción
     * @param {string} opciones.icon - Emoji o HTML del icono
     * @param {string} opciones.onClick - Acción onclick (string de código)
     * @param {string} opciones.classes - Clases CSS adicionales
     * @returns {string} HTML de la tarjeta
     */
    render({ title, description, icon = '', onClick = '', classes = '' }) {
        return `
            <div 
                class="bg-white p-6 rounded-xl shadow-md border-2 border-transparent hover:shadow-lg transition-all duration-300 ${classes}"
                ${onClick ? `onclick="${onClick}"` : ''}
                style="cursor: ${onClick ? 'pointer' : 'default'}">
                ${icon ? `<div class="text-4xl mb-4">${icon}</div>` : ''}
                <h3 class="text-xl font-bold mb-2 text-gray-800">${title}</h3>
                ${description ? `<p class="text-gray-600 text-sm">${description}</p>` : ''}
            </div>
        `;
    },

    /**
     * Renderiza una tarjeta interactiva con efecto hover y navegación
     * @param {object} opciones - Configuración
     * @param {string} opciones.icon - Emoji del icono (grande)
     * @param {string} opciones.title - Título
     * @param {string} opciones.description - Descripción
     * @param {string} opciones.action - Vista a navegar
     * @param {string} opciones.color - Color del tema (blue, green, purple, etc.)
     * @returns {string} HTML de la tarjeta
     */
    renderActionCard({ icon, title, description, action, color = 'blue' }) {
        const colorClasses = this.getColorClasses(color);
        
        return `
            <div 
                class="bg-white p-6 rounded-xl shadow-md border-2 border-transparent ${colorClasses.hover} transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                onclick="window.app.navegarA('${action}')">
                <div class="text-5xl mb-4">${icon}</div>
                <h3 class="text-xl font-bold mb-2 text-gray-800">${title}</h3>
                <p class="text-gray-600 text-sm leading-relaxed">${description}</p>
                <div class="mt-4 flex items-center text-${color}-600 font-medium text-sm">
                    <span>Ir a ${title}</span>
                    <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                </div>
            </div>
        `;
    },

    /**
     * Renderiza una tarjeta deshabilitada (próximamente)
     * @param {object} opciones - Configuración
     * @param {string} opciones.icon - Emoji del icono
     * @param {string} opciones.title - Título
     * @param {string} opciones.description - Descripción
     * @param {string} opciones.badge - Texto del badge (default: "Próximamente")
     * @returns {string} HTML de la tarjeta
     */
    renderDisabledCard({ icon, title, description, badge = 'Próximamente' }) {
        return `
            <div class="bg-white p-6 rounded-xl shadow-md border-2 border-gray-200 opacity-60 cursor-not-allowed">
                <div class="text-5xl mb-4 grayscale">${icon}</div>
                <h3 class="text-xl font-bold mb-2 text-gray-500">${title}</h3>
                <p class="text-gray-400 mb-4 text-sm">${description}</p>
                <span class="inline-block px-3 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">
                    ${badge}
                </span>
            </div>
        `;
    },

    /**
     * Renderiza una tarjeta de información (estadística)
     * @param {object} opciones - Configuración
     * @param {string} opciones.label - Etiqueta
     * @param {string} opciones.value - Valor a mostrar
     * @param {string} opciones.icon - Icono SVG o emoji
     * @param {string} opciones.color - Color (blue, green, purple, etc.)
     * @returns {string} HTML de la tarjeta
     */
    renderInfoCard({ label, value, icon = '', color = 'blue' }) {
        return `
            <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                ${icon ? `<div class="text-2xl mb-2 text-${color}-600">${icon}</div>` : ''}
                <p class="text-gray-600 text-sm mb-1">${label}</p>
                <p class="font-semibold text-gray-800 text-lg">${value}</p>
            </div>
        `;
    },

    /**
     * Obtiene las clases CSS de color para hover
     * @param {string} color - Nombre del color
     * @returns {object} Objeto con clases CSS
     */
    getColorClasses(color) {
        const colores = {
            blue: {
                hover: 'hover:border-blue-400 hover:shadow-blue-100',
                text: 'text-blue-600',
                bg: 'bg-blue-100'
            },
            green: {
                hover: 'hover:border-green-400 hover:shadow-green-100',
                text: 'text-green-600',
                bg: 'bg-green-100'
            },
            purple: {
                hover: 'hover:border-purple-400 hover:shadow-purple-100',
                text: 'text-purple-600',
                bg: 'bg-purple-100'
            },
            orange: {
                hover: 'hover:border-orange-400 hover:shadow-orange-100',
                text: 'text-orange-600',
                bg: 'bg-orange-100'
            },
            indigo: {
                hover: 'hover:border-indigo-400 hover:shadow-indigo-100',
                text: 'text-indigo-600',
                bg: 'bg-indigo-100'
            },
            gray: {
                hover: 'hover:border-gray-400 hover:shadow-gray-100',
                text: 'text-gray-600',
                bg: 'bg-gray-100'
            },
            red: {
                hover: 'hover:border-red-400 hover:shadow-red-100',
                text: 'text-red-600',
                bg: 'bg-red-100'
            }
        };

        return colores[color] || colores.blue;
    }
};