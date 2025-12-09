# Juego Battleship - Patrón MVC

Este proyecto implementa el patrón arquitectónico **Model-View-Controller (MVC)** en un juego de Battleship simplificado, junto con varios patrones de diseño organizados en módulos.

## 📋 Estructura del Proyecto

El patrón MVC separa la aplicación en tres capas independientes, y los patrones de diseño están organizados en carpetas específicas:

### 🗂️ Estructura de Archivos y Carpetas

```
ProyectoFinal/
├── Memento/                    (Patrón Memento)
│   ├── Memento.js             - Captura estados del juego
│   └── Caretaker.js           - Gestiona historial de estados
├── ObjectPool/                 (Patrón Object Pool)
│   └── PoolDisparos.js        - Gestión eficiente de disparos
├── Flyweight/                  (Patrón Flyweight)
│   └── FlyweightCeldaFactory.js - Optimización de renderizado
├── Model.js                    (Capa de Modelo - MVC)
├── View.js                     (Capa de Vista - MVC)
├── Controller.js               (Capa de Controlador - MVC)
├── Main.js                     (Punto de entrada)
├── program.HTML                (Interfaz HTML)
├── Styles.CSS                  (Estilos)
└── README.md                   (Este archivo)
```

---

## 📖 Explicación del Patrón MVC

### **1. MODEL (Modelo) - `Model.js`**

**Responsabilidad:** Gestionar la lógica de negocio y los datos

**Clases principales:**

- **`TableroModelo`**: Representa la lógica de un tablero de juego
  - Gestiona el grid 10x10
  - Valida colocación de barcos
  - Procesa disparos y actualiza estado
  - Métodos: `puedeColocar()`, `colocar()`, `recibirDisparo()`

- **`JuegoModelo`**: Orquesta el estado general del juego
  - Coordina tableros de jugador y enemigo
  - Implementa patrón Observer para notificar cambios
  - Métodos: `iniciarJuego()`, `disparar()`, `reiniciar()`

**Patrones aplicados:**
- Observer Pattern (para notificar cambios)

---

### **2. VIEW (Vista) - `View.js`**

**Responsabilidad:** Renderizar la interfaz y mostrar datos

**Clases principales:**

- **`FlyweightCeldaFactory`**: Patrón Flyweight
  - Crea y cachea estilos de celdas para optimizar memoria
  - Evita duplicar objetos de estilos idénticos

- **`VistaTablero`**: Renderiza un tablero en DOM
  - Crea celdas HTML dinámicamente
  - Actualiza estilos según estado
  - Métodos: `crear()`, `actualizar()`, `marcarSeleccion()`

- **`VistaControles`**: Gestiona elementos de control
  - Botones, selectores, información del juego
  - Métodos: `actualizarContador()`, `agregarAlHistorial()`

- **`VistaPrincipal`**: Coordina todas las vistas
  - Integra múltiples componentes de vista

**Patrones aplicados:**
- Flyweight Pattern

---

### **3. CONTROLLER (Controlador) - `Controller.js`**

**Responsabilidad:** Mediar entre Modelo y Vista

**Clases principales:**

- **`ControladorJuego`**: Maneja la interacción usuario-aplicación
  - Vincula eventos de la UI con métodos del modelo
  - Procesa clics en tableros
  - Actualiza la vista cuando cambia el modelo
  - Implementa Observer para recibir notificaciones del modelo

**Métodos principales:**
- `inicializarEventos()`: Configura listeners de DOM
- `manejarClickTableroJugador()`: Procesa colocación de barcos
- `realizarDisparo()`: Ejecuta disparo del jugador
- `actualizarVista()`: Sincroniza modelo con UI

---

### **4. MAIN (Punto de entrada) - `Main.js`**

**Responsabilidad:** Inicializar la aplicación

```javascript
// Crea instancias de M-V-C y las conecta
const modelo = new JuegoModelo();
const vista = new VistaPrincipal();
const controlador = new ControladorJuego(modelo, vista);
```

---

## 🔄 Flujo de Datos en MVC

```
Usuario Interactúa (Click)
        ↓
   CONTROLLER
        ↓
   MODEL (Actualiza estado)
        ↓
CONTROLLER (Recibe notificación vía Observer)
        ↓
   VIEW (Se actualiza)
        ↓
Usuario ve cambios
```

---

