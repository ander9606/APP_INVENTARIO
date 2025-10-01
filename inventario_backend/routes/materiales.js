// ============================================
// routes/materiales.js
// ============================================

import express from 'express';
import * as materialController from '../controllers/materialController.js';

const router = express.Router();

router.get('/', materialController.obtenerMateriales);
router.post('/', materialController.crearMaterial);

export default router;
