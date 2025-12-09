# Hernandez Vazquez Cristian
# Juego Battleship

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
## 🔄 Flujo de Datos en MVC

```
Usuario Interactúa (Click)
        ↓
   CONTROLLER
        ↓
   MODEL (Actualiza estado)
        ↓
CONTROLLER (Recibe notificación)
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

### **2. Patrón Memento **
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

### **3. Patrón Object Pool **
**Ubicación:** `ObjectPool/PoolDisparos.js`

**Propósito:** Reutilizar objetos de disparo en lugar de crear/destruir constantemente

**Clase:**
- **`PoolDisparos`**: Gestiona pool de objetos reutilizables de disparos
  - `obtener()`: Toma un disparo disponible del pool
  - `liberar()`: Devuelve un disparo al pool para reutilización
  - `reducirCapacidad()`: Reduce capacidad máxima cuando enemigo golpea

---

### **4. Patrón Flyweight **
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

## Cómo Usar

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

