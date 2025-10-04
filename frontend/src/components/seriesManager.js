/**
 * Gestor de números de serie en formularios
 * Maneja la interfaz de usuario para agregar/quitar series dinámicamente
 * 
 * RESPONSABILIDAD: UI de series en formularios (crear/editar elementos)
 */
export const seriesManager = {
    
    /**
     * Contador de series agregadas (para IDs únicos)
     */
    contadorSeries: 0,

    /**
     * Alterna visibilidad del contenedor de series
     * Se ejecuta cuando el usuario marca/desmarca "Requiere series"
     */
    toggle() {
        const checkbox = document.getElementById('requiere_series');
        const container = document.getElementById('container-series');
        const campoUbicacion = document.getElementById('campo-ubicacion');
        const campoCantidad = document.getElementById('cantidad');
        
        if (!checkbox || !container || !campoUbicacion) {
            console.error('Elementos del formulario no encontrados');
            return;
        }

        if (checkbox.checked) {
            // MOSTRAR sección de series
            container.classList.remove('hidden');
            campoUbicacion.classList.add('hidden');
            
            // Auto-generar campos según cantidad
            const cantidad = parseInt(campoCantidad?.value || 1, 10);
            this.generarCamposAutomaticos(cantidad);
            
            // Actualizar cantidad cuando cambie
            if (campoCantidad) {
                campoCantidad.addEventListener('change', () => {
                    this.sincronizarConCantidad();
                });
            }
        } else {
            // OCULTAR sección de series
            container.classList.add('hidden');
            campoUbicacion.classList.remove('hidden');
            
            // Limpiar campos
            this.limpiarCampos();
        }
    },

    /**
     * Genera campos de serie automáticamente según cantidad
     * @param {number} cantidad - Número de campos a generar
     */
    generarCamposAutomaticos(cantidad) {
        const lista = document.getElementById('lista-series');
        if (!lista) return;

        // Limpiar campos existentes
        this.limpiarCampos();

        // Generar campos
        for (let i = 0; i < cantidad; i++) {
            this.agregarCampo();
        }
    },

    /**
     * Sincroniza número de campos de serie con la cantidad del elemento
     */
    sincronizarConCantidad() {
        const campoCantidad = document.getElementById('cantidad');
        const lista = document.getElementById('lista-series');
        
        if (!campoCantidad || !lista) return;

        const cantidadDeseada = parseInt(campoCantidad.value || 0, 10);
        const cantidadActual = lista.children.length;

        if (cantidadDeseada > cantidadActual) {
            // Agregar campos faltantes
            for (let i = cantidadActual; i < cantidadDeseada; i++) {
                this.agregarCampo();
            }
        } else if (cantidadDeseada < cantidadActual) {
            // Eliminar campos sobrantes
            while (lista.children.length > cantidadDeseada) {
                lista.removeChild(lista.lastChild);
            }
        }
    },

    /**
     * Agrega un campo de serie individual al formulario
     */
    agregarCampo() {
        const lista = document.getElementById('lista-series');
        const estado = document.getElementById('estado')?.value || 'nuevo';
        
        if (!lista) {
            console.error('Lista de series no encontrada');
            return;
        }

        this.contadorSeries++;
        const id = this.contadorSeries;

        const campoHTML = `
            <div class="flex gap-2 items-start serie-item" data-serie-id="${id}">
                <div class="flex-1">
                    <input 
                        type="text" 
                        id="serie_numero_${id}"
                        name="serie_numero_${id}"
                        placeholder="Ej: C10X10-001, TUBO-3M-045"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        data-serie-numero
                        required
                    >
                    <input 
                        type="hidden" 
                        id="serie_estado_${id}"
                        name="serie_estado_${id}"
                        value="${estado}"
                        data-serie-estado
                    >
                </div>
                <button 
                    type="button"
                    onclick="window.seriesManager.eliminarCampo(${id})"
                    class="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
                    title="Eliminar serie">
                    ✕
                </button>
            </div>
        `;

        lista.insertAdjacentHTML('beforeend', campoHTML);
    },

    /**
     * Elimina un campo de serie específico
     * @param {number} id - ID del campo a eliminar
     */
    eliminarCampo(id) {
        const campo = document.querySelector(`[data-serie-id="${id}"]`);
        if (campo) {
            campo.remove();
        }

        // Actualizar cantidad
        const campoCantidad = document.getElementById('cantidad');
        const lista = document.getElementById('lista-series');
        if (campoCantidad && lista) {
            campoCantidad.value = lista.children.length;
        }
    },

    /**
     * Recopila todas las series del formulario
     * @param {string} estadoPorDefecto - Estado por defecto si no se especifica
     * @returns {Array} Array de objetos {numero_serie, estado, fecha_ingreso}
     */
    recopilar(estadoPorDefecto = 'nuevo') {
        const series = [];
        const campos = document.querySelectorAll('[data-serie-numero]');

        campos.forEach((campo, index) => {
            const numeroSerie = campo.value.trim();
            
            if (numeroSerie.length > 0) {
                // Buscar el estado asociado
                const campoEstado = campo.parentElement.querySelector('[data-serie-estado]');
                const estado = campoEstado?.value || estadoPorDefecto;

                series.push({
                    numero_serie: numeroSerie,
                    estado: estado,
                    fecha_ingreso: new Date().toISOString().split('T')[0]
                });
            }
        });

        return series;
    },

    /**
     * Valida que no haya series duplicadas
     * @returns {boolean} true si no hay duplicados, false si los hay
     */
    validarNoDuplicados() {
        const campos = document.querySelectorAll('[data-serie-numero]');
        const numeros = new Set();
        let hayDuplicados = false;

        campos.forEach(campo => {
            const numero = campo.value.trim().toUpperCase();
            
            if (numero.length > 0) {
                if (numeros.has(numero)) {
                    hayDuplicados = true;
                    campo.classList.add('border-red-500');
                } else {
                    numeros.add(numero);
                    campo.classList.remove('border-red-500');
                }
            }
        });

        return !hayDuplicados;
    },

    /**
     * Limpia todos los campos de series
     */
    limpiarCampos() {
        const lista = document.getElementById('lista-series');
        if (lista) {
            lista.innerHTML = '';
        }
        this.contadorSeries = 0;
    },

    /**
     * Pre-carga series existentes (para edición)
     * @param {Array} series - Array de series a cargar
     */
    precargarSeries(series) {
        if (!series || series.length === 0) return;

        this.limpiarCampos();

        series.forEach(serie => {
            this.agregarCampo();
            
            // Llenar el último campo agregado
            const campos = document.querySelectorAll('[data-serie-numero]');
            const ultimoCampo = campos[campos.length - 1];
            
            if (ultimoCampo) {
                ultimoCampo.value = serie.numero_serie;
                
                const campoEstado = ultimoCampo.parentElement.querySelector('[data-serie-estado]');
                if (campoEstado) {
                    campoEstado.value = serie.estado;
                }
            }
        });
    }
};

// Exponer globalmente para acceso desde HTML (onclick, etc.)
window.seriesManager = seriesManager;

// Exponer también la función de validación
window.validarSeries = () => seriesManager.validarNoDuplicados();