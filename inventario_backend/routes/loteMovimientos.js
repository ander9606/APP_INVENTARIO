// ============================================
// routes/loteMovimientos.js
// Rutas actualizadas para sistema de estados múltiples
// ============================================

import express from 'express';
import * as loteMovimientoController from '../controllers/loteMovimientoController.js';

const router = express.Router();

// ============================================
// RUTAS DE CONSULTA (GET)
// ============================================

// Obtener catálogo de motivos
router.get('/motivos', loteMovimientoController.obtenerMotivos);

// Obtener resumen de estados de un elemento
router.get('/resumen/:id', loteMovimientoController.obtenerResumen);

// Obtener historial de movimientos
router.get('/historial/:id', loteMovimientoController.obtenerHistorial);

// Obtener estadísticas
router.get('/estadisticas/:id', loteMovimientoController.obtenerEstadisticas);

// ============================================
// RUTAS DE ACCIÓN (POST)
// ============================================

// Cambiar estado genérico (más flexible)
router.post('/cambiar-estado', loteMovimientoController.cambiarEstado);

// Métodos de conveniencia
router.post('/alquilar', loteMovimientoController.alquilar);
router.post('/devolver', loteMovimientoController.devolver);
router.post('/completar-limpieza', loteMovimientoController.completarLimpieza);
router.post('/completar-mantenimiento', loteMovimientoController.completarMantenimiento);

export default router;