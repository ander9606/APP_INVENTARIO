const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');

router.get('/', materialController.obtenerMateriales); // Obtener todos los materiales
router.post('/', materialController.crearMaterial); // Crear un nuevo material

module.exports = router;