/**
 * Sistema de Modales - Componente centralizado
 * Gestiona la apertura, cierre y comportamiento de modales
 */

/**
 * Abre un modal con contenido HTML personalizado
 * @param {string} contenidoHTML - HTML a mostrar en el modal
 * @param {object} opciones - Opciones de configuración
 * @param {boolean} opciones.cerrarAlClickFuera - Permitir cerrar al hacer clic fuera (default: true)
 * @param {boolean} opciones.cerrarConESC - Permitir cerrar con tecla ESC (default: true)
 * @param {string} opciones.tamano - Tamaño del modal: 'sm', 'md', 'lg', 'xl' (default: 'md')
 */
export function abrirModal(contenidoHTML, opciones = {}) {
    const {
        cerrarAlClickFuera = true,
        cerrarConESC = true,
        tamano = 'md'
    } = opciones;

    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    
    if (!overlay || !content) {
        console.error('Elementos del modal no encontrados en el DOM');
        return;
    }

    // Aplicar tamaño del modal
    aplicarTamanoModal(content, tamano);
    
    // Inyectar contenido
    content.innerHTML = contenidoHTML;
    
    // Mostrar modal con animación
    overlay.classList.remove('hidden');
    setTimeout(() => {
        overlay.style.opacity = '1';
        content.style.transform = 'scale(1)';
    }, 10);
    
    // Bloquear scroll del body
    document.body.style.overflow = 'hidden';

    // Guardar opciones en el overlay para uso posterior
    overlay.dataset.cerrarAlClickFuera = cerrarAlClickFuera;
    overlay.dataset.cerrarConESC = cerrarConESC;

    // Agregar event listeners si aún no existen
    configurarEventListeners();
}

/**
 * Cierra el modal actualmente abierto
 * @param {boolean} forzar - Forzar cierre ignorando validaciones
 */
export function cerrarModal(forzar = false) {
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    
    if (!overlay) return;

    // Si hay un formulario con cambios sin guardar, preguntar
    if (!forzar && hayFormularioConCambios()) {
        const confirmar = confirm(
            '¿Estás seguro de cerrar? Los cambios no guardados se perderán.'
        );
        if (!confirmar) return;
    }

    // Animación de salida
    overlay.style.opacity = '0';
    content.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
        overlay.classList.add('hidden');
        content.innerHTML = '';
        
        // Restaurar scroll del body
        document.body.style.overflow = 'auto';
    }, 200);
}

/**
 * Aplica el tamaño del modal según la opción
 * @param {HTMLElement} content - Elemento del contenido del modal
 * @param {string} tamano - Tamaño deseado
 */
function aplicarTamanoModal(content, tamano) {
    // Remover clases de tamaño anteriores
    content.classList.remove('max-w-sm', 'max-w-md', 'max-w-lg', 'max-w-xl', 'max-w-2xl', 'max-w-4xl');
    
    // Aplicar nuevo tamaño
    const tamanos = {
        'sm': 'max-w-sm',
        'md': 'max-w-md',
        'lg': 'max-w-lg',
        'xl': 'max-w-xl',
        '2xl': 'max-w-2xl',
        '4xl': 'max-w-4xl'
    };
    
    content.classList.add(tamanos[tamano] || 'max-w-2xl');
}

/**
 * Verifica si hay un formulario con cambios sin guardar
 * @returns {boolean}
 */
function hayFormularioConCambios() {
    const formulario = document.querySelector('#modal-content form');
    if (!formulario) return false;

    // Verificar si hay inputs con valores
    const inputs = formulario.querySelectorAll('input, textarea, select');
    for (const input of inputs) {
        if (input.value && input.value !== input.defaultValue) {
            return true;
        }
    }
    
    return false;
}

/**
 * Configura los event listeners del modal (se ejecuta una sola vez)
 */
let eventListenersConfigurados = false;

function configurarEventListeners() {
    if (eventListenersConfigurados) return;

    const overlay = document.getElementById('modal-overlay');
    
    if (!overlay) return;

    // Cerrar al hacer clic fuera del contenido
    overlay.addEventListener('click', (e) => {
        if (e.target.id === 'modal-overlay') {
            const permitirCerrar = overlay.dataset.cerrarAlClickFuera !== 'false';
            if (permitirCerrar) {
                cerrarModal();
            }
        }
    });
    
    // Cerrar con tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const overlay = document.getElementById('modal-overlay');
            if (overlay && !overlay.classList.contains('hidden')) {
                const permitirCerrar = overlay.dataset.cerrarConESC !== 'false';
                if (permitirCerrar) {
                    cerrarModal();
                }
            }
        }
    });

    eventListenersConfigurados = true;
}

