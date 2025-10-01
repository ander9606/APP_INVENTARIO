/**
 * Muestra una notificación toast temporal
 * @param {string} mensaje - Texto a mostrar
 * @param {string} tipo - success, error, info, warning
 */
export function mostrarToast(mensaje, tipo = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    
    const colores = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500'
    };

    const iconos = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠'
    };

    toast.className = `${colores[tipo]} text-white px-6 py-3 rounded-lg shadow-lg fade-in flex items-center gap-2`;
    toast.innerHTML = `<span class="text-xl">${iconos[tipo]}</span><span>${mensaje}</span>`;

    container.appendChild(toast);

    // Auto-remover después de 3 segundos
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Muestra un diálogo de confirmación nativo
 * @param {string} mensaje - Pregunta a mostrar
 * @returns {boolean} - true si el usuario confirma
 */
export function confirmar(mensaje) {
    return confirm(mensaje);
}

/**
 * Formatea una fecha a formato legible en español
 * @param {string|Date} fecha - Fecha a formatear
 * @returns {string} - Fecha formateada
 */
export function formatearFecha(fecha) {
    return new Date(fecha).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Sanitiza texto para prevenir XSS
 * @param {string} str - Texto a sanitizar
 * @returns {string} - Texto seguro
 */
export function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

/**
 * Debounce para búsquedas (evita llamadas excesivas)
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Milisegundos de espera
 * @returns {Function}
 */
export function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}