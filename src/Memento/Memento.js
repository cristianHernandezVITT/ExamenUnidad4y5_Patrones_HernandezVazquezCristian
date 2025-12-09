// Memento.js - Patrón Memento para guardar estados del juego

/**
 * Memento - Patrón Memento
 * Captura y almacena el estado interno de un objeto
 * sin violar el encapsulamiento
 */
class Memento {
  constructor(state) {
    this.state = state;
  }

  getState() {
    return this.state;
  }
}
