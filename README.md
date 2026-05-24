# CalcQuest 🧮

**Plataforma interactiva de aprendizaje de Cálculo Integral en español**

Una experiencia gamificada tipo Duolingo + Khan Academy para estudiantes de cálculo universitario y preparatoria.

---

### Campos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | Identificador único (ej. `anti_008`) |
| `difficulty` | 1–4 | 1=Fácil, 2=Medio, 3=Difícil, 4=Experto |
| `topic` | string | ID del tema (ver tabla abajo) |
| `questionLatex` | string | La integral en LaTeX |
| `answerLatex` | string | La respuesta en LaTeX |
| `method` | string | Técnica de solución (ver tabla abajo) |
| `hints` | array | Pistas progresivas (mínimo 2) |
| `commonMistakes` | array | Errores frecuentes |
| `steps` | array | Pasos de la solución en LaTeX |

### IDs de temas disponibles

| ID del topic | Descripción |
|---|---|
| `antiderivativas` | Antiderivadas / Regla de potencias |
| `integrales-inmediatas` | Integrales inmediatas |
| `cambio-variable` | Cambio de variable |
| `sustitucion` | Sustitución |
| `optimizacion` | Optimización |
| `concavidad` | Concavidad e inflexión |
| `inversas-trigonometricas` | Inversas trigonométricas |
| `integrales-definidas` | Integrales definidas |
| `integracion-por-partes` | Integración por partes |
| `metodo-tabular` | Método tabular |
| `fracciones-parciales-caso1` | Fracciones parciales – Caso 1 |
| `fracciones-parciales-caso2` | Fracciones parciales – Caso 2 |
| `fracciones-parciales-caso3` | Fracciones parciales – Caso 3 |
| `aplicaciones-integrales-definidas` | Aplicaciones (área, volumen) |


## 🎮 Funcionalidades

| Función | Descripción |
|---------|-------------|
| **Mapa de Temas** | Árbol visual con progreso por tema |
| **Modo Práctica** | Ejercicios interactivos con feedback inmediato |
| **Identificador de Técnica** | El estudiante elige la técnica ANTES de resolver |
| **Pistas Progresivas** | Hints revelados uno a uno |
| **Solución Paso a Paso** | Animada, con MathJax |
| **Batalla Jefe** | 5 preguntas, 3 vidas, 150 XP de recompensa |
| **Simulacro de Examen** | 10 preguntas, 30 min, sin pistas |
| **Flashcards** | Fórmulas con flip animation |
| **Formulario** | Referencia rápida de todas las fórmulas |
| **Sistema XP/Niveles** | 7 rangos, de Novato a Maestro Cálculo |
| **Logros** | 15 logros desbloqueables |
| **Racha Diaria** | Motivación de estudio continuo |
| **Modo Oscuro/Claro** | Toggle en la barra superior |
| **Persistencia** | Todo guardado en LocalStorage |

---

## 🛠 Tecnologías

- **HTML5** – SPA sin frameworks
- **CSS3** – Variables CSS, Grid, Flexbox, animaciones
- **JavaScript ES6+** – Módulos IIFE, async/await
- **MathJax 3** – Renderizado matemático completo
- **LocalStorage** – Persistencia de progreso sin backend
- **Google Fonts** – Playfair Display, Space Mono, DM Sans

---

## 📊 Sistema de Progreso

| Rango | XP necesario | Ícono |
|-------|-------------|-------|
| Novato | 0 | 🌱 |
| Aprendiz | 100 | 📚 |
| Estudiante | 300 | 🔍 |
| Analista | 600 | ⚡ |
| Integrador | 1000 | ∫ |
| Caballero Cálculo | 1800 | ⚔️ |
| Maestro Cálculo | 3000 | 👑 |

### XP por acción
- Ejercicio fácil correcto: **10 XP**
- Ejercicio medio: **20 XP**
- Ejercicio difícil: **35 XP**
- Ejercicio experto: **50 XP**
- Batalla Jefe ganada: **150 XP**
- Simulacro de examen: **score% × 0.5 XP**

*Hecho con ❤️ para estudiantes de Cálculo Integral*
