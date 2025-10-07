import { elementoService } from '../../services/elementoService.js';
import { serieService } from '../../services/serieService.js';
import { loteMovimientoService } from '../../services/loteMovimientoService.js';
import { abrirModal, cerrarModal } from '../../components/Modal.js';
import { mostrarToast } from '../../components/Toast.js';
import { confirmar } from '../../utils/helpers.js';
import { inventarioFormBuilder } from './inventarioFormBuilder.js';
import { inventarioValidator } from './inventarioValidator.js';
import { seriesManager } from '../../components/seriesManager.js';
import { loteMovimientoUI } from '../../components/loteMovimientoUI.js';

/**
 * Controlador principal del inventario
 * Orquesta las operaciones CRUD y movimientos de lotes
 * 
 * RESPONSABILIDADES:
 * - Coordinar formularios (FormBuilder)
 * - Validar datos (Validator)
 * - Gestionar series (SeriesManager)
 * - Gestionar movimientos de lotes (LoteMovimientoService + LoteMovimientoUI)
 * - Comunicarse con la API (Services)
 * - Mostrar mensajes al usuario (Toast/Modal)
 */
export const inventarioController = {
    
    // ============================================
    // OPERACIONES CRUD BÁSICAS
    // ============================================
    
    /**
     * Abre modal para crear un nuevo elemento
     */
    async crearElemento() {
        try {
            const formularioHTML = await inventarioFormBuilder.construirFormularioCreacion();
            abrirModal(formularioHTML);
            this.configurarFormularioCreacion();
        } catch (error) {
            mostrarToast('Error al cargar el formulario: ' + error.message, 'error');
        }
    },

    /**
     * Configura los eventos del formulario de creación
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
                return;
            }

            // 4. Si requiere series, RECOPILAR y VALIDAR
            if (datosNormalizados.requiere_series) {
                datosNormalizados.series = seriesManager.recopilar(datosNormalizados.estado);
                
                if (!inventarioValidator.validarSeries(datosNormalizados.series, datosNormalizados.cantidad)) {
                    return;
                }
            }

            // 5. Deshabilitar botón
            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Creando...';

            // 6. ENVIAR datos al backend
            await elementoService.crear(datosNormalizados);

            // 7. ÉXITO
            cerrarModal();
            mostrarToast('Elemento creado exitosamente', 'success');
            window.app.navegarA('inventario');

        } catch (error) {
            mostrarToast(error.message, 'error');
            
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.textContent = '✓ Crear Elemento';
            }
        }
    },

    /**
     * Recopila todos los datos del formulario
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
            // Nuevos campos de estado
            current_status: document.getElementById('current_status')?.value || 'AVAILABLE',
            cleaning_status: document.getElementById('cleaning_status')?.value || 'CLEAN',
            material_id: null,
            unidad_id: null,
            series: []
        };
    },

    /**
     * Muestra el detalle completo de un elemento
     */
    async verDetalle(id) {
        try {
            const respuesta = await elementoService.obtenerPorId(id);
            const elemento = respuesta.data;

            let series = [];
            if (elemento.requiere_series) {
                const respuestaSeries = await serieService.obtenerPorElemento(id);
                series = respuestaSeries.data;
            }

            const detalleHTML = inventarioFormBuilder.construirVistaDetalle(elemento, series);
            abrirModal(detalleHTML);

        } catch (error) {
            mostrarToast('Error al cargar el detalle: ' + error.message, 'error');
        }
    },

    /**
     * Elimina un elemento del inventario
     */
    async eliminar(id) {
        const confirmado = confirmar(
            '¿Estás seguro de eliminar este elemento del inventario?\n\n' +
            '⚠️ Esta acción no se puede deshacer.'
        );

        if (!confirmado) return;

        try {
            await elementoService.eliminar(id);
            mostrarToast('Elemento eliminado correctamente', 'success');
            window.app.navegarA('inventario');
        } catch (error) {
            mostrarToast('Error al eliminar: ' + error.message, 'error');
        }
    },

    // ============================================
    // OPERACIONES DE MOVIMIENTOS DE LOTES
    // ============================================

    /**
     * Abre modal para cambiar el estado de un lote
     * @param {object} lote - Datos del lote
     */
    async cambiarEstadoLote(lote) {
        try {
            const formularioHTML = loteMovimientoUI.construirFormularioCambioEstado(lote);
            abrirModal(formularioHTML);

            // Configurar evento submit
            const form = document.getElementById('form-cambio-estado');
            form.onsubmit = async (e) => {
                e.preventDefault();
                await this.procesarCambioEstado(lote.id);
            };

            // Mostrar/ocultar campo de costo según motivo
            document.getElementById('motivo').addEventListener('change', (e) => {
                const campoCosto = document.getElementById('campo-costo');
                if (e.target.value === 'REPAIR_COMPLETED' || e.target.value === 'DAMAGED_IN_USE') {
                    campoCosto.classList.remove('hidden');
                } else {
                    campoCosto.classList.add('hidden');
                }
            });

        } catch (error) {
            mostrarToast('Error al cargar formulario: ' + error.message, 'error');
        }
    },

    /**
     * Procesa el cambio de estado de un lote
     */
    async procesarCambioEstado(loteId) {
        const form = document.getElementById('form-cambio-estado');
        const btnSubmit = form.querySelector('button[type="submit"]');

        try {
            // Recopilar datos
            const datos = {
                lote_id: loteId,
                cantidad: parseInt(document.getElementById('cantidad').value, 10),
                current_status_destino: document.getElementById('current_status_destino').value,
                cleaning_status_destino: document.getElementById('cleaning_status_destino').value,
                motivo: document.getElementById('motivo').value,
                descripcion: document.getElementById('descripcion').value || null,
                costo_reparacion: document.getElementById('costo_reparacion')?.value || null
            };

            // Validar cantidad
            if (datos.cantidad <= 0) {
                mostrarToast('La cantidad debe ser mayor a 0', 'error');
                return;
            }

            // Deshabilitar botón
            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Procesando...';

            // Enviar al backend
            await loteMovimientoService.cambiarEstadoLote(datos);

            // Éxito
            cerrarModal();
            mostrarToast('Estado actualizado correctamente', 'success');
            window.app.navegarA('inventario');

        } catch (error) {
            mostrarToast(error.message, 'error');
            
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.textContent = '✓ Confirmar Movimiento';
            }
        }
    },

    /**
     * Procesar devolución de alquiler
     * @param {object} lote - Datos del lote alquilado
     */
    async procesarDevolucion(lote) {
        try {
            const formularioHTML = loteMovimientoUI.construirFormularioDevolucion(lote);
            abrirModal(formularioHTML);

            const form = document.getElementById('form-devolucion');
            form.onsubmit = async (e) => {
                e.preventDefault();
                await this.ejecutarDevolucion(lote.id);
            };

        } catch (error) {
            mostrarToast('Error al cargar formulario: ' + error.message, 'error');
        }
    },

    /**
     * Ejecuta el proceso de devolución
     */
    async ejecutarDevolucion(loteAlquiladoId) {
        const form = document.getElementById('form-devolucion');
        const btnSubmit = form.querySelector('button[type="submit"]');

        try {
            const datos = {
                lote_alquilado_id: loteAlquiladoId,
                cantidad: parseInt(document.getElementById('cantidad_devuelta').value, 10),
                cleaning_status_devolucion: document.querySelector('input[name="cleaning_status_devolucion"]:checked').value,
                notas: document.getElementById('notas_devolucion').value || null,
                rental_id: null, // TODO: Implementar gestión de alquileres
                costo_reparacion: document.getElementById('costo_reparacion')?.value || null
            };

            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Procesando...';

            await loteMovimientoService.procesarDevolucion(datos);

            cerrarModal();
            mostrarToast('Devolución procesada correctamente', 'success');
            window.app.navegarA('inventario');

        } catch (error) {
            mostrarToast(error.message, 'error');
            
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.textContent = '✓ Procesar Devolución';
            }
        }
    },

    /**
     * Completar proceso de limpieza
     * @param {object} lote - Datos del lote en limpieza
     */
    async completarLimpieza(lote) {
        try {
            const formularioHTML = loteMovimientoUI.construirFormularioCompletarLimpieza(lote);
            abrirModal(formularioHTML);

            const form = document.getElementById('form-completar-limpieza');
            form.onsubmit = async (e) => {
                e.preventDefault();
                await this.ejecutarCompletarLimpieza(lote.id);
            };

        } catch (error) {
            mostrarToast('Error al cargar formulario: ' + error.message, 'error');
        }
    },

    /**
     * Ejecuta el proceso de completar limpieza
     */
    async ejecutarCompletarLimpieza(loteLimpiezaId) {
        const form = document.getElementById('form-completar-limpieza');
        const btnSubmit = form.querySelector('button[type="submit"]');

        try {
            const datos = {
                lote_limpieza_id: loteLimpiezaId,
                cantidad: parseInt(document.getElementById('cantidad_limpiada').value, 10),
                notas: document.getElementById('notas_limpieza').value || null
            };

            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Procesando...';

            await loteMovimientoService.completarLimpieza(datos);

            cerrarModal();
            mostrarToast('Limpieza completada - Elementos ahora disponibles', 'success');
            window.app.navegarA('inventario');

        } catch (error) {
            mostrarToast(error.message, 'error');
            
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.textContent = '✓ Marcar como Limpio';
            }
        }
    },

    /**
     * Ver historial de movimientos de un elemento
     * @param {number} elementoId - ID del elemento base
     */
    async verHistorialMovimientos(elementoId) {
        try {
            // Obtener elemento
            const respuestaElemento = await elementoService.obtenerPorId(elementoId);
            const elemento = respuestaElemento.data;

            // Obtener historial
            const respuestaHistorial = await loteMovimientoService.obtenerHistorial(elementoId);
            const historial = respuestaHistorial.data;

            // Mostrar en modal
            const historialHTML = loteMovimientoUI.construirVistaHistorial(elemento, historial);
            abrirModal(historialHTML);

        } catch (error) {
            mostrarToast('Error al cargar historial: ' + error.message, 'error');
        }
    },

    /**
     * ACCIONES RÁPIDAS
     */

    /**
     * Marcar elementos como dañados
     */
    async marcarComoDanado(lote, cantidad = null) {
        const cantidadDanada = cantidad || prompt(
            `¿Cuántas unidades fueron dañadas? (Disponible: ${lote.cantidad})`
        );

        if (!cantidadDanada || isNaN(cantidadDanada) || cantidadDanada <= 0) {
            return;
        }

        const descripcion = prompt('Describe el daño:');

        try {
            await loteMovimientoService.marcarComoDanado({
                lote_id: lote.id,
                cantidad: parseInt(cantidadDanada, 10),
                descripcion: descripcion || 'Dañado en uso'
            });

            mostrarToast('Elementos marcados como dañados', 'success');
            window.app.navegarA('inventario');

        } catch (error) {
            mostrarToast(error.message, 'error');
        }
    },

    /**
     * Marcar elementos como perdidos
     */
    async marcarComoPerdido(lote, cantidad = null) {
        const cantidadPerdida = cantidad || prompt(
            `¿Cuántas unidades se perdieron? (Disponible: ${lote.cantidad})`
        );

        if (!cantidadPerdida || isNaN(cantidadPerdida) || cantidadPerdida <= 0) {
            return;
        }

        const descripcion = prompt('Describe cómo se perdieron:');

        const confirmado = confirmar(
            `¿Confirmas que se perdieron ${cantidadPerdida} unidades?\n\n` +
            'Estas unidades se retirarán del inventario.'
        );

        if (!confirmado) return;

        try {
            await loteMovimientoService.marcarComoPerdido({
                lote_id: lote.id,
                cantidad: parseInt(cantidadPerdida, 10),
                descripcion: descripcion || 'Elemento perdido'
            });

            mostrarToast('Elementos marcados como perdidos', 'success');
            window.app.navegarA('inventario');

        } catch (error) {
            mostrarToast(error.message, 'error');
        }
    }
};

// Exponer globalmente
window.inventarioController = inventarioController;