/**
 * Gestor de series dinámicas para elementos con números de serie
 * Maneja la adición, eliminación y recopilación de series en formularios
 */
export const seriesManager = {
    
    /**
     * Alterna la visibilidad de campos según si requiere series
     */
    toggle() {
        const checkbox = document.getElementById('requiere_series');
        const containerSeries = document.getElementById('container-series');
        const campoUbicacion = document.getElementById('campo-ubicacion');
        const inputCantidad = document.getElementById('cantidad');

        if (!checkbox || !containerSeries || !campoUbicacion || !inputCantidad) {
            console.error('SeriesManager: Elementos del DOM no encontrados');
            return;
        }

        if (checkbox.checked) {
            // MODO: Con series
            containerSeries.classList.remove('hidden');
            campoUbicacion.classList.add('hidden');
            
            // Deshabilitar cantidad (se calculará automáticamente)
            inputCantidad.disabled = true;
            inputCantidad.value = 0;
            inputCantidad.classList.add('bg-gray-100');
            
            // Limpiar series previas y agregar el primer campo
            this.limpiar();
            this.agregarCampo();
            
        } else {
            // MODO: Sin series
            containerSeries.classList.add('hidden');
            campoUbicacion.classList.remove('hidden');
            
            // Habilitar cantidad manual
            inputCantidad.disabled = false;
            inputCantidad.value = 1;
            inputCantidad.classList.remove('bg-gray-100');
            
            // Limpiar todas las series
            this.limpiar();
        }
    },

    /**
     * Agrega un nuevo campo de input para un número de serie
     */
    agregarCampo() {
        const listaSeries = document.getElementById('lista-series');
        
        if (!listaSeries) {
            console.error('SeriesManager: No se encontró lista-series');
            return;
        }

        const index = listaSeries.children.length;

        const campoHTML = `
            <div class="flex gap-2 items-center fade-in" data-serie-index="${index}">
                <input 
                    type="text" 
                    placeholder="Número de serie (ej: C10X10-${String(index + 1).padStart(3, '0')})"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none serie-input"
                    data-index="${index}"
                    required
                >
                <button 
                    type="button"
                    onclick="window.seriesManager.eliminarCampo(this)"
                    class="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    title="Eliminar esta serie">
                    ✕
                </button>
            </div>
        `;

        listaSeries.insertAdjacentHTML('beforeend', campoHTML);
        
        // Actualizar contador de cantidad
        this.actualizarCantidad();
        
        // Hacer focus en el nuevo campo
        const nuevoInput = listaSeries.querySelector(`[data-index="${index}"]`);
        if (nuevoInput) {
            nuevoInput.focus();
        }
    },

    /**
     * Elimina un campo de serie
     * @param {HTMLElement} boton - Botón que disparó la eliminación
     */
    eliminarCampo(boton) {
        const contenedor = boton.closest('[data-serie-index]');
        
        if (contenedor) {
            // Animación de salida
            contenedor.style.opacity = '0';
            contenedor.style.transform = 'translateX(-10px)';
            contenedor.style.transition = 'all 0.2s ease';
            
            setTimeout(() => {
                contenedor.remove();
                this.actualizarCantidad();
                this.reindexar();
            }, 200);
        }
    },

    /**
     * Actualiza el campo cantidad según el número de series
     */
    actualizarCantidad() {
        const listaSeries = document.getElementById('lista-series');
        const inputCantidad = document.getElementById('cantidad');
        
        if (!listaSeries || !inputCantidad) return;
        
        const totalSeries = listaSeries.children.length;
        inputCantidad.value = totalSeries;
    },

    /**
     * Re-indexa los campos de serie después de eliminar uno
     */
    reindexar() {
        const listaSeries = document.getElementById('lista-series');
        if (!listaSeries) return;

        const campos = listaSeries.children;
        
        Array.from(campos).forEach((campo, index) => {
            campo.setAttribute('data-serie-index', index);
            const input = campo.querySelector('.serie-input');
            if (input) {
                input.setAttribute('data-index', index);
            }
        });
    },

    /**
     * Recopila todos los números de serie ingresados
     * @param {string} estado - Estado por defecto para las series
     * @returns {Array} - Array de objetos con información de series
     */
    recopilar(estado = 'nuevo') {
        const inputsSeries = document.querySelectorAll('.serie-input');
        const series = [];

        inputsSeries.forEach(input => {
            const numeroSerie = input.value.trim();
            
            if (numeroSerie) {
                series.push({
                    numero_serie: numeroSerie,
                    estado: estado,
                    fecha_ingreso: new Date().toISOString().split('T')[0],
                    ubicacion: null
                });
            }
        });

        return series;
    },

    /**
     * Limpia todos los campos de serie
     */
    limpiar() {
        const listaSeries = document.getElementById('lista-series');
        if (listaSeries) {
            listaSeries.innerHTML = '';
        }
        this.actualizarCantidad();
    },

    /**
     * Verifica si hay campos de serie vacíos
     * @returns {boolean} - true si hay campos vacíos
     */
    tieneSeriesVacias() {
        const inputsSeries = document.querySelectorAll('.serie-input');
        
        for (const input of inputsSeries) {
            if (!input.value.trim()) {
                return true;
            }
        }
        
        return false;
    },

    /**
     * Obtiene el número total de series ingresadas
     * @returns {number}
     */
    obtenerTotal() {
        const inputsSeries = document.querySelectorAll('.serie-input');
        return inputsSeries.length;
    },

    /**
     * Precarga series en el formulario (útil para edición)
     * @param {Array} series - Array de objetos con series a cargar
     */
    precargar(series) {
        this.limpiar();
        
        if (!series || series.length === 0) return;

        series.forEach(serie => {
            this.agregarCampo();
            const inputs = document.querySelectorAll('.serie-input');
            const ultimoInput = inputs[inputs.length - 1];
            if (ultimoInput) {
                ultimoInput.value = serie.numero_serie;
            }
        });
    }
};

// Exponer globalmente para los onclick en HTML
window.seriesManager = seriesManager;