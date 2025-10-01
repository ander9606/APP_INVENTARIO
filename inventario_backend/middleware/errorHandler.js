// middleware/errorHandler.js

/**
 * Middleware para manejar rutas no encontradas (404)
 */
export const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
    });
};

/**
 * Middleware centralizado para manejar todos los errores
 */
export const errorHandler = (err, req, res, next) => {
    // Log completo del error en consola (desarrollo)
    console.error('❌ Error capturado:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        path: req.path,
        method: req.method
    });

    // Determinar código de estado
    const statusCode = err.statusCode || err.status || 500;

    // Estructura base de respuesta de error
    const errorResponse = {
        success: false,
        error: err.message || 'Error interno del servidor'
    };

    // En desarrollo, agregar más detalles
    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = err.stack;
        errorResponse.details = err.details || null;
    }

    // Errores específicos de MySQL/Base de datos
    if (err.code) {
        switch (err.code) {
            case 'ER_DUP_ENTRY':
                errorResponse.error = 'Ya existe un registro con ese valor único';
                return res.status(409).json(errorResponse);
            
            case 'ER_NO_REFERENCED_ROW_2':
                errorResponse.error = 'Referencia inválida a otro registro';
                return res.status(400).json(errorResponse);
            
            case 'ER_ROW_IS_REFERENCED_2':
                errorResponse.error = 'No se puede eliminar: hay registros relacionados';
                return res.status(409).json(errorResponse);
            
            case 'ER_BAD_FIELD_ERROR':
                errorResponse.error = 'Campo de base de datos inválido';
                return res.status(400).json(errorResponse);
            
            case 'ER_PARSE_ERROR':
                errorResponse.error = 'Error de sintaxis en la consulta';
                return res.status(500).json(errorResponse);

            case 'ECONNREFUSED':
                errorResponse.error = 'No se pudo conectar a la base de datos';
                return res.status(503).json(errorResponse);
        }
    }

    // Respuesta genérica
    res.status(statusCode).json(errorResponse);
};

/**
 * Clase personalizada para errores de validación
 */
export class ValidationError extends Error {
    constructor(message, details = null) {
        super(message);
        this.name = 'ValidationError';
        this.statusCode = 400;
        this.details = details;
    }
}

/**
 * Clase personalizada para errores de no encontrado
 */
export class NotFoundError extends Error {
    constructor(message = 'Recurso no encontrado') {
        super(message);
        this.name = 'NotFoundError';
        this.statusCode = 404;
    }
}