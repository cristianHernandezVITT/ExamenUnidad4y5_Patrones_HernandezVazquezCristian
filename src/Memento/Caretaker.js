// Caretaker.js - Patrón Memento - Gestor del historial de estados

/**
 * Caretaker - Patrón Memento
 * Gestiona el historial de estados (Mementos)
 * Permite deshacer acciones retrocediendo a estados anteriores
 */
class Caretaker {
  constructor(originatorRestore) {
    this.stack = [];
    this.originatorRestore = originatorRestore;
  }

  add(state, esFinDeRonda = false) {
    this.stack.push(new Memento({ ...state, esFinDeRonda }));
  }

  undo() {
    if (this.stack.length <= 1) {
      alert('No hay más estados anteriores para deshacer.');
      return;
    }
    
    // Queremos encontrar el ANTERIOR fin de ronda
    // Empezamos desde length - 2 (antes del estado actual)
    let idx = this.stack.length - 2;
    
    // Buscar hacia atrás un estado marcado como fin de ronda
    while (idx >= 0) {
      const currentState = this.stack[idx].getState();
      if (currentState.esFinDeRonda) {
        // Encontramos un fin de ronda anterior, retroceder a este punto
        this.stack = this.stack.slice(0, idx + 1);
        this.originatorRestore(currentState);
        return;
      }
      idx--;
    }
    
    // Si no encontramos ningún fin de ronda (estamos en fase de colocación),
    // retroceder al estado anterior
    this.stack.pop();
    if (this.stack.length > 0) {
      const previous = this.stack[this.stack.length - 1];
      this.originatorRestore(previous.getState());
    } else {
      alert('No hay más estados anteriores para deshacer.');
    }
  }
}
