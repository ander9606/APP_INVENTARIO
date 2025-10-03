import { elementoService } from '../../services/elementoService.js';
import { serieService } from '../../services/serieService.js';
import { abrirModal, cerrarModal } from '../../components/Modal.js';
import { mostrarToast } from '../../components/Toast.js';
import { confirmar } from '../../utils/helpers.js';
import { inventarioFormBuilder } from './inventarioFormBuilder.js';
import { inventarioValidator } from './inventarioValidator.js';
import { seriesManager } from '../../components/seriesManager.js';

/**
 * Controlador principal del inventario
 * Orquesta las operaciones CRUD y coordina los módulos especializados
 * 
 * RESPONSABILIDADES:
 * - Coordinar formularios (FormBuilder)
 * - Validar datos (Validator)
 * - Gestionar series (SeriesManager)
 * - Comunicarse con la API (Services)
 * - Mostrar mensajes al usuario (Toast/Modal)
 */
export const inventarioController = {
    
    /**
     * Abre modal para crear un nuevo elemento
     * Coordina: FormBuilder + SeriesManager + Validator + Service
     */
    async crearElemento() {
        try {
            // 1. Construir el formulario HTML
            const formularioHTML = await inventarioFormBuilder.construirFormularioCreacion();
            
            // 2. Mostrar el modal
            abrirModal(formularioHTML);
            
            // 3. Configurar el evento submit
            this.configurarFormularioCreacion();
            
        } catch (error) {
            mostrarToast('Error al cargar el formulario: ' + error.message, 'error');
        }
    },

    /**
     * Configura los eventos del formulario de creación
     * Separa la configuración de eventos de la construcción del formulario
     */
    configurarFormularioCreacion() {
        const form = document.getElementById('form-elemento');
        
        if (!form) {
            console.error('Formulario no encontrado');
            return;
        }

        form.onsubmit = async (e) => {
            e.preventDefault();
            await this.procesarCreacionElemento();
        };
    },

    /**
     * Procesa la creación del elemento
     * Orquesta: Recopilación + Validación + Envío
     */
    async procesarCreacionElemento() {
        const form = document.getElementById('form-elemento');
        const btnSubmit = form.querySelector('button[type="submit"]');

        try {
            // 1. RECOPILAR datos del formulario
            const datos = this.recopilarDatosFormulario();

            // 2. NORMALIZAR datos
            const datosNormalizados = inventarioValidator.normalizarDatos(datos);

            // 3. VALIDAR datos básicos
            if (!inventarioValidator.validarDatosBasicos(datosNormalizados)) {
                return; // Los errores ya se muestran en el validator
            }

            // 4. Si requiere series, RECOPILAR y VALIDAR
            if (datosNormalizados.requiere_series) {
                datosNormalizados.series = seriesManager.recopilar(datosNormalizados.estado);
                
                if (!inventarioValidator.validarSeries(datosNormalizados.series, datosNormalizados.cantidad)) {
                    return;
                }
            }

            // 5. Deshabilitar botón para evitar doble submit
            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Creando...';

            // 6. ENVIAR datos al backend
            await elementoService.crear(datosNormalizados);

            // 7. ÉXITO: Cerrar modal y mostrar mensaje
            cerrarModal();
            mostrarToast('Elemento creado exitosamente', 'success');
            
            // 8. Recargar la vista de inventario
            window.app.navegarA('inventario');

        } catch (error) {
            // MANEJO DE ERRORES
            mostrarToast(error.message, 'error');
            
            // Rehabilitar botón
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.textContent = '✓ Crear Elemento';
            }
        }
    },

    /**
     * Recopila todos los datos del formulario
     * @returns {object} Objeto con los datos del formulario
     */
    recopilarDatosFormulario() {
        return {
            nombre: document.getElementById('nombre')?.value || '',
            descripcion: document.getElementById('descripcion')?.value || '',
            categoria_id: document.getElementById('categoria_id')?.value || null,
            cantidad: parseInt(document.getElementById('cantidad')?.value || 0, 10),
            estado: document.getElementById('estado')?.value || 'bueno',
            requiere_series: document.getElementById('requiere_series')?.checked || false,
            ubicacion: document.getElementById('ubicacion')?.value || null,
            material_id: null, // Para futuras implementaciones
            unidad_id: null,   // Para futuras implementaciones
            series: []
        };
    },

    /**
     * Muestra el detalle completo de un elemento en un modal
     * @param {number} id - ID del elemento a mostrar
     */
    async verDetalle(id) {
        try {
            // 1. Obtener datos del elemento
            const respuesta = await elementoService.obtenerPorId(id);
            const elemento = respuesta.data;

            // 2. Si requiere series, obtenerlas también
            let series = [];
            if (elemento.requiere_series) {
                const respuestaSeries = await serieService.obtenerPorElemento(id);
                series = respuestaSeries.data;
            }

            // 3. Construir HTML de la vista de detalle
            const detalleHTML = inventarioFormBuilder.construirVistaDetalle(elemento, series);

            // 4. Mostrar en modal
            abrirModal(detalleHTML);

        } catch (error) {
            mostrarToast('Error al cargar el detalle: ' + error.message, 'error');
        }
    },

    /**
     * Elimina un elemento del inventario
     * @param {number} id - ID del elemento a eliminar
     */
    async eliminar(id) {
        // 1. Pedir confirmación
        const confirmado = confirmar(
            '¿Estás seguro de eliminar este elemento del inventario?\n\n' +
            '⚠️ Esta acción no se puede deshacer.\n' +
            (await this.tieneSeriesAsociadas(id) 
                ? '⚠️ Este elemento tiene series asociadas que también se eliminarán.'
                : ''
            )
        );

        if (!confirmado) return;

        try {
            // 2. Eliminar elemento
            await elementoService.eliminar(id);
            
            // 3. Mostrar mensaje de éxito
            mostrarToast('Elemento eliminado correctamente', 'success');
            
            // 4. Recargar vista
            window.app.navegarA('inventario');
            
        } catch (error) {
            mostrarToast('Error al eliminar: ' + error.message, 'error');
        }
    },

    /**
     * Verifica si un elemento tiene series asociadas
     * @param {number} id - ID del elemento
     * @returns {Promise<boolean>}
     */
    async tieneSeriesAsociadas(id) {
        try {
            const respuesta = await elementoService.obtenerPorId(id);
            return respuesta.data.requiere_series || false;
        } catch (error) {
            return false;
        }
    },

    /**
     * Abre modal para editar un elemento existente
     * @param {number} id - ID del elemento a editar
     */
    async editarElemento(id) {
        try {
            // 1. Obtener datos del elemento
            const respuesta = await elementoService.obtenerPorId(id);
            const elemento = respuesta.data;

            // 2. Si tiene series, obtenerlas también
            let series = [];
            if (elemento.requiere_series) {
                const respuestaSeries = await serieService.obtenerPorElemento(id);
                series = respuestaSeries.data;
            }

            // 3. Construir formulario de edición
            const formularioHTML = await inventarioFormBuilder.construirFormularioEdicion(elemento, series);

            // 4. Abrir modal
            abrirModal(formularioHTML);

            // 5. Configurar evento submit
            this.configurarFormularioEdicion(id, elemento);

        } catch (error) {
            mostrarToast('Error al cargar datos para edición: ' + error.message, 'error');
        }
    },

    /**
     * Configura el formulario de edición
     * @param {number} id - ID del elemento
     * @param {object} elementoOriginal - Datos originales del elemento
     */
    configurarFormularioEdicion(id, elementoOriginal) {
        const form = document.getElementById('form-elemento-editar');
        
        if (!form) {
            console.error('Formulario de edición no encontrado');
            return;
        }

        form.onsubmit = async (e) => {
            e.preventDefault();
            await this.procesarEdicionElemento(id, elementoOriginal);
        };
    },

    /**
     * Procesa la edición del elemento
     * @param {number} id - ID del elemento
     * @param {object} elementoOriginal - Datos originales
     */
    async procesarEdicionElemento(id, elementoOriginal) {
        const form = document.getElementById('form-elemento-editar');
        const btnSubmit = form.querySelector('button[type="submit"]');

        try {
            // 1. Recopilar datos modificados
            const datosNuevos = {
                nombre: document.getElementById('nombre')?.value || '',
                descripcion: document.getElementById('descripcion')?.value || '',
                categoria_id: document.getElementById('categoria_id')?.value || null,
                cantidad: parseInt(document.getElementById('cantidad')?.value || 0, 10),
                estado: document.getElementById('estado')?.value || 'bueno',
                ubicacion: document.getElementById('ubicacion')?.value || null
            };

            // 2. Normalizar datos
            const datosNormalizados = inventarioValidator.normalizarDatos(datosNuevos);

            // 3. Validar datos básicos
            if (!inventarioValidator.validarDatosBasicos(datosNormalizados)) {
                return;
            }

            // 4. Deshabilitar botón
            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Guardando...';

            // 5. Enviar actualización al backend
            await elementoService.actualizar(id, datosNormalizados);

            // 6. ÉXITO: Cerrar modal y mostrar mensaje
            cerrarModal();
            mostrarToast('Elemento actualizado exitosamente', 'success');
            
            // 7. Recargar la vista de inventario
            window.app.navegarA('inventario');

        } catch (error) {
            mostrarToast(error.message, 'error');
            
            // Rehabilitar botón
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.textContent = '✓ Guardar Cambios';
            }
        }
    },

    /**
     * Actualiza un elemento existente (para futuras implementaciones)
     * @param {number} id - ID del elemento
     * @param {object} datos - Datos a actualizar
     */
    async actualizar(id, datos) {
        try {
            // Validar datos
            if (!inventarioValidator.validarDatosBasicos(datos)) {
                return;
            }

            // Si requiere series, validarlas
            if (datos.requiere_series && datos.series) {
                if (!inventarioValidator.validarSeries(datos.series, datos.cantidad)) {
                    return;
                }
            }

            // Actualizar en el backend
            await elementoService.actualizar(id, datos);
            
            mostrarToast('Elemento actualizado exitosamente', 'success');
            window.app.navegarA('inventario');
            
        } catch (error) {
            mostrarToast('Error al actualizar: ' + error.message, 'error');
        }
    }
};

// Exponer globalmente para los onclick en HTML
window.inventarioController = inventarioController;