const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/elementos', require('./routes/elementos'));
app.use('/api/series', require('./routes/series'));
app.use('/api/categorias', require('./routes/categorias'));
app.use('/api/materiales', require('./routes/materiales'));
app.use('/api/unidades', require('./routes/unidades'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
const db = require('./models/db'); // Asegúrate de que la conexión a la base de datos esté configurada correctamente