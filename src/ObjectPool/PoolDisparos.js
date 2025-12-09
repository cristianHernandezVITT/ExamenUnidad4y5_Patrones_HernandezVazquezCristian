// PoolDisparos.js - Patrón Object Pool para gestión eficiente de disparos

/**
 * PoolDisparos - Patrón Object Pool
 * Gestiona un conjunto reutilizable de objetos de disparo
 * para evitar la creación y destrucción constante de objetos
 */
class PoolDisparos {
  constructor(max) {
    this.max = Math.max(0, max);
    this.available = [];
    this.inUse = new Set();
    for (let i = 0; i < this.max; i++) {
      this.available.push({ id: i, r: 0, c: 0, resultado: null });
    }
  }

  obtener() {
    if (this.available.length === 0) return null;
    const disparo = this.available.pop();
    this.inUse.add(disparo);
    return disparo;
  }

  liberar(disparo) {
    this.inUse.delete(disparo);
    if (this.available.length < this.max) {
      this.available.push(disparo);
    }
  }

  reducirCapacidad() {
    // Cuando el enemigo golpea, reducimos la capacidad máxima del pool
    if (this.max > 0) {
      this.max--;
    }
  }

  obtenerInfo() {
    return {
      disponibles: this.available.length,
      enUso: this.inUse.size,
      total: this.max
    };
  }
}
