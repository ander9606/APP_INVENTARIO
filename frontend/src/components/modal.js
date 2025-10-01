/**
 * Abre un modal con contenido HTML personalizado
 * @param {string} contenidoHTML - HTML a mostrar en el modal
 */
export function abrirModal(contenidoHTML) {
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    
    // Inyectar contenido
    content.innerHTML = contenidoHTML;
    
    // Mostrar modal
    overlay.classList.remove('hidden');
    
    // Bloquear scroll del body
    document.body.style.overflow = 'hidden';
}

/**
 * Cierra el modal actualmente abierto
 */
export function cerrarModal() {
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.add('hidden');
    
    // Restaurar scroll del body
    document.body.style.overflow = 'auto';
}

/**
 * Configurar eventos del modal (se ejecuta una sola vez)
 */
function configurarEventos() {
    const overlay = document.getElementById('modal-overlay');
    
    // Cerrar al hacer clic fuera del contenido
    overlay.addEventListener('click', (e) => {
        if (e.target.id === 'modal-overlay') {
            cerrarModal();
        }
    });
    
    // Cerrar con tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            cerrarModal();
        }
    });
}

// Ejecutar configuración cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', configurarEventos);
} else {
    configurarEventos();
}