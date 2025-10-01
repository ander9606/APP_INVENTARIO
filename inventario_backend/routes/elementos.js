// routes/elementos.js
import express from 'express';
import * as elementoController from '../controllers/elementoController.js';

const router = express.Router();

router.get('/', elementoController.obtenerElementos);
router.post('/', elementoController.crearElemento);
router.get('/:id', elementoController.detalleElemento);
router.put('/:id', elementoController.actualizarElemento);
router.delete('/:id', elementoController.eliminarElemento);

export default router;