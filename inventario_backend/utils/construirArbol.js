function construirArbol(categorias) {
    const mapa = {};
    const raices = [];

    for (const categoria of categorias) {
        mapa[categoria.id] = { ...categoria, hijos: [] };
    }

    for (const categoria of categorias) {
        if (categoria.categoria_padre_id !== null) {
            mapa[categoria.categoria_padre_id]?.hijos.push(mapa[categoria.id]);
        } else {
            raices.push(mapa[categoria.id]);
        }
    }
    return raices;
}

module.exports = { construirArbol };
