import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Importar rutas
import elementosRoutes from './routes/elementos.js';
import seriesRoutes from './routes/series.js';
import categoriasRoutes from './routes/categorias.js';
import materialesRoutes from './routes/materiales.js';
import unidadesRoutes from './routes/unidades.js';

// Importar middleware de errores
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

// Middleware básico
app.use(cors());
app.use(express.json());

// Logging simple de requests (opcional pero útil)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body || '');
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Rutas API
app.use('/api/elementos', elementosRoutes);
app.use('/api/series', seriesRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/materiales', materialesRoutes);
app.use('/api/unidades', unidadesRoutes);

// Manejo de rutas no encontradas
app.use(notFoundHandler);

// Manejo centralizado de errores
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Modo: ${process.env.NODE_ENV || 'development'}`);
});

export default app;