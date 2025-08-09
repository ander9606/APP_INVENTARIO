// models/db.js

// Importamos el paquete mysql2 con soporte para promesas
const mysql = require('mysql2/promise');

// Creamos una conexión tipo pool (mejor para múltiples consultas)
const db = mysql.createPool({
  host: process.env.DB_HOST,     // Dirección del servidor MySQL
  user: process.env.DB_USER,     // Usuario de acceso
  password: process.env.DB_PASSWORD, // Contraseña del usuario
  database: process.env.DB_NAME, // Nombre de la base de datos
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = db;
