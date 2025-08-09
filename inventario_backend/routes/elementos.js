// routes/elementos.js
const express = require('express');
const router = express.Router();
const elementoController = require('../controllers/elementoController');

router.get('/', elementoController.obtenerElementos);
router.post('/', elementoController.crearElemento);
router.put('/:id', elementoController.actualizarElemento);
router.delete('/:id', elementoController.eliminarElemento);

//detalle
router.get('/:id/detalle', elementoController.detalleElemento);


module.exports = router;
