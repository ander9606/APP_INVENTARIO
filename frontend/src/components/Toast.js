/**
 * Crea y muestra una notificación temporal tipo toast
 * @param {string} mensaje - Texto a mostrar
 * @param {string} tipo - Tipo: 'success', 'error', 'info', 'warning'
 * @param {number} duracion - Duración en milisegundos (default: 3000)
 */
export function mostrarToast(mensaje, tipo = 'success', duracion = 3000) {
    const container = document.getElementById('toast-container');
    
    // Crear elemento toast
    const toast = document.createElement('div');
    
    // Colores según tipo
    const colores = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500'
    };

    // Iconos según tipo
    const iconos = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠'
    };

    // Aplicar estilos y contenido
    toast.className = `${colores[tipo]} text-white px-6 py-3 rounded-lg shadow-lg fade-in flex items-center gap-2`;
    toast.innerHTML = `
        <span class="text-xl font-bold">${iconos[tipo]}</span>
        <span>${mensaje}</span>
    `;

    // Agregar al container
    container.appendChild(toast);

    // Auto-remover con animación
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        
        // Eliminar del DOM después de la animación
        setTimeout(() => toast.remove(), 300);
    }, duracion);
}

/**
 * Muestra un toast de éxito
 * @param {string} mensaje
 */
export function toastExito(mensaje) {
    mostrarToast(mensaje, 'success');
}

/**
 * Muestra un toast de error
 * @param {string} mensaje
 */
export function toastError(mensaje) {
    mostrarToast(mensaje, 'error');
}

/**
 * Muestra un toast de información
 * @param {string} mensaje
 */
export function toastInfo(mensaje) {
    mostrarToast(mensaje, 'info');
}

/**
 * Muestra un toast de advertencia
 * @param {string} mensaje
 */
export function toastAdvertencia(mensaje) {
    mostrarToast(mensaje, 'warning');
}