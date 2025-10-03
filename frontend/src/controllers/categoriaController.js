import { categoriaService } from '../services/categoriaService.js';
import { abrirModal, cerrarModal } from '../components/Modal.js';
import { mostrarToast } from '../components/Toast.js';
import { confirmar } from '../utils/helpers.js';

/**
 * Controlador que maneja la lógica de negocio de las categorías
 * Conecta la UI (vistas/componentes) con el servicio de API
 */
export const categoriaController = {
    
    /**
     * Abre un modal para crear una nueva categoría PADRE
     * (categoría de nivel superior sin padre)
     */
    async crear() {
        // Construir el HTML del formulario
        const formularioHTML = `
            <div class="p-6">
                <h3 class="text-2xl font-bold mb-4 text-gray-800">Nueva Categoría</h3>
                
                <form id="form-categoria" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Nombre de la categoría *
                        </label>
                        <input 
                            type="text" 
                            id="nombre" 
                            required 
                            placeholder="Ej: Carpas, Tubos, Lonas..."
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                        >
                        <p class="mt-1 text-xs text-gray-500">
                            Este será el nombre de una categoría principal
                        </p>
                    </div>
                    
                    <div class="flex gap-3 justify-end pt-4 border-t">
                        <button 
                            type="button" 
                            onclick="window.cerrarModal()" 
                            class="px-5 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium">
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                            ✓ Crear Categoría
                        </button>
                    </div>
                </form>
            </div>
        `;

        // Abrir el modal con el formulario
        abrirModal(formularioHTML);

        // Configurar el evento submit del formulario
        const form = document.getElementById('form-categoria');
        form.onsubmit = async (e) => {
            e.preventDefault(); // Evitar recarga de página
            
            const nombre = document.getElementById('nombre').value.trim();
            
            // Validación extra en el frontend
            if (!nombre) {
                mostrarToast('El nombre es obligatorio', 'error');
                return;
            }
            
            try {
                // Deshabilitar botón mientras se procesa
                const btnSubmit = form.querySelector('button[type="submit"]');
                btnSubmit.disabled = true;
                btnSubmit.textContent = 'Creando...';
                
                // Llamar al servicio para crear la categoría
                // Como no enviamos padre_id, será una categoría padre
                await categoriaService.crear({ nombre });
                
                // Cerrar modal
                cerrarModal();
                
                // Mostrar mensaje de éxito
                mostrarToast('Categoría creada exitosamente', 'success');
                
                // Recargar la vista de categorías para mostrar la nueva
                window.app.navegarA('categorias');
                
            } catch (error) {
                // Mostrar error al usuario
                mostrarToast(error.message, 'error');
                
                // Rehabilitar botón
                const btnSubmit = form.querySelector('button[type="submit"]');
                btnSubmit.disabled = false;
                btnSubmit.textContent = '✓ Crear Categoría';
            }
        };
    },

    /**
     * Abre un modal para crear una SUBCATEGORÍA
     * @param {number} padreId - ID de la categoría padre
     * @param {string} nombrePadre - Nombre de la categoría padre (para mostrar en UI)
     */
    async agregarSubcategoria(padreId, nombrePadre) {
        const formularioHTML = `
            <div class="p-6">
                <h3 class="text-2xl font-bold mb-2 text-gray-800">Nueva Subcategoría</h3>
                <p class="text-gray-600 mb-4">
                    Categoría padre: <strong class="text-blue-600">${nombrePadre}</strong>
                </p>
                
                <form id="form-subcategoria" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Nombre de la subcategoría *
                        </label>
                        <input 
                            type="text" 
                            id="nombre" 
                            required 
                            placeholder="Ej: Carpas grandes, Tubos 3m..."
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none"
                        >
                        <p class="mt-1 text-xs text-gray-500">
                            Esta subcategoría estará dentro de "${nombrePadre}"
                        </p>
                    </div>
                    
                    <div class="flex gap-3 justify-end pt-4 border-t">
                        <button 
                            type="button" 
                            onclick="window.cerrarModal()" 
                            class="px-5 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium">
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            class="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium">
                            ✓ Crear Subcategoría
                        </button>
                    </div>
                </form>
            </div>
        `;

        abrirModal(formularioHTML);

        // Configurar evento submit
        const form = document.getElementById('form-subcategoria');
        form.onsubmit = async (e) => {
            e.preventDefault();
            
            const nombre = document.getElementById('nombre').value.trim();
            
            if (!nombre) {
                mostrarToast('El nombre es obligatorio', 'error');
                return;
            }
            
            try {
                const btnSubmit = form.querySelector('button[type="submit"]');
                btnSubmit.disabled = true;
                btnSubmit.textContent = 'Creando...';
                
                // Aquí SÍ enviamos padre_id para crear la subcategoría
                await categoriaService.crear({ 
                    nombre, 
                    padre_id: padreId 
                });
                
                cerrarModal();
                mostrarToast('Subcategoría creada exitosamente', 'success');
                window.app.navegarA('categorias');
                
            } catch (error) {
                mostrarToast(error.message, 'error');
                
                const btnSubmit = form.querySelector('button[type="submit"]');
                btnSubmit.disabled = false;
                btnSubmit.textContent = '✓ Crear Subcategoría';
            }
        };
    },

    /**
     * Elimina una categoría (y todas sus subcategorías en cascada)
     * @param {number} id - ID de la categoría a eliminar
     * @param {string} nombre - Nombre de la categoría (para mostrar en confirmación)
     */
    async eliminar(id, nombre) {
        // Pedir confirmación al usuario
        const confirmado = confirmar(
            `¿Estás seguro de eliminar la categoría "${nombre}"?\n\n` +
            `⚠️ ADVERTENCIA: Esto también eliminará todas sus subcategorías.`
        );
        
        if (!confirmado) {
            return; // El usuario canceló
        }

        try {
            // Llamar al servicio para eliminar
            await categoriaService.eliminar(id);
            
            // Mostrar mensaje de éxito
            mostrarToast(`Categoría "${nombre}" eliminada correctamente`, 'success');
            
            // Recargar la vista de categorías
            window.app.navegarA('categorias');
            
        } catch (error) {
            // Si hay un error (ej: hay elementos usando esta categoría)
            mostrarToast(error.message, 'error');
        }
    }
};

// Exponer el controlador globalmente para que los botones onclick puedan accederlo
// Esto permite usar onclick="window.categoriaController.crear()" en el HTML
window.categoriaController = categoriaController;