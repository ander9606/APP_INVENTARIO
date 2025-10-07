// frontend/src/components/inventario/EstadoBar.js

import { CURRENT_STATUS_INFO, calcularPorcentaje } from '../../utils/inventarioHelpers.js';

/**
 * Componente: Barra de progreso para mostrar distribución de estados
 * Muestra visualmente cómo se distribuyen las unidades entre diferentes estados
 * 
 * @param {object} distribucion - Objeto con {AVAILABLE: 10, RENTED: 5, ...}
 * @param {number} total - Total de unidades
 * @param {boolean} mostrarLeyenda - Si debe mostrar leyenda con números
 * @param {string} tamano - 'small', 'medium', 'large'
 */
export const EstadoBar = {
    
    /**
     * Renderiza la barra de progreso completa
     */
    render({ distribucion, total, mostrarLeyenda = true, tamano = 'medium' }) {
        if (!distribucion || total === 0) {
            return this.renderVacio();
        }

        const altura = this.obtenerAltura(tamano);
        
        return `
            <div class="estado-bar-container">
                ${mostrarLeyenda ? this.renderLeyenda(distribucion, total) : ''}
                ${this.renderBarra(distribucion, total, altura)}
            </div>
        `;
    },

    /**
     * Renderiza la leyenda con cantidades
     */
    renderLeyenda(distribucion, total) {
        const items = Object.entries(distribucion)
            .filter(([_, cantidad]) => cantidad > 0)
            .sort((a, b) => b[1] - a[1]) // Ordenar por cantidad desc
            .map(([estado, cantidad]) => {
                const info = CURRENT_STATUS_INFO[estado];
                const porcentaje = calcularPorcentaje(cantidad, total);
                
                return `
                    <div class="flex items-center gap-1 text-xs">
                        <span class="text-base">${info?.icon || '📦'}</span>
                        <span class="font-medium text-gray-700">${cantidad}</span>
                        <span class="text-gray-500">(${porcentaje}%)</span>
                        <span class="text-gray-600">${info?.label || estado}</span>
                    </div>
                `;
            })
            .join('');

        return `
            <div class="flex flex-wrap gap-3 mb-2">
                ${items}
            </div>
        `;
    },

    /**
     * Renderiza la barra de progreso visual
     */
    renderBarra(distribucion, total, altura) {
        const segmentos = Object.entries(distribucion)
            .filter(([_, cantidad]) => cantidad > 0)
            .map(([estado, cantidad]) => {
                const porcentaje = calcularPorcentaje(cantidad, total);
                const info = CURRENT_STATUS_INFO[estado];
                const colorBg = this.extraerColorFondo(info?.color);
                
                return {
                    estado,
                    cantidad,
                    porcentaje,
                    color: colorBg,
                    label: info?.label || estado
                };
            })
            .sort((a, b) => b.porcentaje - a.porcentaje); // Más grande primero

        const segmentosHTML = segmentos
            .map(seg => this.renderSegmento(seg, altura))
            .join('');

        return `
            <div class="w-full bg-gray-200 rounded-full overflow-hidden ${altura} flex">
                ${segmentosHTML}
            </div>
        `;
    },

    /**
     * Renderiza un segmento individual de la barra
     */
    renderSegmento(segmento, altura) {
        if (segmento.porcentaje < 1) return ''; // No mostrar si es muy pequeño

        return `
            <div 
                class="${segmento.color} flex items-center justify-center transition-all"
                style="width: ${segmento.porcentaje}%"
                title="${segmento.label}: ${segmento.cantidad} unidades (${segmento.porcentaje}%)">
                ${segmento.porcentaje > 15 ? `
                    <span class="text-xs font-bold text-gray-700 px-1">
                        ${segmento.cantidad}
                    </span>
                ` : ''}
            </div>
        `;
    },

    /**
     * Renderiza estado vacío
     */
    renderVacio() {
        return `
            <div class="w-full bg-gray-100 rounded-full h-6 flex items-center justify-center">
                <span class="text-xs text-gray-400">Sin unidades</span>
            </div>
        `;
    },

    /**
     * Extrae el color de fondo de una clase Tailwind
     */
    extraerColorFondo(colorClass) {
        if (!colorClass) return 'bg-gray-300';
        
        // Extrae solo la parte del bg-color-number
        const match = colorClass.match(/bg-(\w+)-(\d+)/);
        if (match) {
            return `bg-${match[1]}-${match[2]}`;
        }
        
        return 'bg-gray-300';
    },

    /**
     * Obtiene la clase de altura según el tamaño
     */
    obtenerAltura(tamano) {
        const alturas = {
            small: 'h-4',
            medium: 'h-6',
            large: 'h-8'
        };
        
        return alturas[tamano] || 'h-6';
    },

    /**
     * Renderiza una barra simple (sin leyenda)
     */
    renderSimple(distribucion, total) {
        return this.render({
            distribucion,
            total,
            mostrarLeyenda: false,
            tamano: 'small'
        });
    },

    /**
     * Renderiza versión compacta (solo barra, tamaño pequeño)
     */
    renderCompacta(distribucion, total) {
        if (!distribucion || total === 0) {
            return `<div class="text-xs text-gray-400">0 unidades</div>`;
        }

        return `
            <div class="space-y-1">
                <div class="flex justify-between text-xs text-gray-600">
                    <span>Distribución</span>
                    <span class="font-medium">${total} unidades</span>
                </div>
                ${this.renderBarra(distribucion, total, 'h-4')}
            </div>
        `;
    }
};

// Exponer globalmente
window.EstadoBar = EstadoBar;

export default EstadoBar;