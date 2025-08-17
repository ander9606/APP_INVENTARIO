function construirArbol(categorias) {
    const mapa = {};
    const raices = [];

    // Paso 1: crear el mapa con todas las categorías
    for (const categoria of categorias) {
        mapa[categoria.id] = { ...categoria, hijos: [] };
    }

    // Paso 2: enganchar cada categoría a su padre (si existe)
    for (const categoria of categorias) {
        const padreId = categoria.categoria_padre_id;

        if (padreId && mapa[padreId]) {
            // si el padre existe en el mapa, se anida
            mapa[padreId].hijos.push(mapa[categoria.id]);
        } else if (padreId) {
            // el padreId existe pero no está en el mapa (error de datos)
            console.warn(
                `⚠️ La categoría "${categoria.nombre}" (id: ${categoria.id}) ` +
                `tiene un padre con id ${padreId} que no se encontró en la lista`
            );
            raices.push(mapa[categoria.id]); // lo mandamos como raíz para no perderlo
        } else {
            // si no tiene padre, es raíz
            raices.push(mapa[categoria.id]);
        }
    }

    return raices;
}

const construirJerarquia = construirArbol;
module.exports = { construirArbol, construirJerarquia };
// utils/construirArbol.js
// Este archivo contiene la lógica para construir un árbol jerárquico a partir de un listado