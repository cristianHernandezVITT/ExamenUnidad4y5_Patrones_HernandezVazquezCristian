// FlyweightCeldaFactory.js - Patrón Flyweight para optimización de renderizado

/**
 * FlyweightCeldaFactory - Patrón Flyweight
 * Reutiliza objetos flyweight para aplicar estilos a las celdas del tablero
 * reduciendo el uso de memoria al compartir estados intrínsecos
 */
const FlyweightCeldaFactory = (function () {
  const cache = {};

  function obtener(key) {
    if (cache[key]) return cache[key];
    const fly = {
      aplicar(el, estado) {
        el.className = 'celda';
        if (estado === 'buque') el.classList.add('barco');
        if (estado === 'submarino') el.classList.add('submarino');
        if (estado === 'hit') el.classList.add('hit');
        if (estado === 'miss') el.classList.add('miss');
        if (estado === 'seleccion') el.classList.add('seleccion');
      }
    };
    cache[key] = fly;
    return fly;
  }

  return { obtener };
})();
