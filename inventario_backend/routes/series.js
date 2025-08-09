const express = require('express');
const router = express.Router();
const serieController = require('../controllers/serieController');

// Crear una nueva serie
router.post('/', serieController.crearSerie);

// Obtener todas las series de un elemento por su ID
router.get('/:id_elemento', serieController.obtenerSeriesPorElemento);

// Actualizar una serie por su ID
router.put('/:id', serieController.actualizarSerie);

// Eliminar una serie por su ID
router.delete('/:id', serieController.eliminarSerie);

module.exports = router;