## ✨ Patrones de Diseño Combinados

### **1. MVC (Model-View-Controller)**
**Ubicación:** `Model.js`, `View.js`, `Controller.js`
- Separación de responsabilidades en tres capas
- Facilita mantenimiento y testing independiente
- Desacopla lógica de negocio de la interfaz

---

### **2. Memento Pattern**
**Ubicación:** `Memento/Memento.js` y `Memento/Caretaker.js`

**Propósito:** Capturar y restaurar estados anteriores del juego sin violar encapsulamiento

**Clases:**
- **`Memento`**: Almacena snapshots del estado completo del juego
- **`Caretaker`**: Gestiona historial de estados y permite deshacer

**Uso en el juego:**
- Deshacer colocación de piezas con **Ctrl+Z**
- Deshacer rondas completas de juego
- Retrocede al último estado marcado como "fin de ronda"

---

### **3. Object Pool Pattern**
**Ubicación:** `ObjectPool/PoolDisparos.js`

**Propósito:** Reutilizar objetos de disparo en lugar de crear/destruir constantemente

**Clase:**
- **`PoolDisparos`**: Gestiona pool de objetos reutilizables de disparos
  - `obtener()`: Toma un disparo disponible del pool
  - `liberar()`: Devuelve un disparo al pool para reutilización
  - `reducirCapacidad()`: Reduce capacidad máxima cuando enemigo golpea

**Ventajas:**
- Mejora rendimiento evitando garbage collection frecuente
- Reduce consumo de memoria
- Gestión eficiente de recursos limitados

---

### **4. Flyweight Pattern**
**Ubicación:** `Flyweight/FlyweightCeldaFactory.js`

**Propósito:** Compartir objetos para reducir drásticamente el uso de memoria en el renderizado

**Clase:**
- **`FlyweightCeldaFactory`**: Factory que crea y cachea objetos flyweight
  - Reutiliza objetos para aplicar estilos CSS a las celdas
  - Separa estado intrínseco (compartido) del extrínseco (único por celda)

**Impacto:**
- 300 celdas (3 tableros × 100) comparten los mismos objetos flyweight
- Reduce memoria de ~300 objetos a ~5 objetos flyweight
- Optimiza rendimiento del renderizado del DOM

---

### **5. Observer Pattern**
**Ubicación:** Implementado en `Model.js` y `Controller.js`

**Propósito:** Notificar cambios del modelo sin acoplamiento directo

**Implementación:**
- El modelo notifica eventos (disparo_realizado, juego_finalizado, etc.)
- El controlador se suscribe como observador
- Actualizaciones automáticas de la vista cuando cambia el modelo

**Ventajas:**
- Desacopla completamente Model de Controller
- Permite múltiples observadores del mismo modelo
- Facilita extensibilidad (agregar nuevos observadores)

---

## 🎮 Cómo Usar

1. Abre `program.HTML` en un navegador
2. **Coloca tus piezas:**
   - Selecciona tipo de pieza (Buque o Submarino)
   - Elige orientación
   - Pasa el mouse sobre el tablero para ver dónde se colocará
   - Haz clic para colocar la pieza
   - Usa **Ctrl+Z** para deshacer si te equivocas
3. Presiona "Iniciar Juego" cuando hayas colocado todas las piezas
4. **Dispara al enemigo:**
   - Haz clic en el tablero de disparos (centro)
   - Verás los resultados de tu disparo
   - El enemigo disparará automáticamente
5. Usa **Ctrl+Z** para deshacer rondas completas

---

## 🏗️ Ventajas del Patrón MVC

| Aspecto | Beneficio |
|--------|-----------|
| **Mantenimiento** | Código organizado y fácil de localizar |
| **Testing** | Cada capa se puede probar independientemente |
| **Reutilización** | La lógica (Model) se puede usar en diferentes UIs |
| **Escalabilidad** | Fácil agregar nuevas características |
| **Colaboración** | Diferentes desarrolladores pueden trabajar en paralelo |

---

## 📝 Notas Técnicas

- Usa JavaScript vanilla (sin frameworks)
- Grid 10x10 con 2 buques (2 celdas) y 1 submarino (3 celdas)
- Pool de disparos = celdas ocupadas por el jugador
- Interfaz responsiva con CSS Grid

---

**Autor:** Implementación educativa del patrón MVC
**Fecha:** Diciembre 2025
