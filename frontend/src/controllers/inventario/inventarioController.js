// frontend/src/controllers/inventario/inventarioController.js

import { elementoService } from '../../services/elementoService.js';
import { serieService } from '../../services/serieService.js';
import { loteMovimientoService } from '../../services/loteMovimientoService.js';
import { abrirModal, cerrarModal } from '../../components/Modal.js';
import { mostrarToast } from '../../components/Toast.js';
import { confirmar } from '../../utils/helpers.js';
import { inventarioFormBuilder } from './inventarioFormBuilder.js';
import { inventarioValidator } from './inventarioValidator.js';
import { seriesManager } from '../../components/seriesManager.js';
import { GestionEstadosModal } from '../../components/inventario/GestionEstadosModal.js';

/**
 * Controlador principal del inventario
 * Maneja todas las operaciones CRUD y gestión de estados
 * 
 * RESPONSABILIDADES:
 * - Crear, editar, eliminar elementos
 * - Gestionar cambios de estado en lotes
 * - Coordinar formularios y validaciones
 * - Mostrar detalles y modales
 */
export const inventarioController = {
    
    // Estado del controlador
    vistaActual: 'grid', // 'grid' | 'lista' | 'compacta'
    
    /**
     * Abre modal para crear un nuevo elemento
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
            mostrarToast(error.message || 'Error al crear elemento', 'error');
            
            // Rehabilitar botón
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
            material_id: null,
            unidad_id: null,
            series: []
        };
    },

    /**
     * Muestra el detalle completo de un elemento en un modal
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
     * Abre modal para editar un elemento existente
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
            mostrarToast(error.message || 'Error al actualizar elemento', 'error');
            
            // Rehabilitar botón
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.textContent = '✓ Guardar Cambios';
            }
        }
    },

    /**
     * Elimina un elemento del inventario
     */
    async eliminar(id) {
        // 1. Pedir confirmación
        const confirmado = confirmar(
            '¿Estás seguro de eliminar este elemento del inventario?\n\n' +
            '⚠️ Esta acción no se puede deshacer.'
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
     * Abre modal para gestionar estados de un elemento con lotes
     * NUEVO MÉTODO PARA SISTEMA DE LOTES
     */
    
async gestionarEstados(id) {
    try {
        // 1. Obtener datos del elemento
        const respuesta = await elementoService.obtenerPorId(id);
        const elemento = respuesta.data;

        // 2. Verificar que NO sea un elemento con series
        if (elemento.requiere_series) {
            mostrarToast('Este elemento usa series individuales, no estados por cantidad', 'info');
            return;
        }

        // 3. Construir modal
        const modalHTML = GestionEstadosModal.render(elemento);

        // 4. Abrir modal
        abrirModal(modalHTML);

        // 5. Configurar evento submit
        this.configurarFormularioEstados(elemento);

    } catch (error) {
        mostrarToast('Error al abrir gestión de estados: ' + error.message, 'error');
    }
},

/**
 * Configura el formulario de gestión de estados
 */
configurarFormularioEstados(elemento) {
    const form = document.getElementById('form-actualizar-estados');
    
    if (!form) {
        console.error('Formulario no encontrado');
        return;
    }

    form.onsubmit = async (e) => {
        e.preventDefault();
        await this.procesarActualizacionEstados(elemento);
    };
},

/**
 * Procesa la actualización de estados
 */
async procesarActualizacionEstados(elemento) {
    const form = document.getElementById('form-actualizar-estados');
    const btnSubmit = form.querySelector('button[type="submit"]');

    try {
        // 1. Recopilar nuevas cantidades
        const nuevasCantidades = {
            cantidad_disponible: parseInt(document.getElementById('cantidad_AVAILABLE')?.value || 0, 10),
            cantidad_alquilada: parseInt(document.getElementById('cantidad_RENTED')?.value || 0, 10),
            cantidad_en_limpieza: parseInt(document.getElementById('cantidad_CLEANING')?.value || 0, 10),
            cantidad_en_mantenimiento: parseInt(document.getElementById('cantidad_MAINTENANCE')?.value || 0, 10),
            cantidad_danada: parseInt(document.getElementById('cantidad_DAMAGED')?.value || 0, 10)
        };

        // 2. Validar que la suma coincida
        const suma = Object.values(nuevasCantidades).reduce((a, b) => a + b, 0);
        
        if (suma !== elemento.cantidad) {
            mostrarToast(
                `Error: La suma (${suma}) no coincide con la cantidad total (${elemento.cantidad})`,
                'error'
            );
            return;
        }

        // 3. Deshabilitar botón
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Guardando...';

        // 4. Actualizar en backend
        await elementoService.actualizar(elemento.id, nuevasCantidades);

        // 5. ÉXITO
        cerrarModal();
        mostrarToast('Estados actualizados correctamente', 'success');
        
        // 6. Recargar vista
        window.app.navegarA('inventario');

    } catch (error) {
        mostrarToast('Error al actualizar estados: ' + error.message, 'error');
        
        // Rehabilitar botón
        if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.textContent = '✓ Guardar Cambios';
        }
    }
},
    /**
     * Configura el formulario de gestión de estados
     */
    configurarFormularioEstados(elemento) {
        const form = document.getElementById('form-mover-estado');
        
        if (!form) {
            console.error('Formulario de estados no encontrado');
            return;
        }

        form.onsubmit = async (e) => {
            e.preventDefault();
            await this.procesarCambioEstado(elemento);
        };
    },

    /**
     * Procesa el cambio de estado de un lote
     */
    async procesarCambioEstado(elemento) {
        const form = document.getElementById('form-mover-estado');
        const btnSubmit = form.querySelector('button[type="submit"]');

        try {
            // 1. Recopilar datos del formulario
            const datos = {
                lote_id: parseInt(document.getElementById('lote_origen')?.value, 10),
                cantidad: parseInt(document.getElementById('cantidad')?.value, 10),
                current_status_destino: document.getElementById('estado_destino')?.value,
                cleaning_status_destino: document.getElementById('estado_limpieza')?.value,
                motivo: document.getElementById('motivo')?.value,
                descripcion: document.getElementById('descripcion')?.value || null,
                costo_reparacion: parseFloat(document.getElementById('costo_reparacion')?.value) || null
            };

            // 2. Validar campos requeridos
            if (!datos.lote_id || !datos.cantidad || !datos.current_status_destino || 
                !datos.cleaning_status_destino || !datos.motivo) {
                mostrarToast('Por favor completa todos los campos requeridos', 'error');
                return;
            }

            // 3. Deshabilitar botón
            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Procesando...';

            // 4. Enviar cambio de estado al backend
            await loteMovimientoService.cambiarEstado(datos);

            // 5. ÉXITO
            cerrarModal();
            mostrarToast('Estado actualizado correctamente', 'success');
            
            // 6. Recargar vista
            window.app.navegarA('inventario');

        } catch (error) {
            mostrarToast('Error al cambiar estado: ' + error.message, 'error');
            
            // Rehabilitar botón
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.textContent = '✓ Mover Unidades';
            }
        }
    },

    /**
     * Cambia la vista del inventario (grid, lista, compacta)
     * NUEVO MÉTODO
     */
    cambiarVista() {
        // Ciclar entre vistas
        const vistas = ['grid', 'lista', 'compacta'];
        const indiceActual = vistas.indexOf(this.vistaActual);
        const siguienteIndice = (indiceActual + 1) % vistas.length;
        this.vistaActual = vistas[siguienteIndice];

        // Recargar inventario con la nueva vista
        window.app.navegarA('inventario');
        
        mostrarToast(`Vista cambiada: ${this.vistaActual}`, 'info');
    },

    /**
     * Filtra elementos (para futuras implementaciones)
     */
    filtrar() {
        // TODO: Implementar filtrado en tiempo real
        console.log('Filtrado en desarrollo...');
    },

    /**
     * Ver historial de movimientos de un elemento
     */
    async verHistorial(elementoBaseId) {
        try {
            const respuesta = await loteMovimientoService.obtenerHistorial(elementoBaseId);
            const historial = respuesta.data;

            // TODO: Construir vista de historial
            console.log('Historial:', historial);
            mostrarToast('Función en desarrollo', 'info');

        } catch (error) {
            mostrarToast('Error al obtener historial: ' + error.message, 'error');
        }
    }
};

// Exponer globalmente para los onclick en HTML
window.inventarioController = inventarioController;

export default inventarioController;