# CalcQuest 🧮

**Plataforma interactiva de aprendizaje de Cálculo Integral en español**

Una experiencia gamificada tipo Duolingo + Khan Academy para estudiantes de cálculo universitario y preparatoria.

---

## 🚀 Cómo publicar en GitHub Pages

1. Crea un nuevo repositorio en GitHub (ej. `calcquest`)
2. Sube todos los archivos de este proyecto al repositorio
3. Ve a **Settings → Pages → Source → Deploy from branch → main → / (root)**
4. Tu sitio estará en: `https://TU_USUARIO.github.io/calcquest/`

> **Nota:** Los archivos JSON se cargan mediante `fetch()`, por lo que el sitio debe servirse desde un servidor HTTP (GitHub Pages, Live Server en VS Code, etc.). No abre correctamente desde `file://`.

---

## 📁 Estructura del Proyecto

```
calcquest/
├── index.html                    # Aplicación principal (SPA)
├── README.md                     # Esta documentación
│
├── css/
│   └── styles.css                # Todos los estilos (dark/light mode)
│
├── js/
│   ├── progress.js               # Sistema de progreso y gamificación
│   └── app.js                    # Lógica principal de la aplicación
│
├── data/                         # Ejercicios en formato JSON
│   ├── antiderivatives.json      # Antiderivadas (regla de potencias)
│   ├── immediate_integrals.json  # Integrales inmediatas
│   ├── cambio_variable.json      # Cambio de variable
│   ├── substitution.json         # Sustitución
│   ├── integration_by_parts.json # Integración por partes
│   ├── metodo_tabular.json       # Método tabular (DI)
│   ├── inverse_trig.json         # Inversas trigonométricas
│   ├── definite_integrals.json   # Integrales definidas + aplicaciones
│   ├── partial_fractions.json    # Fracciones parciales (3 casos)
│   └── optimization.json         # Optimización + concavidad
│
└── knowledge/
    └── formulas.json             # Base de datos de fórmulas
```

---

## ➕ Cómo agregar ejercicios

Edita el archivo JSON correspondiente al tema. Cada ejercicio sigue este formato:

```json
{
  "id": "tema_001",
  "difficulty": 2,
  "topic": "nombre-del-tema",
  "questionLatex": "\\int x^2\\,dx",
  "answerLatex": "\\frac{x^3}{3}+C",
  "method": "regla-potencia",
  "hints": [
    "Pista 1",
    "Pista 2"
  ],
  "commonMistakes": [
    "Error frecuente"
  ],
  "steps": [
    "Paso 1",
    "Paso 2",
    "\\frac{x^3}{3}+C"
  ]
}
```

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

### Métodos disponibles

`regla-potencia`, `formula-inmediata`, `cambio-variable`, `sustitucion`, `integracion-por-partes`, `metodo-tabular`, `fracciones-parciales-caso1`, `fracciones-parciales-caso2`, `fracciones-parciales-caso3`, `formula-inversa-trig`, `teorema-fundamental`, `area-entre-curvas`, `optimizacion`, `concavidad`

---

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

---

## 🔧 Desarrollo Local

```bash
# Opción 1: Python
python -m http.server 8080

# Opción 2: Node.js
npx serve .

# Opción 3: VS Code
# Instala la extensión "Live Server" y haz clic en "Go Live"
```

Abre en el navegador: `http://localhost:8080`

---

*Hecho con ❤️ para estudiantes de Cálculo Integral*
