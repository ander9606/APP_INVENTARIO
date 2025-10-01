// ============================================
// routes/series.js
// ============================================

import express from 'express';
import * as serieController from '../controllers/serieController.js';

const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Ruta de series funciona correctamente' 
    });
});

// IMPORTANTE: La ruta más específica primero
router.get('/elemento/:id_elemento', serieController.obtenerSeriesPorElemento);
router.post('/', serieController.crearSerie);
router.put('/:id', serieController.actualizarSerie);
router.delete('/:id', serieController.eliminarSerie);

export default router;