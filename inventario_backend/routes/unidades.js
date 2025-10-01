// ============================================
// routes/unidades.js
// ============================================

import express from 'express';
import * as unidadController from '../controllers/unidadController.js';

const router = express.Router();

router.get('/', unidadController.obtenerUnidades);
router.post('/', unidadController.crearUnidad);

export default router;