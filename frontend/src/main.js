// src/main.js

// Utilidades
import './utils/constants.js';
import './utils/helpers.js';

// Servicios
import './services/api.js';
import './services/categoriaService.js';
import './services/elementoService.js';
import './services/serieService.js';
import './services/loteMovimientoService.js';

// Componentes
import './components/Toast.js';
import './components/Modal.js';
import './components/Navbar.js';
import './components/Card.js';
import './components/seriesManager.js';
import './components/loteMovimientoUI.js';
import './components/dashboard/DashboardInfo.js';
import './components/dashboard/DashboardGuide.js';

// Controladores
import './controllers/categoriaController.js';
import './controllers/inventario/inventarioValidator.js';
import './controllers/inventario/inventarioFormBuilder.js';
import './controllers/inventario/inventarioController.js';

// Páginas
import './pages/Dashboard.js';
import './pages/Categorias.js';
import './pages/Inventario.js';

// App principal
import './app.js';
