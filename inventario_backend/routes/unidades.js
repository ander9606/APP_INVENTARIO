const express = require('express');
const router = express.Router();
const unidadController = require('../controllers/unidadController');

// Crear una nueva unidad
router.post('/', unidadController.crearUnidad);
// Obtener todas las unidades
router.get('/', unidadController.obtenerUnidades);

module.exports = router;