/**
 * Modal de confirmación personalizado
 * @param {object} config - Configuración del modal
 * @param {string} config.titulo - Título del modal
 * @param {string} config.mensaje - Mensaje a mostrar
 * @param {string} config.textoConfirmar - Texto del botón confirmar (default: "Confirmar")
 * @param {string} config.textoCancelar - Texto del botón cancelar (default: "Cancelar")
 * @param {string} config.tipo - Tipo: 'warning', 'danger', 'info', 'success' (default: 'info')
 * @returns {Promise<boolean>} - true si confirma, false si cancela
 */
export function modalConfirmacion(config) {
    const {
        titulo = '¿Confirmar acción?',
        mensaje,
        textoConfirmar = 'Confirmar',
        textoCancelar = 'Cancelar',
        tipo = 'info'
    } = config;

    return new Promise((resolve) => {
        // Colores según tipo
        const colores = {
            warning: { bg: 'bg-yellow-100', text: 'text-yellow-800', btn: 'bg-yellow-600 hover:bg-yellow-700' },
            danger: { bg: 'bg-red-100', text: 'text-red-800', btn: 'bg-red-600 hover:bg-red-700' },
            info: { bg: 'bg-blue-100', text: 'text-blue-800', btn: 'bg-blue-600 hover:bg-blue-700' },
            success: { bg: 'bg-green-100', text: 'text-green-800', btn: 'bg-green-600 hover:bg-green-700' }
        };

        const color = colores[tipo] || colores.info;

        // Iconos según tipo
        const iconos = {
            warning: '⚠️',
            danger: '🚨',
            info: 'ℹ️',
            success: '✅'
        };

        const icono = iconos[tipo] || iconos.info;

        const html = `
            <div class="p-6">
                <div class="${color.bg} p-4 rounded-lg mb-4 flex items-start gap-3">
                    <span class="text-3xl">${icono}</span>
                    <div>
                        <h3 class="text-xl font-bold ${color.text} mb-2">${titulo}</h3>
                        <p class="text-gray-700">${mensaje}</p>
                    </div>
                </div>
                
                <div class="flex gap-3 justify-end">
                    <button 
                        id="btn-cancelar-modal"
                        class="px-5 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium">
                        ${textoCancelar}
                    </button>
                    <button 
                        id="btn-confirmar-modal"
                        class="px-5 py-2 ${color.btn} text-white rounded-lg transition font-medium">
                        ${textoConfirmar}
                    </button>
                </div>
            </div>
        `;

        abrirModal(html, { tamano: 'sm' });

        // Event listeners para los botones
        setTimeout(() => {
            document.getElementById('btn-confirmar-modal').onclick = () => {
                cerrarModal(true);
                resolve(true);
            };

            document.getElementById('btn-cancelar-modal').onclick = () => {
                cerrarModal(true);
                resolve(false);
            };
        }, 100);
    });
}

/**
 * Modal de loading/procesando
 * @param {string} mensaje - Mensaje a mostrar (default: "Procesando...")
 */
export function modalCargando(mensaje = 'Procesando...') {
    const html = `
        <div class="p-8 text-center">
            <div class="animate-spin h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p class="text-lg font-medium text-gray-700">${mensaje}</p>
            <p class="text-sm text-gray-500 mt-2">Por favor espera...</p>
        </div>
    `;

    abrirModal(html, { 
        cerrarAlClickFuera: false, 
        cerrarConESC: false,
        tamano: 'sm'
    });
}

/**
 * Modal de alerta
 * @param {string} mensaje - Mensaje a mostrar
 * @param {string} tipo - 'success', 'error', 'warning', 'info'
 */
export function modalAlerta(mensaje, tipo = 'info') {
    const iconos = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    const colores = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };

    const html = `
        <div class="p-6 text-center">
            <div class="text-6xl mb-4">${iconos[tipo]}</div>
            <p class="text-lg font-medium text-gray-800 mb-4">${mensaje}</p>
            <button 
                onclick="window.cerrarModal()"
                class="px-6 py-2 ${colores[tipo]} text-white rounded-lg hover:opacity-90 transition font-medium">
                Entendido
            </button>
        </div>
    `;

    abrirModal(html, { tamano: 'sm' });
}

// Exponer funciones globalmente
window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;
window.modalConfirmacion = modalConfirmacion;
window.modalCargando = modalCargando;
window.modalAlerta = modalAlerta;

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', configurarEventListeners);
} else {
    configurarEventListeners();
}