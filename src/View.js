// View.js - Capa de Vista (MVC)
// Responsable del renderizado e interacción con el DOM

/**
 * VistaTablero - Renderiza un tablero en la interfaz
 */
class VistaTablero {
  constructor(contenedorId, esJugador = true) {
    this.contenedor = document.getElementById(contenedorId);
    this.esJugador = esJugador;
    this.celdas = [];
    this.seleccionada = null;
  }

  crear(grid) {
    this.contenedor.innerHTML = '';
    this.celdas = [];
    
    // Agregar clase para grid con etiquetas
    this.contenedor.classList.add('label-grid');
    
    // Crear etiquetas de columnas (X: 1-10)
    const labelVacio = document.createElement('div');
    labelVacio.classList.add('label');
    this.contenedor.appendChild(labelVacio);
    
    for (let c = 0; c < TAMAÑO; c++) {
      const labelCol = document.createElement('div');
      labelCol.classList.add('label');
      labelCol.textContent = (c + 1);
      this.contenedor.appendChild(labelCol);
    }
    
    // Crear filas con etiquetas (Y: 1-10)
    grid.forEach((fila, r) => {
      // Etiqueta de fila (Y)
      const labelFila = document.createElement('div');
      labelFila.classList.add('label');
      labelFila.textContent = (r + 1);
      this.contenedor.appendChild(labelFila);
      
      // Celdas
      fila.forEach((celda, c) => {
        const div = document.createElement('div');
        div.dataset.r = r;
        div.dataset.c = c;
        this.aplicarEstilo(div, celda);
        this.contenedor.appendChild(div);
        this.celdas.push(div);
      });
    });
  }
//////////////////////////////////////////////////////////////////////////
  aplicarEstilo(div, celda) {
    let estado = 'vacio';
    if (this.esJugador && celda.tiene) {
      estado = celda.tiene;
    }
    if (celda.disparado) {
      estado = celda.tiene ? 'hit' : 'miss';
    }

    const fly = FlyweightCeldaFactory.obtener(estado);
    fly.aplicar(div, estado);
  }

  actualizar(grid) {
    grid.forEach((fila, r) => {
      fila.forEach((celda, c) => {
        const idx = r * TAMAÑO + c;
        if (this.celdas[idx]) {
          this.aplicarEstilo(this.celdas[idx], celda);
        }
      });
    });
  }

  obtenerCeldasConListener(callback) {
    // Usar delegación de eventos en el contenedor
    this.contenedor.addEventListener('click', (e) => {
      const celda = e.target.closest('[data-r][data-c]');
      if (celda) {
        const r = parseInt(celda.dataset.r);
        const c = parseInt(celda.dataset.c);
        callback(r, c);
      }
    });
  }

  marcarSeleccion(r, c) {
    if (this.seleccionada) {
      this.seleccionada.classList.remove('seleccion');
    }
    if (r >= 0 && r < TAMAÑO && c >= 0 && c < TAMAÑO) {
      const idx = r * TAMAÑO + c;
      this.seleccionada = this.celdas[idx];
      this.seleccionada.classList.add('seleccion');
    }
  }

  marcarPreview(celdas, valido = true) {
    // Limpiar preview anterior
    this.celdas.forEach(c => {
      c.classList.remove('seleccion');
      c.classList.remove('preview-invalido');
    });

    // Marcar nuevas celdas
    celdas.forEach(({ r, c }) => {
      const idx = r * TAMAÑO + c;
      if (this.celdas[idx]) {
        if (valido) {
          this.celdas[idx].classList.add('seleccion');
        } else {
          this.celdas[idx].classList.add('preview-invalido');
        }
      }
    });
  }

  limpiarPreview() {
    this.celdas.forEach(c => {
      c.classList.remove('seleccion');
      c.classList.remove('preview-invalido');
    });
  }
}

/**
 * VistaControles - Gestiona los controles de la interfaz
 */
class VistaControles {
  constructor() {
    this.selectPieza = document.getElementById('select-pieza');
    this.selectOrientacion = document.getElementById('select-orientacion');
    this.contadorPiezas = document.getElementById('contador-piezas');
    this.btnIniciar = document.getElementById('btn-iniciar');
    this.btnDispara = document.getElementById('btn-disparar');
    this.btnVerEnemigo = document.getElementById('btn-ver-enemigo');
    this.btnVolver = document.getElementById('btn-volver');
    this.poolInfo = document.getElementById('pool-info');
    this.historialJugador = document.getElementById('historial-jugador');
    this.historialEnemigo = document.getElementById('historial-enemigo');
    this.vistaJugador = document.getElementById('vista-jugador');
    this.vistaEnemigo = document.getElementById('vista-enemigo');
  }

  obtenerPiezaSeleccionada() {
    return {
      tipo: this.selectPieza.value,
      orientacion: this.selectOrientacion.value
    };
  }

  actualizarContador(barcos, submarinos) {
    this.contadorPiezas.textContent = `Buques: ${barcos} | Submarinos: ${submarinos}`;
  }

  habilitarBotones(iniciar = false, disparar = false) {
    this.btnIniciar.disabled = !iniciar;
    this.btnDispara.disabled = !disparar;
  }

  ///////////////////////////////////////
  actualizarPoolInfo(disponibles, total) {
    this.poolInfo.textContent = `Disparos disponibles: ${disponibles}/${total}`;
  }

  agregarAlHistorial(elemento, tipo, r, c, resultado) {
    const li = document.createElement('li');
    li.textContent = `${tipo}: (${r},${c}) - ${resultado}`;
    
    if (elemento === 'historialJugador') {
      this.historialJugador.appendChild(li);
    } else {
      this.historialEnemigo.appendChild(li);
    }
  }

  mostrarVistaEnemigo() {
    this.vistaJugador.style.display = 'none';
    this.vistaEnemigo.style.display = 'block';
    this.btnVerEnemigo.style.display = 'none';
    this.btnVolver.style.display = 'inline-block';
  }

  volverAMiTablero() {
    this.vistaJugador.style.display = 'block';
    this.vistaEnemigo.style.display = 'none';
    this.btnVerEnemigo.style.display = 'inline-block';
    this.btnVolver.style.display = 'none';
  }

  agregarEventoAlBtnIniciar(callback) {
    this.btnIniciar.addEventListener('click', callback);
  }

  agregarEventoAlBtnDispara(callback) {
    this.btnDispara.addEventListener('click', callback);
  }

  agregarEventoAlBtnVerEnemigo(callback) {
    this.btnVerEnemigo.addEventListener('click', callback);
  }

  agregarEventoAlBtnVolver(callback) {
    this.btnVolver.addEventListener('click', callback);
  }
}

/**
 * VistaPrincipal - Coordina todas las vistas
 */
class VistaPrincipal {
  constructor() {
    this.tablerojugador = new VistaTablero('tablero-jugador', true);
    this.tableroDisparos = new VistaTablero('tablero-disparos', false);
    this.tableroEnemigo = new VistaTablero('tablero-enemigo', false);
    this.controles = new VistaControles();
  }

  renderizarTableros(estadoJugador, estadoEnemigo) {
    this.tablerojugador.crear(estadoJugador.grid);
    this.tableroDisparos.crear(estadoEnemigo.grid);
    this.tableroEnemigo.crear(estadoEnemigo.grid);
  }

  actualizarTableros(estadoJugador, estadoEnemigo) {
    this.tablerojugador.actualizar(estadoJugador.grid);
    this.tableroDisparos.actualizar(estadoEnemigo.grid);
    this.tableroEnemigo.actualizar(estadoEnemigo.grid);
  }
}
