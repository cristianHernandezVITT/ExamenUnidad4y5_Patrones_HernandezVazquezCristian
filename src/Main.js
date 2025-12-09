// Main.js - Punto de entrada de la aplicación
// Inicializa el patrón MVC

document.addEventListener('DOMContentLoaded', () => {
  // Crear instancias del patrón MVC
  const modelo = new JuegoModelo();
  const vista = new VistaPrincipal();
  const controlador = new ControladorJuego(modelo, vista);

  // El controlador ya maneja toda la interacción
  console.log(' Juego Battleship - Patrón MVC iniciado');
});
