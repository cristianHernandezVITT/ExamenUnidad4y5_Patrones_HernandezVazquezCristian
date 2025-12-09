// Controller.js - Capa de Controlador (MVC)
// Gestiona la interacción entre Model y View

/**
 * FLUJO DE DATOS EN MVC:
 * 
 * 1. Usuario interactúa con la Vista (click, selección)
 *    ↓
 * 2. Controller intercepta el evento
 *    ↓
 * 3. Controller modifica el Estado en Model
 *    ↓
 * 4. Model notifica cambios a través de Observer
 *    ↓
 * 5. Controller recibe notificación (actualizar())
 *    ↓
 * 6. Controller actualiza la Vista
 *    ↓
 * 7. Usuario ve los cambios en pantalla
 */

/**
 * ControladorJuego - Coordina el flujo del juego
 * Responsabilidades:
 * - Conectar eventos de UI con métodos del modelo
 * - Sincronizar vista con cambios del modelo
 * - Manejar lógica de flujo del juego
 */
class ControladorJuego {
  constructor(modelo, vista) {
    this.modelo = modelo;
    this.vista = vista;

    // Estado del controlador
    this.modoColocacion = true;
    this.barcosPorColocar = { buque: 2, submarino: 1 };
    this.barcosColocados = { buque: 0, submarino: 0 };
    this.ultimaPosicion = null;
    this.vistasCreadas = false;
    this.turnoEnemigo = false;
    this.disparosSeleccionados = new Set(); // Set de coordenadas seleccionadas

    // Inicializar Caretaker para Memento
    this.caretaker = new Caretaker((state) => this.restaurarDesdeMemento(state));

    this.actualizarVista();
    this.inicializarEventos();
    this.guardarEstado(); // Estado inicial

    // Agregar listener para Ctrl+Z
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        this.caretaker.undo();
      }
    });
  }

  inicializarEventos() {
    // Eventos del tablero del jugador (colocación)
    this.vista.tablerojugador.obtenerCeldasConListener((r, c) => {
      this.manejarClickTableroJugador(r, c);
    });

    // Preview al pasar el mouse (solo en modo colocación)
    this.vista.tablerojugador.contenedor.addEventListener('mouseover', (e) => {
      if (!this.modoColocacion) return;
      
      const celda = e.target.closest('[data-r][data-c]');
      if (celda) {
        const r = parseInt(celda.dataset.r);
        const c = parseInt(celda.dataset.c);
        this.mostrarPreviewPieza(r, c);
      }
    });

    this.vista.tablerojugador.contenedor.addEventListener('mouseout', () => {
      if (this.modoColocacion) {
        this.vista.tablerojugador.limpiarPreview();
      }
    });

    // Eventos del tablero de disparos
    this.vista.tableroDisparos.obtenerCeldasConListener((r, c) => {
      this.manejarClickTableroDisparos(r, c);
    });

    // Eventos del tablero enemigo (vista)
    this.vista.tableroEnemigo.obtenerCeldasConListener((r, c) => {
      this.manejarClickTableroEnemigo(r, c);
    });

    // Eventos de controles
    this.vista.controles.agregarEventoAlBtnIniciar(() => this.iniciarJuego());
    this.vista.controles.agregarEventoAlBtnDispara(() => this.realizarDisparo());
    this.vista.controles.agregarEventoAlBtnVerEnemigo(() => this.vista.controles.mostrarVistaEnemigo());
    this.vista.controles.agregarEventoAlBtnVolver(() => this.vista.controles.volverAMiTablero());

    // Observador del modelo
    this.modelo.agregarObservador(this);
  }

  manejarClickTableroJugador(r, c) {
    if (!this.modoColocacion) return;

    const { tipo, orientacion } = this.vista.controles.obtenerPiezaSeleccionada();
    const tamanios = { buque: 2, submarino: 3 };
    const tamanio = tamanios[tipo];

    // Verificar si aún se pueden colocar barcos de este tipo
    if (this.barcosColocados[tipo] >= this.barcosPorColocar[tipo]) {
      alert(`Ya colocaste todos los ${tipo}s`);
      return;
    }

    // Intentar colocar el barco inmediatamente
    if (this.modelo.puedeColocar(tipo, tamanio, r, c, orientacion)) {
      if (this.modelo.colocarBarco(tipo, tamanio, r, c, orientacion)) {
        this.barcosColocados[tipo]++;
        this.guardarEstado(); // Memento
        this.actualizarVista();

        // Verificar si completó la colocación
        const totalColocados = this.barcosColocados.buque + this.barcosColocados.submarino;
        const totalRequerido = this.barcosPorColocar.buque + this.barcosPorColocar.submarino;

        if (totalColocados === totalRequerido) {
          this.vista.controles.habilitarBotones(true, false);
          alert('Has colocado todas las piezas. Presiona "Iniciar Juego" para comenzar.');
        }
      }
    } else {
      alert('No se puede colocar allí (fuera de rango o sobreposición).');
    }
  }

  mostrarPreviewPieza(r, c) {
    const { tipo, orientacion } = this.vista.controles.obtenerPiezaSeleccionada();
    const tamanios = { buque: 2, submarino: 3 };
    const tamanio = tamanios[tipo];

    // Verificar si se puede colocar
    if (this.barcosColocados[tipo] >= this.barcosPorColocar[tipo]) {
      this.vista.tablerojugador.limpiarPreview();
      return;
    }

    const celdas = this.calcularCeldasPieza(r, c, tamanio, orientacion);
    const valido = this.modelo.puedeColocar(tipo, tamanio, r, c, orientacion);
    this.vista.tablerojugador.marcarPreview(celdas, valido);
  }

  calcularCeldasPieza(r, c, tamanio, orientacion) {
    const celdas = [];
    const delta = this.getDelta(orientacion);
    for (let i = 0; i < tamanio; i++) {
      const rr = r + delta.dr * i;
      const cc = c + delta.dc * i;
      celdas.push({ r: rr, c: cc });
    }
    return celdas;
  }

  getDelta(orientacion) {
    switch (orientacion) {
      case 'horizontal': return { dr: 0, dc: 1 };
      case 'vertical': return { dr: 1, dc: 0 };
      case 'diag-dr': return { dr: 1, dc: 1 };
      case 'diag-ur': return { dr: -1, dc: 1 };
      default: return { dr: 0, dc: 1 };
    }
  }

  manejarClickTableroDisparos(r, c) {
    if (!this.modoColocacion && this.modelo.estado === 'jugando' && !this.turnoEnemigo) {
      const key = `${r},${c}`;
      
      // Verificar si ya fue disparado
      if (this.modelo.tableroEnemigo.grid[r][c].disparado) {
        alert('Ya disparaste en esa casilla');
        return;
      }

      // Verificar disparos disponibles
      const infoPool = this.modelo.obtenerInfoPool();
      if (infoPool.disponibles <= 0) {
        alert('No tienes disparos disponibles');
        return;
      }

      // Alternar selección
      if (this.disparosSeleccionados.has(key)) {
        this.disparosSeleccionados.delete(key);
        this.vista.tableroDisparos.marcarSeleccion(-1, -1);
      } else {
        // Limitar a los disparos realmente disponibles
        const disparosPendientes = infoPool.disponibles - this.disparosSeleccionados.size;
        if (disparosPendientes <= 0) {
          alert(`Solo puedes seleccionar ${infoPool.disponibles} casillas`);
          return;
        }
        this.disparosSeleccionados.add(key);
      }
      
      // Actualizar UI
      this.actualizarMarcasDisparos();
      this.actualizarVista();
    }
  }

  actualizarMarcasDisparos() {
    // Verificar que existan celdas
    if (!this.vista.tableroDisparos || !this.vista.tableroDisparos.celdas || this.vista.tableroDisparos.celdas.length === 0) {
      console.warn('tableroDisparos o celdas no disponibles');
      return;
    }
    
    console.log('Actualizando marcas. Disparos seleccionados:', Array.from(this.disparosSeleccionados));
    
    // Limpiar marcas previas
    this.vista.tableroDisparos.celdas.forEach(c => {
      if (c) c.classList.remove('disparar-seleccionado');
    });
    
    // Marcar disparos seleccionados con efecto visual
    this.disparosSeleccionados.forEach(key => {
      const [r, c] = key.split(',').map(Number);
      const idx = r * 10 + c;
      if (idx >= 0 && idx < this.vista.tableroDisparos.celdas.length) {
        const celda = this.vista.tableroDisparos.celdas[idx];
        if (celda) {
          celda.classList.add('disparar-seleccionado');
          console.log(`Marcada celda [${r},${c}] con disparar-seleccionado`);
        }
      }
    });
  }

  manejarClickTableroEnemigo(r, c) {
    if (!this.modoColocacion && this.modelo.estado === 'jugando' && !this.turnoEnemigo) {
      // Redirigir al tablero de disparos
      this.manejarClickTableroDisparos(r, c);
    }
  }

  iniciarJuego() {
    const totalColocados = this.barcosColocados.buque + this.barcosColocados.submarino;
    const totalRequerido = this.barcosPorColocar.buque + this.barcosPorColocar.submarino;

    if (totalColocados < totalRequerido) {
      alert('Debes colocar todas tus piezas antes de iniciar.');
      return;
    }

    this.modoColocacion = false;
    // Colocar barcos enemigos aleatoriamente
    this.modelo.colocarBarcosEnemigoAleatorio();
    if (this.modelo.iniciarJuego()) {
      this.vista.controles.habilitarBotones(false, true);
      this.guardarEstado(true); // Marcar fin de fase de colocación
      this.actualizarVista();
    }
  }

  realizarDisparo() {
    if (this.modelo.estado !== 'jugando' || this.turnoEnemigo) return;

    if (this.disparosSeleccionados.size === 0) {
      alert('Selecciona al menos una casilla para disparar');
      return;
    }

    const resultados = [];
    const orden = Array.from(this.disparosSeleccionados).sort();
    
    // Disparar en todas las casillas seleccionadas
    orden.forEach(key => {
      const [r, c] = key.split(',').map(Number);
      const resultado = this.modelo.disparar(r, c);
      
      let mensaje = `(${r + 1},${c + 1}) - `;
      if (resultado.estado === 'fallo') {
        mensaje += 'Fallo';
      } else if (resultado.estado === 'impacto') {
        mensaje += `¡Impacto en ${resultado.tipo}!`;
      } else if (resultado.estado === 'hundido') {
        mensaje += `¡${resultado.tipo} hundido!`;
      }
      resultados.push(mensaje);
      this.vista.controles.agregarAlHistorial('historialJugador', 'Disparo', r, c, resultado.estado);
    });

    this.disparosSeleccionados.clear();
    this.actualizarVista();
    alert('Tus disparos:\n' + resultados.join('\n'));

    // Verificar si ganó
    if (this.modelo.estado === 'fin') {
      alert('¡Has ganado!');
      this.guardarEstado(true);
      return;
    }

    // Turno del enemigo
    this.turnoEnemigo = true;
    setTimeout(() => this.ejecutarTurnoEnemigo(), 1000);
  }

  ejecutarTurnoEnemigo() {
    alert('Turno del enemigo');
    
    // El enemigo dispara tantas veces como celdas le queden ocupadas
    const disparosEnemigo = this.modelo.tableroEnemigo.celdasRestantes;
    const mensajes = [];
    
    // Obtener celdas no disparadas
    const celdasDisponibles = [];
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        const celda = this.modelo.tableroJugador.grid[r][c];
        if (!celda.disparado) {
          celdasDisponibles.push({ r, c });
        }
      }
    }

    // Mezclar aleatoriamente
    for (let i = celdasDisponibles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [celdasDisponibles[i], celdasDisponibles[j]] = [celdasDisponibles[j], celdasDisponibles[i]];
    }

    // Disparar y contar impactos
    let impactosEnemigo = 0;
    for (let i = 0; i < Math.min(disparosEnemigo, celdasDisponibles.length); i++) {
      const { r, c } = celdasDisponibles[i];
      const resultado = this.modelo.recibirDisparoEnemigo(r, c);
      
      // Si fue impacto, reduce los disparos del jugador
      if (resultado.estado === 'impacto' || resultado.estado === 'hundido') {
        impactosEnemigo++;
        // Reducir la capacidad máxima del pool de disparos del jugador
        this.modelo.poolDisparos.reducirCapacidad();
      }
      
      let mensaje = `(${r + 1},${c + 1}) - `;
      if (resultado.estado === 'fallo') {
        mensaje += 'Fallo';
      } else if (resultado.estado === 'impacto') {
        mensaje += `¡Impacto en tu ${resultado.tipo}!`;
      } else if (resultado.estado === 'hundido') {
        mensaje += `¡Hundió tu ${resultado.tipo}!`;
      }
      
      mensajes.push(mensaje);
      this.vista.controles.agregarAlHistorial('historialEnemigo', 'Disparo enemigo', r, c, resultado.estado);
    }

    this.actualizarVista();
    alert('Disparos del enemigo:\n' + mensajes.join('\n'));

    // Verificar si perdiste
    if (this.modelo.estado === 'fin') {
      alert('¡Has perdido!');
      this.guardarEstado(true);
      return;
    }

    // Devolver turno al jugador
    this.turnoEnemigo = false;
    // GUARDAR ESTADO FIN DE RONDA: después de que jugador y enemigo han disparado
    this.guardarEstado(true);
    const infoPool = this.modelo.obtenerInfoPool();
    alert(`Es tu turno nuevamente. Tienes ${infoPool.total}/${infoPool.total} disparos disponibles`);
  }

  actualizarVista() {
    const estadoJugador = this.modelo.obtenerEstadoTablero(false);
    const estadoEnemigo = this.modelo.obtenerEstadoTablero(true);

    // Renderizar tableros solo la primera vez
    if (!this.vistasCreadas) {
      this.vista.renderizarTableros(estadoJugador, estadoEnemigo);
      this.vistasCreadas = true;
    } else {
      this.vista.actualizarTableros(estadoJugador, estadoEnemigo);
    }
    
    // Actualizar contador de piezas
    const barcosFaltantes = this.barcosPorColocar.buque - this.barcosColocados.buque;
    const submarinosFaltantes = this.barcosPorColocar.submarino - this.barcosColocados.submarino;
    this.vista.controles.actualizarContador(barcosFaltantes, submarinosFaltantes);

    // Actualizar info del pool
    const infoPool = this.modelo.obtenerInfoPool();
    // disparosDisponibles = total - seleccionados (lo que queda por usar en esta ronda)
    // totalDisparosActual = capacidad máxima (disminuye cuando enemigo golpea)
    const disparosDisponibles = infoPool.total - this.disparosSeleccionados.size;
    const totalDisparosActual = infoPool.total;
    this.vista.controles.actualizarPoolInfo(disparosDisponibles, totalDisparosActual);

    // Habilitar botones según estado
    if (this.modoColocacion) {
      this.vista.controles.habilitarBotones(true, false);
    } else {
      this.vista.controles.habilitarBotones(false, true);
    }
    
    // RE-APLICAR MARCAS VISUALES A CASILLAS SELECCIONADAS
    this.actualizarMarcasDisparos();
  }

  // Implementar interfaz de Observador
  actualizar(evento) {
    console.log('Evento del modelo:', evento);
    switch (evento.tipo) {
      case 'barco_colocado':
        this.actualizarVista();
        break;
      case 'juego_iniciado':
        alert('El juego ha iniciado. Selecciona tus casillas en la tabla de disparos para disparar');
        break;
      case 'disparo_realizado':
        this.actualizarVista();
        break;
      case 'juego_finalizado':
        const mensajeFinal = evento.data.ganador === 'Jugador' ? '¡Has ganado!' : '¡Has perdido!';
        alert(mensajeFinal);
        break;
      case 'juego_reiniciado':
        this.modoColocacion = true;
        this.barcosColocados = { buque: 0, submarino: 0 };
        this.actualizarVista();
        break;
    }
  }

  // Métodos para patrón Memento
  capturarEstado() {
    return {
      modelo: {
        tableroJugador: this.clonarTablero(this.modelo.tableroJugador),
        tableroEnemigo: this.clonarTablero(this.modelo.tableroEnemigo),
        estado: this.modelo.estado,
        historialJugador: [...this.modelo.historialJugador],
        historialEnemigo: [...this.modelo.historialEnemigo],
        poolMax: this.modelo.poolDisparos.max,
        poolDisponibles: this.modelo.poolDisparos.obtenerInfo().disponibles
      },
      controller: {
        modoColocacion: this.modoColocacion,
        barcosColocados: { ...this.barcosColocados },
        turnoEnemigo: this.turnoEnemigo,
        disparosSeleccionados: Array.from(this.disparosSeleccionados)
      }
    };
  }

  clonarTablero(tablero) {
    return {
      nombre: tablero.nombre,
      grid: tablero.grid.map(fila => fila.map(cell => ({ ...cell }))),
      barcos: tablero.barcos.map(b => ({ ...b, celdas: b.celdas.map(c => ({ ...c })) })),
      siguenteId: tablero.siguenteId,
      celdasRestantes: tablero.celdasRestantes
    };
  }

  aplicarTablero(dest, data) {
    dest.nombre = data.nombre;
    dest.grid = data.grid.map(fila => fila.map(cell => ({ ...cell })));
    dest.barcos = data.barcos.map(b => ({ ...b, celdas: b.celdas.map(c => ({ ...c })) }));
    dest.siguenteId = data.siguenteId;
    dest.celdasRestantes = data.celdasRestantes;
  }

  guardarEstado(esFinDeRonda = false) {
    this.caretaker.add(this.capturarEstado(), esFinDeRonda);
  }

  restaurarDesdeMemento(state) {
    this.aplicarTablero(this.modelo.tableroJugador, state.modelo.tableroJugador);
    this.aplicarTablero(this.modelo.tableroEnemigo, state.modelo.tableroEnemigo);
    this.modelo.estado = state.modelo.estado;
    this.modelo.historialJugador = [...state.modelo.historialJugador];
    this.modelo.historialEnemigo = [...state.modelo.historialEnemigo];
    
    // Restaurar pool
    if (state.modelo.poolMax !== undefined) {
      this.modelo.poolDisparos = new PoolDisparos(state.modelo.poolMax);
      // Simular disparos usados
      const disparosUsados = state.modelo.poolMax - state.modelo.poolDisponibles;
      for (let i = 0; i < disparosUsados; i++) {
        this.modelo.poolDisparos.obtener();
      }
    }
    
    this.modoColocacion = state.controller.modoColocacion;
    this.barcosColocados = { ...state.controller.barcosColocados };
    this.turnoEnemigo = state.controller.turnoEnemigo || false;
    this.disparosSeleccionados.clear();
    if (state.controller.disparosSeleccionados) {
      state.controller.disparosSeleccionados.forEach(key => this.disparosSeleccionados.add(key));
    }
    this.actualizarVista();
    this.actualizarMarcasDisparos();
  }
}
