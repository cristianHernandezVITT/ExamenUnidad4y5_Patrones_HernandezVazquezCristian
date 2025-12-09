// Model.js - Capa de Modelo (MVC)
// Contiene toda la lógica de negocio: tableros, barcos, disparos
//Flyweight
const TAMAÑO = 10;

/**
 * TableroModelo - Gestiona la lógica del tablero
 */
class TableroModelo {
  constructor(nombre) {
    this.nombre = nombre;
    this.grid = Array.from({ length: TAMAÑO }, () =>
      Array.from({ length: TAMAÑO }, () => ({
        tiene: null,
        barcoId: null,
        disparado: false
      }))
    );
    this.barcos = [];
    this.siguenteId = 1;
    this.celdasRestantes = 0;
  }

  puedeColocar(tipo, tamanio, r, c, dir) {
    const pasos = [];
    const delta = TableroModelo._dirToDelta(dir);
    for (let i = 0; i < tamanio; i++) {
      const rr = r + delta.dr * i;
      const cc = c + delta.dc * i;
      if (rr < 0 || rr >= TAMAÑO || cc < 0 || cc >= TAMAÑO) return false;
      if (this.grid[rr][cc].tiene) return false;
      pasos.push({ r: rr, c: cc });
    }
    return true;
  }

  colocar(tipo, tamanio, r, c, dir) {
    if (!this.puedeColocar(tipo, tamanio, r, c, dir)) return false;
    const id = this.siguenteId++;
    const delta = TableroModelo._dirToDelta(dir);
    const celdas = [];
    for (let i = 0; i < tamanio; i++) {
      const rr = r + delta.dr * i;
      const cc = c + delta.dc * i;
      this.grid[rr][cc].tiene = tipo;
      this.grid[rr][cc].barcoId = id;
      celdas.push({ r: rr, c: cc });
    }
    this.barcos.push({
      id,
      tipo,
      tamanio,
      celdas,
      hits: 0,
      hundido: false
    });
    this.celdasRestantes += tamanio;
    return true;
  }

  recibirDisparo(r, c) {
    const cell = this.grid[r][c];
    if (cell.disparado) return { estado: 'repetido' };
    cell.disparado = true;
    if (cell.tiene) {
      const barco = this.barcos.find(b => b.id === cell.barcoId);
      barco.hits++;
      this.celdasRestantes--;
      if (barco.hits >= barco.tamanio) {
        barco.hundido = true;
        return { estado: 'hundido', tipo: barco.tipo };
      }
      return { estado: 'impacto', tipo: barco.tipo };
    }
    return { estado: 'fallo' };
  }

  obtenerEstadoCelda(r, c) {
    return this.grid[r][c];
  }

  static _dirToDelta(dir) {
    switch (dir) {
      case 'horizontal': return { dr: 0, dc: 1 };
      case 'vertical': return { dr: 1, dc: 0 };
      case 'diag-dr': return { dr: 1, dc: 1 };
      case 'diag-ur': return { dr: -1, dc: 1 };
    }
    return { dr: 0, dc: 1 };
  }
}

/**
 * JuegoModelo - Orquesta el estado general del juego
 */

//////////////////////////////////////
class JuegoModelo {
  constructor() {
    this.tableroJugador = new TableroModelo('Jugador');
    this.tableroEnemigo = new TableroModelo('Enemigo');
    this.poolDisparos = new PoolDisparos(0);
    this.estado = 'colocacion'; // colocacion, jugando, fin
    this.historialJugador = [];
    this.historialEnemigo = [];
    this.disparoActual = null;
    this.observadores = [];
  }

  agregarObservador(observador) {
    this.observadores.push(observador);
  }

  notificarObservadores(evento) {
    this.observadores.forEach(obs => obs.actualizar(evento));
  }

  puedeColocar(tipo, tamanio, r, c, dir) {
    return this.tableroJugador.puedeColocar(tipo, tamanio, r, c, dir);
  }

  colocarBarco(tipo, tamanio, r, c, dir) {
    const resultado = this.tableroJugador.colocar(tipo, tamanio, r, c, dir);
    if (resultado) {
      this.notificarObservadores({ tipo: 'barco_colocado', data: { tipo, r, c } });
    }
    return resultado;
  }
///////////////////////////////////////
  iniciarJuego() {
    if (this.tableroJugador.barcos.length === 0) return false;
    this.estado = 'jugando';
    // Crear pool basado en celdas ocupadas del jugador
    this.poolDisparos = new PoolDisparos(this.tableroJugador.celdasRestantes);
    this.notificarObservadores({ tipo: 'juego_iniciado' });
    return true;
  }

  ///////////////////////////////////Object pool
  disparar(r, c) {
    const resultado = this.tableroEnemigo.recibirDisparo(r, c);
    const disparo = this.poolDisparos.obtener();
    
    if (disparo) {
      disparo.r = r;
      disparo.c = c;
      disparo.resultado = resultado.estado;
      this.historialJugador.push(disparo);
      
      // El jugador siempre recupera el disparo, sin importar si acierta o falla
      this.poolDisparos.liberar(disparo);
    }

    this.notificarObservadores({
      tipo: 'disparo_realizado',
      data: { r, c, resultado }
    });

    if (this.tableroEnemigo.celdasRestantes === 0) {
      this.estado = 'fin';
    }

    return resultado;
  }

  recibirDisparoEnemigo(r, c) {
    const resultado = this.tableroJugador.recibirDisparo(r, c);
    
    this.notificarObservadores({
      tipo: 'disparo_enemigo',
      data: { r, c, resultado }
    });

    if (this.tableroJugador.celdasRestantes === 0) {
      this.estado = 'fin';
    }

    return resultado;
  }

  obtenerEstadoTablero(esEnemigo = false) {
    const tablero = esEnemigo ? this.tableroEnemigo : this.tableroJugador;
    return {
      grid: tablero.grid,
      barcos: tablero.barcos,
      celdasRestantes: tablero.celdasRestantes
    };
  }

  obtenerInfoPool() {
    return this.poolDisparos.obtenerInfo();
  }

  reiniciar() {
    this.tableroJugador = new TableroModelo('Jugador');
    this.tableroEnemigo = new TableroModelo('Enemigo');
    this.estado = 'colocacion';
    this.historialJugador = [];
    this.historialEnemigo = [];
    this.notificarObservadores({ tipo: 'juego_reiniciado' });
  }

  colocarBarcosEnemigoAleatorio() {
    const colocarTipo = (tipo, tam, intentosMax = 200) => {
      let intentos = 0;
      while (intentos < intentosMax) {
        const r = Math.floor(Math.random() * TAMAÑO);
        const c = Math.floor(Math.random() * TAMAÑO);
        const dirs = ['horizontal', 'vertical', 'diag-dr', 'diag-ur'];
        const dir = dirs[Math.floor(Math.random() * dirs.length)];
        if (this.tableroEnemigo.puedeColocar(tipo, tam, r, c, dir)) {
          this.tableroEnemigo.colocar(tipo, tam, r, c, dir);
          return true;
        }
        intentos++;
      }
      return false;
    };
    colocarTipo('buque', 2);
    colocarTipo('buque', 2);
    colocarTipo('submarino', 3);
  }
}
