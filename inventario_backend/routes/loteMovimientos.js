// ============================================
// routes/loteMovimientos.js
// ============================================

import express from 'express';
import * as loteMovimientoController from '../controllers/loteMovimientoController.js';

const router = express.Router();

// Rutas específicas primero
router.get('/motivos', loteMovimientoController.obtenerMotivos);
router.get('/historial/:id', loteMovimientoController.obtenerHistorial);
router.get('/estadisticas/:id', loteMovimientoController.obtenerEstadisticas);

// Rutas generales
router.post('/cambiar-estado', loteMovimientoController.cambiarEstadoLote);

export default router;