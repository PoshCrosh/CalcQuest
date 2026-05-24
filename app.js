/* =============================================
   CalcQuest – Main Application
   ============================================= */

// ── Data Store ──
const App = {
  exercises: {},    // topic -> array
  formulas:  {},    // category -> array
  currentView: null,
  currentExercise: null,
  quizState: null,
  flashState: null,
  examState: null,
  bossState: null,
};

// ── Topic Config ──
const TOPICS = [
  { id: 'antiderivativas',              name: 'Antiderivadas',                     icon: '∫', file: 'data/antiderivatives.json',       parcial: 1, desc: 'Regla de potencias y propiedades básicas' },
  { id: 'integrales-inmediatas',        name: 'Integrales Inmediatas',             icon: '⚡', file: 'data/immediate_integrals.json',    parcial: 1, desc: 'Fórmulas directas: exp, trig, ln' },
  { id: 'cambio-variable',              name: 'Cambio de Variable',                icon: '🔄', file: 'data/cambio_variable.json',        parcial: 1, desc: 'Integrales reducibles por cambio de variable' },
  { id: 'optimizacion',                 name: 'Optimización',                      icon: '📈', file: 'data/optimization.json',           parcial: 1, desc: 'Máximos y mínimos de funciones' },
  { id: 'concavidad',                   name: 'Concavidad',                        icon: '〰️', file: 'data/optimization.json',           parcial: 1, desc: 'Segunda derivada y puntos de inflexión' },
  { id: 'inversas-trigonometricas',     name: 'Inversas Trigonométricas',          icon: '📐', file: 'data/inverse_trig.json',           parcial: 2, desc: 'arcsin, arctan, arcsec' },
  { id: 'sustitucion',                  name: 'Sustitución',                       icon: '🔀', file: 'data/substitution.json',           parcial: 2, desc: 'Sustitución trigonométrica y algebraica' },
  { id: 'integrales-definidas',         name: 'Integrales Definidas',              icon: '📊', file: 'data/definite_integrals.json',     parcial: 2, desc: 'Teorema Fundamental del Cálculo' },
  { id: 'integracion-por-partes',       name: 'Integración por Partes',            icon: '✂️', file: 'data/integration_by_parts.json',   parcial: 2, desc: 'Fórmula ∫u dv = uv - ∫v du' },
  { id: 'metodo-tabular',              name: 'Método Tabular',                    icon: '📋', file: 'data/metodo_tabular.json',          parcial: 2, desc: 'Integración por partes repetida' },
  { id: 'fracciones-parciales-caso1',   name: 'Fracciones Parciales: Caso 1',      icon: '1️⃣', file: 'data/partial_fractions.json',      parcial: 2, desc: 'Factores lineales distintos' },
  { id: 'fracciones-parciales-caso2',   name: 'Fracciones Parciales: Caso 2',      icon: '2️⃣', file: 'data/partial_fractions.json',      parcial: 2, desc: 'Factores lineales repetidos' },
  { id: 'fracciones-parciales-caso3',   name: 'Fracciones Parciales: Caso 3',      icon: '3️⃣', file: 'data/partial_fractions.json',      parcial: 2, desc: 'Factores cuadráticos irreducibles' },
  { id: 'aplicaciones-integrales-definidas', name: 'Aplicaciones de Integrales',  icon: '🌊', file: 'data/definite_integrals.json',     parcial: 2, desc: 'Áreas, volúmenes y más' },
];

const TECHNIQUES = [
  { id: 'regla-potencia',           name: 'Regla de Potencias',          icon: '📐' },
  { id: 'formula-inmediata',        name: 'Integral Inmediata',          icon: '⚡' },
  { id: 'cambio-variable',          name: 'Cambio de Variable',          icon: '🔄' },
  { id: 'sustitucion',              name: 'Sustitución (u-sub)',         icon: '🔀' },
  { id: 'integracion-por-partes',   name: 'Integración por Partes',      icon: '✂️' },
  { id: 'metodo-tabular',          name: 'Método Tabular',              icon: '📋' },
  { id: 'fracciones-parciales',     name: 'Fracciones Parciales',        icon: '🧩' },
  { id: 'formula-inversa-trig',     name: 'Fórmula Inversa Trig.',       icon: '📐' },
  { id: 'teorema-fundamental',      name: 'Teorema Fundamental',         icon: '📊' },
  { id: 'area-entre-curvas',        name: 'Área entre Curvas',           icon: '🌊' },
  { id: 'optimizacion',             name: 'Optimización',                icon: '📈' },
  { id: 'concavidad',               name: 'Concavidad / Inflexión',      icon: '〰️' },
];

// ── Data Loading ──
async function loadAllData() {
  const topicFiles = [...new Set(TOPICS.map(t => t.file))];
  for (const file of topicFiles) {
    try {
      const res = await fetch(file);
      if (!res.ok) continue;
      const data = await res.json();
      // Index by topic
      for (const ex of data) {
        if (!App.exercises[ex.topic]) App.exercises[ex.topic] = [];
        // Avoid duplicates
        if (!App.exercises[ex.topic].find(e => e.id === ex.id)) {
          App.exercises[ex.topic].push(ex);
        }
      }
    } catch (e) {
      console.warn('Could not load', file, e);
    }
  }

  try {
    const res = await fetch('knowledge/formulas.json');
    if (res.ok) App.formulas = await res.json();
  } catch (e) {
    console.warn('Could not load formulas');
  }
}

function getExercisesForTopic(topicId, count = null, excludeRecent = false) {
  let pool = App.exercises[topicId] || [];
  if (excludeRecent) {
    const recent = Progress.get().recentExercises.slice(0, 5);
    pool = pool.filter(e => !recent.includes(e.id));
    if (!pool.length) pool = App.exercises[topicId] || [];
  }
  pool = [...pool].sort(() => Math.random() - 0.5);
  return count ? pool.slice(0, count) : pool;
}

function getAllExercises(count = 10) {
  const all = Object.values(App.exercises).flat();
  return [...all].sort(() => Math.random() - 0.5).slice(0, count);
}

// ── MathJax ──
function renderMath(container = document) {
  if (window.MathJax && MathJax.typesetPromise) {
    const nodes = container === document ? [document.body] : [container];
    MathJax.typesetPromise(nodes).catch(e => console.warn('MathJax error', e));
  }
}

// ── Toast Notifications ──
function showToast(msg, type = 'info', icon = '💡') {
  const tc = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span class="toast-icon">${icon}</span><span>${msg}</span>`;
  tc.appendChild(t);
  setTimeout(() => { t.classList.add('leaving'); setTimeout(() => t.remove(), 300); }, 3000);
}

function showXPGain(amount, x, y) {
  const el = document.createElement('div');
  el.className = 'xp-popup';
  el.textContent = `+${amount} XP`;
  el.style.left = `${x}px`;
  el.style.top  = `${y}px`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1600);
}

function showAchievement(ach) {
  showToast(`🏆 Logro desbloqueado: <strong>${ach.name}</strong> ${ach.emoji}`, 'xp', ach.emoji);
}

// ── Confetti ──
function launchConfetti(count = 60) {
  const colors = ['#6c63ff','#ff6584','#43d9ad','#ffd166','#ff9f43'];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText = `
      left: ${Math.random()*100}vw;
      top: -20px;
      background: ${colors[Math.floor(Math.random()*colors.length)]};
      width: ${6+Math.random()*8}px;
      height: ${6+Math.random()*8}px;
      animation-duration: ${1.5+Math.random()*2}s;
      animation-delay: ${Math.random()*0.5}s;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }
}

// ── Sidebar & Nav ──
function updateSidebarStats() {
  const s = Progress.get();
  const rank = Progress.getRank();
  const xpInfo = Progress.getXPToNext();

  document.getElementById('xp-bar-fill').style.width = `${xpInfo.pct}%`;
  document.getElementById('xp-current').textContent = `${xpInfo.current} / ${xpInfo.needed} XP`;
  document.getElementById('rank-icon').textContent = rank.icon;
  document.getElementById('rank-name').textContent = rank.name;
  document.getElementById('rank-level').textContent = `Nivel ${rank.level}`;
  document.getElementById('stat-streak').textContent = s.streak;
  document.getElementById('stat-correct').textContent = s.totalCorrect;
  document.getElementById('stat-xp-total').textContent = s.totalXP;
}

function setActiveNav(view) {
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.view === view);
  });
}

// ── Router ──
function navigate(view, params = {}) {
  App.currentView = view;
  setActiveNav(view);
  document.getElementById('page-content').innerHTML = '';

  const views = {
    'dashboard':      renderDashboard,
    'mapa':           renderTopicMap,
    'practica':       renderPractice,
    'flashcards':     renderFlashcards,
    'formulario':     renderFormulaBook,
    'logros':         renderAchievements,
    'examen':         renderExamSetup,
    'configuracion':  renderSettings,
    'topic':          () => renderTopicDetail(params.topic),
    'boss':           () => renderBossBattle(params.topic),
  };

  const fn = views[view];
  if (fn) fn();
  else renderDashboard();

  updateSidebarStats();
}

// ══════════════════════════════════════════════
//  VIEW: Dashboard
// ══════════════════════════════════════════════
function renderDashboard() {
  document.getElementById('topbar-title').textContent = 'Panel Principal';
  const s = Progress.get();
  const rank = Progress.getRank();
  const accuracy = s.totalAttempted ? Math.round((s.totalCorrect / s.totalAttempted) * 100) : 0;

  const masteryItems = TOPICS.slice(0, 6).map(t => {
    const pct = Progress.getMastery(t.id);
    const color = pct >= 80 ? 'green' : pct >= 50 ? 'gradient' : 'blue';
    return `
      <div class="mastery-item">
        <span class="mastery-name">${t.icon} ${t.name}</span>
        <div class="mastery-bar-wrap">
          <div class="progress-bar"><div class="progress-fill ${color}" style="width:${pct}%"></div></div>
        </div>
        <span class="mastery-pct">${pct}%</span>
      </div>`;
  }).join('');

  const recentTopics = TOPICS.filter(t => Progress.isTopicUnlocked(t.id)).slice(0, 4);
  const quickCards = recentTopics.map(t => `
    <div class="card card-sm" style="cursor:pointer" onclick="navigate('topic', {topic:'${t.id}'})">
      <div style="font-size:2rem;margin-bottom:8px">${t.icon}</div>
      <div style="font-weight:700;font-size:0.9rem;color:var(--text)">${t.name}</div>
      <div class="mt-2">
        <div class="progress-bar"><div class="progress-fill gradient" style="width:${Progress.getMastery(t.id)}%"></div></div>
      </div>
      <div class="text-xs text-muted mt-2">${Progress.getMastery(t.id)}% dominio</div>
    </div>`).join('');

  document.getElementById('page-content').innerHTML = `
    <div class="page">
      <div class="dashboard-hero">
        <div class="hero-greeting">// Bienvenido de vuelta 👋</div>
        <h1 class="hero-title"><span class="gradient-text">CalcQuest</span></h1>
        <p>Rango: <strong>${rank.icon} ${rank.name}</strong> &nbsp;·&nbsp; ${s.totalXP} XP &nbsp;·&nbsp; Racha de ${s.streak} día${s.streak !== 1 ? 's' : ''} 🔥</p>
        <div class="hero-actions">
          <button class="btn btn-primary btn-lg" onclick="navigate('practica')">🎮 Practicar Ahora</button>
          <button class="btn btn-secondary btn-lg" onclick="navigate('examen')">📝 Simulacro</button>
          <button class="btn btn-ghost btn-lg" onclick="navigate('mapa')">🗺️ Progreso</button>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-value">${s.totalCorrect}</div>
          <div class="stat-label">Correctas</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-value">${accuracy}%</div>
          <div class="stat-label">Precisión</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🔥</div>
          <div class="stat-value">${s.streak}</div>
          <div class="stat-label">Días Racha</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⚔️</div>
          <div class="stat-value">${s.bossesBeaten}</div>
          <div class="stat-label">Jefes</div>
        </div>
      </div>

      <!-- Quick Practice Widget -->
      <div id="dash-quick-ex" style="margin-bottom:28px"></div>

      <div class="grid-2" style="gap:24px">
        <div class="card">
          <h3 style="margin-bottom:16px">📊 Dominio por Tema</h3>
          ${masteryItems}
          <button class="btn btn-ghost btn-sm mt-4 w-full" onclick="navigate('mapa')">Ver todos los temas →</button>
        </div>
        <div class="card">
          <h3 style="margin-bottom:16px">⚡ Acceso Rápido</h3>
          <div class="grid-2">${quickCards}</div>
          <div class="mt-4" style="display:flex;gap:12px;flex-direction:column">
            <button class="btn btn-secondary w-full" onclick="navigate('flashcards')">🃏 Flashcards</button>
            <button class="btn btn-secondary w-full" onclick="navigate('formulario')">📚 Formulario</button>
            <button class="btn btn-gold w-full" onclick="startDailyChallenge()">⭐ Desafío Diario</button>
          </div>
        </div>
      </div>
    </div>
  `;
  renderMath(document.getElementById('page-content'));
  renderDashboardQuickEx();
}

// ══════════════════════════════════════════════
//  Dashboard Quick Exercise Widget
// ══════════════════════════════════════════════
function renderDashboardQuickEx() {
  const area = document.getElementById('dash-quick-ex');
  if (!area) return;

  // Pick a random exercise from unlocked topics
  const unlocked = TOPICS.filter(t => Progress.isTopicUnlocked(t.id));
  const pool = unlocked.flatMap(t => App.exercises[t.id] || []);
  if (!pool.length) return;

  const ex = pool[Math.floor(Math.random() * pool.length)];
  const topic = TOPICS.find(t => t.id === ex.topic);
  App.currentExercise = ex;

  const diffLabel = ['','Fácil','Medio','Difícil','Experto'][ex.difficulty] || 'Medio';
  const diffTag   = `tag-diff-${ex.difficulty}`;

  area.innerHTML = `
    <div class="quick-ex-card">
      <div class="quick-ex-label">⚡ Ejercicio Rápido — practica ahora mismo</div>
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
        <span style="font-size:1.6rem">${topic?.icon || '∫'}</span>
        <div>
          <div style="font-weight:700;font-size:1rem;color:var(--text)">${topic?.name || ex.topic}</div>
          <span class="tag ${diffTag}">${diffLabel}</span>
        </div>
        <button class="btn btn-ghost btn-sm" style="margin-left:auto" onclick="renderDashboardQuickEx()" title="Nuevo ejercicio">🔀 Otro</button>
      </div>

      <div class="exercise-question" id="dash-ex-q">\\[${ex.questionLatex}\\]</div>

      <div id="dash-ex-tech" style="margin-bottom:12px">
        <div style="font-size:0.82rem;color:var(--text3);margin-bottom:10px;font-family:var(--font-mono)">→ Identifica la técnica correcta:</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          ${TECHNIQUES.map(t => `
            <button class="btn btn-ghost btn-sm dash-tech-btn" data-tech="${t.id}"
              onclick="dashSelectTech(this,'${t.id}','${ex.method}','${ex.id}')">
              ${t.icon} ${t.name}
            </button>`).join('')}
        </div>
      </div>

      <div id="dash-ex-solve" class="hidden">
        <div class="answer-area">
          <input type="text" class="answer-input" id="dash-ex-input"
            placeholder="Escribe tu respuesta…" style="font-size:0.9rem" />
          <button class="btn btn-primary" onclick="dashCheckAnswer('${ex.id}','${ex.topic}')">✓ Verificar</button>
        </div>
        <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
          <button class="btn btn-ghost btn-sm" onclick="dashShowHint(0)" id="dash-hint-btn">💡 Pista</button>
          <button class="btn btn-ghost btn-sm" onclick="dashRevealAnswer('${ex.id}')">👁️ Respuesta</button>
        </div>
        <div id="dash-hint-area"></div>
      </div>
      <div id="dash-ex-feedback" class="mt-4"></div>
    </div>
  `;

  renderMath(area);
}

let dashHintIdx = 0;

function dashSelectTech(btn, techId, correctMethod, exId) {
  document.querySelectorAll('.dash-tech-btn').forEach(b => b.classList.remove('btn-primary'));

  const isCorrect = techId === correctMethod ||
    (correctMethod.includes('fracciones') && techId === 'fracciones-parciales') ||
    (correctMethod === 'cambio-variable' && techId === 'cambio-variable') ||
    (correctMethod === 'teorema-fundamental' && techId === 'teorema-fundamental') ||
    (correctMethod === 'area-entre-curvas' && techId === 'area-entre-curvas');

  if (isCorrect) {
    btn.classList.add('btn-primary');
    showToast('¡Técnica correcta! Ahora resuelve.', 'success', '✅');
    document.getElementById('dash-ex-tech').classList.add('hidden');
    document.getElementById('dash-ex-solve').classList.remove('hidden');
    dashHintIdx = 0;
  } else {
    btn.style.borderColor = 'var(--error)';
    btn.style.color = 'var(--error)';
    setTimeout(() => {
      btn.style.borderColor = '';
      btn.style.color = '';
    }, 1200);
    showToast('Técnica incorrecta. Intenta otra.', 'error', '❌');
  }
}

function dashCheckAnswer(exId, topicId) {
  const ex = App.currentExercise;
  if (!ex) return;
  const val = (document.getElementById('dash-ex-input')?.value || '').trim();
  if (!val) return;

  const correct = normalizeAnswer(val) === normalizeAnswer(ex.answerLatex) ||
    normalizeAnswer(ex.answerLatex).includes(normalizeAnswer(val));

  const fb = document.getElementById('dash-ex-feedback');
  const input = document.getElementById('dash-ex-input');

  if (correct) {
    input?.classList.add('correct');
    fb.innerHTML = `<div class="feedback-correct"><span>🎉</span><div><strong>¡Correcto!</strong><br><span style="font-size:0.82rem">Respuesta: \\(${ex.answerLatex}\\)</span></div></div>`;
    const xp = [0,10,20,35,50][ex.difficulty] || 10;
    const newAchs = Progress.recordExercise(exId, topicId, true, ex.difficulty);
    updateSidebarStats();
    newAchs.forEach(a => showAchievement(a));
    showToast(`+${xp} XP ganados 🌟`, 'xp', '⭐');
    // Load new exercise after delay
    setTimeout(() => renderDashboardQuickEx(), 2500);
  } else {
    input?.classList.add('incorrect');
    fb.innerHTML = `<div class="feedback-incorrect"><span>❌</span><strong>Incorrecto. ¡Inténtalo de nuevo!</strong></div>`;
    Progress.recordExercise(exId, topicId, false, ex.difficulty);
    updateSidebarStats();
    setTimeout(() => {
      input?.classList.remove('incorrect');
      fb.innerHTML = '';
    }, 1800);
  }
  renderMath(fb);
}

function dashShowHint(idx) {
  const ex = App.currentExercise;
  if (!ex?.hints?.length) return;
  const hint = ex.hints[dashHintIdx];
  if (!hint) return;
  dashHintIdx++;

  const area = document.getElementById('dash-hint-area');
  const box = document.createElement('div');
  box.className = 'hint-box mt-2';
  box.innerHTML = `<div class="hint-title">Pista ${dashHintIdx}</div><div>${hint}</div>`;
  area?.appendChild(box);

  const btn = document.getElementById('dash-hint-btn');
  if (btn && dashHintIdx >= ex.hints.length) { btn.disabled = true; btn.textContent = '💡 Sin más pistas'; }

  renderMath(area);
}

function dashRevealAnswer(exId) {
  const ex = App.currentExercise;
  if (!ex) return;
  const fb = document.getElementById('dash-ex-feedback');
  fb.innerHTML = `
    <div class="card" style="margin-top:12px;padding:16px">
      <div style="font-size:0.8rem;color:var(--text3);font-family:var(--font-mono);margin-bottom:8px">RESPUESTA</div>
      <div class="math-display">\\[${ex.answerLatex}\\]</div>
      <button class="btn btn-ghost btn-sm mt-4" onclick="renderDashboardQuickEx()">🔀 Siguiente ejercicio</button>
    </div>`;
  renderMath(fb);
  Progress.recordExercise(exId, ex.topic, false, ex.difficulty);
  updateSidebarStats();
}

// ══════════════════════════════════════════════
//  VIEW: Topic Map
// ══════════════════════════════════════════════
function renderTopicMap() {
  document.getElementById('topbar-title').textContent = 'Mapa de Temas';

  const p1Topics = TOPICS.filter(t => t.parcial === 1);
  const p2Topics = TOPICS.filter(t => t.parcial === 2);

  function renderNode(t) {
    const unlocked = Progress.isTopicUnlocked(t.id);
    const mastery  = Progress.getMastery(t.id);
    const mastered = mastery >= 90;
    const inProg   = mastery > 0 && !mastered;

    const statusClass = !unlocked ? 'locked' : mastered ? 'mastered' : inProg ? 'in-progress' : '';
    const iconClass   = !unlocked ? 'locked' : mastered ? 'mastered' : 'unlocked';
    const lockIcon    = !unlocked ? '🔒' : t.icon;

    return `
      <div class="topic-node ${statusClass}" onclick="${unlocked ? `navigate('topic',{topic:'${t.id}'})` : "showToast('Completa los temas anteriores primero 🔒','error','🔒')"}">
        <div class="topic-icon ${iconClass}">${lockIcon}</div>
        <div class="topic-info">
          <div class="topic-name">${t.name}</div>
          <div class="topic-desc">${t.desc}</div>
        </div>
        <div class="topic-progress-wrap">
          <div style="flex:1">
            <div class="progress-bar"><div class="progress-fill ${mastered?'green':'gradient'}" style="width:${mastery}%"></div></div>
          </div>
          <span class="topic-pct">${mastery}%</span>
        </div>
        ${mastered ? '<span class="tag tag-success">✓ Dominado</span>' : ''}
        ${!unlocked ? '<span class="tag tag-error">🔒</span>' : ''}
      </div>`;
  }

  document.getElementById('page-content').innerHTML = `
    <div class="page">
      <h2 style="margin-bottom:8px">🗺️ Mapa de Progreso</h2>
      <p class="mb-6">Completa cada tema para desbloquear los siguientes. ¡Vence al Jefe Final de cada tema para avanzar!</p>
      <div class="topic-map">
        <div class="map-section-title">📘 Parcial 1</div>
        ${p1Topics.map((t, i) => renderNode(t) + (i < p1Topics.length - 1 ? '<div class="topic-connector"></div>' : '')).join('')}
        <div class="map-section-title" style="margin-top:32px">📗 Parcial 2</div>
        ${p2Topics.map((t, i) => renderNode(t) + (i < p2Topics.length - 1 ? '<div class="topic-connector"></div>' : '')).join('')}
      </div>
    </div>
  `;
}

// ══════════════════════════════════════════════
//  VIEW: Topic Detail
// ══════════════════════════════════════════════
function renderTopicDetail(topicId) {
  const topic = TOPICS.find(t => t.id === topicId);
  if (!topic) { navigate('mapa'); return; }

  document.getElementById('topbar-title').textContent = topic.name;
  const mastery = Progress.getMastery(topicId);
  const exercises = getExercisesForTopic(topicId);

  // Related formulas
  const relFormulas = [];
  if (App.formulas) {
    Object.values(App.formulas).forEach(cat => {
      if (Array.isArray(cat)) {
        cat.forEach(f => { if (f.temasRelacionados?.includes(topicId)) relFormulas.push(f); });
      }
    });
  }

  document.getElementById('page-content').innerHTML = `
    <div class="page">
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px">
        <button class="btn btn-ghost btn-sm" onclick="navigate('mapa')">← Volver</button>
        <div style="font-size:2.5rem">${topic.icon}</div>
        <div>
          <h2 style="margin:0">${topic.name}</h2>
          <p style="margin:0">${topic.desc}</p>
        </div>
        <div style="margin-left:auto;text-align:right">
          <div class="stat-value" style="font-size:1.5rem;color:var(--primary)">${mastery}%</div>
          <div class="text-xs text-muted">dominio</div>
        </div>
      </div>

      <div class="tab-bar" id="topic-tabs">
        <button class="tab-btn active" onclick="switchTopicTab('teoria',this)">📖 Teoría</button>
        <button class="tab-btn" onclick="switchTopicTab('practica',this)">🎮 Practicar</button>
        <button class="tab-btn" onclick="switchTopicTab('formulas',this)">📐 Fórmulas</button>
        <button class="tab-btn" onclick="switchTopicTab('boss',this)">⚔️ Batalla Jefe</button>
      </div>

      <div id="topic-tab-content">
        <!-- teoria loaded by default -->
      </div>
    </div>
  `;

  loadTopicTab('teoria', topicId, exercises, relFormulas);
}

function switchTopicTab(tab, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const topicId = TOPICS.find(t => document.getElementById('topbar-title').textContent === t.name)?.id
    || App.currentTopicId;
  const exercises = getExercisesForTopic(topicId);
  const relFormulas = [];
  if (App.formulas) {
    Object.values(App.formulas).forEach(cat => {
      if (Array.isArray(cat)) cat.forEach(f => { if (f.temasRelacionados?.includes(topicId)) relFormulas.push(f); });
    });
  }
  loadTopicTab(tab, topicId, exercises, relFormulas);
}

function loadTopicTab(tab, topicId, exercises, formulas) {
  const c = document.getElementById('topic-tab-content');
  App.currentTopicId = topicId;

  if (tab === 'teoria') {
    const theoryMap = {
      'antiderivativas': `
        <h3>¿Qué es una antiderivada?</h3>
        <p>Una antiderivada (o integral indefinida) de \\(f(x)\\) es una función \\(F(x)\\) tal que \\(F'(x) = f(x)\\).</p>
        <div class="math-display">\\[\\int f(x)\\,dx = F(x) + C\\]</div>
        <h4 class="mt-4">Regla de Potencias</h4>
        <div class="math-display">\\[\\int x^n\\,dx = \\frac{x^{n+1}}{n+1}+C, \\quad n \\neq -1\\]</div>
        <p><strong>Ejemplo:</strong></p>
        <div class="math-display">\\[\\int x^3\\,dx = \\frac{x^4}{4}+C\\]</div>`,
      'sustitucion': `
        <h3>Sustitución (Cambio de Variable)</h3>
        <p>Técnica para integrar funciones compuestas. Si identificas una función interna \\(u = g(x)\\), el método consiste en:</p>
        <ol style="margin:12px 0 12px 24px;color:var(--text2)">
          <li>Elegir \\(u = g(x)\\)</li>
          <li>Calcular \\(du = g'(x)\\,dx\\)</li>
          <li>Reescribir la integral completamente en términos de \\(u\\)</li>
          <li>Integrar en \\(u\\)</li>
          <li>Sustituir de vuelta a \\(x\\)</li>
        </ol>
        <div class="math-display">\\[\\int f(g(x))\\,g'(x)\\,dx = \\int f(u)\\,du\\]</div>`,
      'integracion-por-partes': `
        <h3>Integración por Partes</h3>
        <p>Derivada del producto en reversa. Se usa cuando la integración directa no es posible.</p>
        <div class="math-display">\\[\\int u\\,dv = uv - \\int v\\,du\\]</div>
        <h4 class="mt-4">Criterio LIATE para elegir u:</h4>
        <ul style="margin:8px 0 8px 24px;color:var(--text2)">
          <li><strong>L</strong>ogarítmica: \\(\\ln x\\)</li>
          <li><strong>I</strong>nversa trigonométrica: \\(\\arctan x\\)</li>
          <li><strong>A</strong>lgebraica: \\(x^n\\)</li>
          <li><strong>T</strong>rigonométrica: \\(\\sin x, \\cos x\\)</li>
          <li><strong>E</strong>xponencial: \\(e^x\\)</li>
        </ul>`,
      'integrales-inmediatas': `
        <h3>Integrales Inmediatas</h3>
        <p>Son integrales que se resuelven directamente aplicando una fórmula conocida, sin manipulación adicional.</p>
        <h4 class="mt-4">Fórmulas esenciales:</h4>
        <div class="math-display">\\[\\int e^x\\,dx = e^x+C\\]</div>
        <div class="math-display">\\[\\int \\sin x\\,dx = -\\cos x+C\\]</div>
        <div class="math-display">\\[\\int \\cos x\\,dx = \\sin x+C\\]</div>
        <div class="math-display">\\[\\int \\frac{1}{x}\\,dx = \\ln|x|+C\\]</div>
        <div class="math-display">\\[\\int \\sec^2 x\\,dx = \\tan x+C\\]</div>`,
      'cambio-variable': `
        <h3>Cambio de Variable</h3>
        <p>Técnica para simplificar integrales identificando una función interna.</p>
        <ol style="margin:12px 0 12px 24px;color:var(--text2)">
          <li>Elige \\(u = g(x)\\) (función interna)</li>
          <li>Calcula \\(du = g'(x)\\,dx\\)</li>
          <li>Reescribe la integral en términos de \\(u\\)</li>
          <li>Integra</li>
          <li>Sustituye de vuelta a \\(x\\)</li>
        </ol>
        <div class="math-display">\\[\\int f(g(x))\\,g'(x)\\,dx = \\int f(u)\\,du\\]</div>`,
      'optimizacion': `
        <h3>Optimización</h3>
        <p>Proceso de encontrar el valor máximo o mínimo de una función.</p>
        <ol style="margin:12px 0 12px 24px;color:var(--text2)">
          <li>Construye la función objetivo \\(f(x)\\)</li>
          <li>Deriva e iguala a cero: \\(f'(x)=0\\)</li>
          <li>Clasifica: si \\(f''(x_0)>0\\) → mínimo; \\(f''(x_0)<0\\) → máximo</li>
        </ol>
        <div class="math-display">\\[f'(x_0)=0 \\text{ y } f''(x_0)<0 \\Rightarrow \\text{máximo local}\\]</div>`,
      'concavidad': `
        <h3>Concavidad y Puntos de Inflexión</h3>
        <p>La segunda derivada determina si la función es cóncava hacia arriba o hacia abajo.</p>
        <div class="math-display">\\[f''(x)>0 \\Rightarrow \\text{cóncava arriba (sonriente \\smile)}\\]</div>
        <div class="math-display">\\[f''(x)<0 \\Rightarrow \\text{cóncava abajo (triste \\frown)}\\]</div>
        <h4 class="mt-4">Punto de inflexión:</h4>
        <p>Punto donde \\(f''(x)=0\\) <strong>y cambia de signo</strong>. No todo cero de \\(f''\\) es punto de inflexión.</p>`,
      'inversas-trigonometricas': `
        <h3>Integrales con Inversas Trigonométricas</h3>
        <p>Cuando el integrando tiene la forma adecuada, se aplican estas fórmulas directamente:</p>
        <div class="math-display">\\[\\int \\frac{du}{\\sqrt{a^2-u^2}} = \\arcsin\\frac{u}{a}+C\\]</div>
        <div class="math-display">\\[\\int \\frac{du}{a^2+u^2} = \\frac{1}{a}\\arctan\\frac{u}{a}+C\\]</div>
        <div class="math-display">\\[\\int \\frac{du}{u\\sqrt{u^2-a^2}} = \\frac{1}{a}\\operatorname{arcsec}\\frac{|u|}{a}+C\\]</div>
        <p class="mt-2">La clave es identificar \\(a\\) y \\(u\\) correctamente en el integrando.</p>`,
      'integrales-definidas': `
        <h3>Integrales Definidas</h3>
        <p>Calculan el área neta bajo una curva entre dos límites \\(a\\) y \\(b\\).</p>
        <div class="math-display">\\[\\int_a^b f(x)\\,dx = F(b)-F(a), \\quad F'(x)=f(x)\\]</div>
        <h4 class="mt-4">Propiedades:</h4>
        <div class="math-display">\\[\\int_a^b [f+g]\\,dx = \\int_a^b f\\,dx + \\int_a^b g\\,dx\\]</div>
        <div class="math-display">\\[\\int_a^b cf\\,dx = c\\int_a^b f\\,dx\\]</div>
        <div class="math-display">\\[\\int_a^a f\\,dx = 0, \\quad \\int_a^b f\\,dx = -\\int_b^a f\\,dx\\]</div>`,
      'metodo-tabular': `
        <h3>Método Tabular (DI-Method)</h3>
        <p>Versión eficiente de la integración por partes cuando se necesitan múltiples aplicaciones.</p>
        <p class="mt-2"><strong>Procedimiento:</strong></p>
        <ul style="margin:8px 0 8px 24px;color:var(--text2)">
          <li>Columna <strong>D</strong>: deriva repetidamente hasta llegar a 0</li>
          <li>Columna <strong>I</strong>: antideriva repetidamente en cada fila</li>
          <li>Signos alternan: \\(+, -, +, -, \\ldots\\)</li>
          <li>Multiplica diagonalmente y suma</li>
        </ul>
        <div class="math-display">\\[\\int x^2 e^x\\,dx = x^2 e^x - 2xe^x + 2e^x+C\\]</div>`,
      'fracciones-parciales-caso1': `
        <h3>Fracciones Parciales – Caso 1</h3>
        <p><strong>Factores lineales distintos:</strong> el denominador se factoriza en \\((a_1x+b_1)(a_2x+b_2)\\cdots\\)</p>
        <div class="math-display">\\[\\frac{P(x)}{(x-a)(x-b)} = \\frac{A}{x-a} + \\frac{B}{x-b}\\]</div>
        <p class="mt-2">Multiplica por el denominador y sustituye valores convenientes de \\(x\\) para resolver \\(A, B, \\ldots\\)</p>`,
      'fracciones-parciales-caso2': `
        <h3>Fracciones Parciales – Caso 2</h3>
        <p><strong>Factores lineales repetidos:</strong> si \\((x-a)^n\\) aparece, incluye un término por cada potencia.</p>
        <div class="math-display">\\[\\frac{P(x)}{(x-a)^2(x-b)} = \\frac{A}{x-a} + \\frac{B}{(x-a)^2} + \\frac{C}{x-b}\\]</div>
        <p class="mt-2">El factor \\(\\frac{B}{(x-a)^2}\\) se integra como \\(B\\int(x-a)^{-2}\\,dx = -\\frac{B}{x-a}+C\\).</p>`,
      'fracciones-parciales-caso3': `
        <h3>Fracciones Parciales – Caso 3</h3>
        <p><strong>Factor cuadrático irreducible:</strong> \\(ax^2+bx+c\\) con \\(\\Delta = b^2-4ac < 0\\)</p>
        <div class="math-display">\\[\\frac{P(x)}{(x-a)(x^2+px+q)} = \\frac{A}{x-a} + \\frac{Bx+C}{x^2+px+q}\\]</div>
        <p class="mt-2">Para integrar la fracción cuadrática, completa el cuadrado y aplica la fórmula del arctan.</p>`,
      'aplicaciones-integrales-definidas': `
        <h3>Aplicaciones de Integrales Definidas</h3>
        <h4>Área entre curvas:</h4>
        <div class="math-display">\\[A = \\int_a^b [f(x)-g(x)]\\,dx \\quad (f \\geq g \\text{ en } [a,b])\\]</div>
        <h4 class="mt-4">Volumen – Método de discos:</h4>
        <div class="math-display">\\[V = \\pi\\int_a^b [f(x)]^2\\,dx\\]</div>
        <h4 class="mt-4">Estrategia:</h4>
        <ol style="margin:8px 0 8px 24px;color:var(--text2)">
          <li>Encuentra los límites (raíces o intersecciones)</li>
          <li>Determina cuál función es mayor</li>
          <li>Integra</li>
        </ol>`,
      'default': `<h3>Teoría del tema</h3>
        <p>Estudia las fórmulas relacionadas y practica los ejercicios para dominar este tema.</p>`
    };
    c.innerHTML = `
      <div class="card">
        ${theoryMap[topicId] || theoryMap['default']}
        <div class="mt-4">
          <button class="btn btn-primary" onclick="switchTopicTab('practica', document.querySelectorAll('.tab-btn')[1])">
            ▶ Empezar a Practicar
          </button>
        </div>
      </div>`;
  }

  else if (tab === 'practica') {
    if (!exercises.length) {
      c.innerHTML = '<div class="card text-center"><p>No hay ejercicios disponibles para este tema aún.</p></div>';
    } else {
      c.innerHTML = '<div id="exercise-area"></div>';
      loadNextExercise(exercises, 0, topicId);
    }
  }

  else if (tab === 'formulas') {
    if (!formulas.length) {
      c.innerHTML = '<div class="card text-center"><p>Fórmulas próximamente.</p></div>';
    } else {
      c.innerHTML = `<div class="formula-grid">
        ${formulas.map(f => `
          <div class="formula-card">
            <div class="formula-header">
              <span>📐</span>
              <span class="formula-name">${f.nombre}</span>
            </div>
            <div class="formula-body">
              <div class="math-display">\\[${f.formulaLatex}\\]</div>
              <div class="formula-desc">${f.descripcion}</div>
              <div class="formula-example"><strong>Ejemplo:</strong><br>\\(${f.ejemplo}\\)</div>
            </div>
          </div>`).join('')}
      </div>`;
    }
  }

  else if (tab === 'boss') {
    c.innerHTML = `
      <div class="card text-center">
        <div style="font-size:4rem;margin-bottom:16px">⚔️</div>
        <h3>Batalla Jefe: ${TOPICS.find(t=>t.id===topicId)?.name}</h3>
        <p class="mt-2">Demuestra que dominas el tema. Responde <strong>5 preguntas</strong> con errores limitados.</p>
        <ul style="text-align:left;margin:16px auto;max-width:300px;color:var(--text2)">
          <li>⏱️ Sin tiempo límite</li>
          <li>❤️ 3 vidas</li>
          <li>🏆 Desbloquea el siguiente tema</li>
          <li>⭐ 150 XP de recompensa</li>
        </ul>
        <button class="btn btn-primary btn-lg" onclick="navigate('boss',{topic:'${topicId}'})">⚔️ ¡Iniciar Batalla!</button>
      </div>`;
  }

  renderMath(c);
}

// ══════════════════════════════════════════════
//  Exercise Engine
// ══════════════════════════════════════════════
function loadNextExercise(exercises, index, topicId) {
  const area = document.getElementById('exercise-area');
  if (!area) return;
  if (index >= exercises.length) {
    area.innerHTML = `
      <div class="card text-center">
        <div style="font-size:3rem;margin-bottom:16px">🎉</div>
        <h3>¡Completaste todos los ejercicios!</h3>
        <p class="mt-2">Tu dominio del tema ha mejorado. ¡Sigue practicando!</p>
        <div class="mt-4" style="display:flex;gap:12px;justify-content:center">
          <button class="btn btn-primary" onclick="loadNextExercise([...${JSON.stringify(exercises)}], 0, '${topicId}')">🔄 Repetir</button>
          <button class="btn btn-gold" onclick="navigate('boss',{topic:'${topicId}'})">⚔️ Batalla Jefe</button>
        </div>
      </div>`;
    return;
  }

  const ex = exercises[index];
  App.currentExercise = ex;

  const diffLabel = ['','Fácil','Medio','Difícil','Experto'][ex.difficulty] || 'Medio';
  const diffTag   = `tag-diff-${ex.difficulty}`;

  const techOptions = TECHNIQUES.map(t => `
    <div class="technique-card" data-tech="${t.id}" onclick="selectTechnique(this,'${t.id}','${ex.method}')">
      <div class="technique-icon">${t.icon}</div>
      <div class="technique-name">${t.name}</div>
    </div>`).join('');

  area.innerHTML = `
    <div class="exercise-card">
      <div class="exercise-header">
        <span class="tag ${diffTag}">${diffLabel}</span>
        <span class="tag tag-primary">${ex.topic}</span>
        <span style="margin-left:auto;font-size:0.8rem;color:var(--text3);font-family:var(--font-mono)">${index+1} / ${exercises.length}</span>
      </div>
      <div class="exercise-body">
        <h4 style="margin-bottom:12px">Identifica la técnica:</h4>
        <div class="exercise-question">\\[${ex.questionLatex}\\]</div>

        <div id="tech-phase">
          <p class="text-sm text-muted mb-4">¿Cuál es el método correcto para resolver esta integral?</p>
          <div class="technique-grid">${techOptions}</div>
        </div>

        <div id="solve-phase" class="hidden">
          <h4 style="margin-bottom:8px">Resuelve la integral:</h4>
          <div class="answer-area">
            <input type="text" class="answer-input" id="answer-input" placeholder="Escribe tu respuesta en LaTeX o texto..." />
            <button class="btn btn-primary" onclick="checkAnswer('${ex.id}','${topicId}',${index},${JSON.stringify(exercises).replace(/'/g,"\\'")})" >✓ Verificar</button>
          </div>
          <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
            <button class="btn btn-ghost btn-sm" onclick="showHint(0)" id="hint-btn">💡 Pista 1</button>
            <button class="btn btn-ghost btn-sm" onclick="showSolution('${ex.id}','${topicId}',${index},${JSON.stringify(exercises).replace(/'/g,"\\'")})" >👁️ Ver Solución</button>
          </div>
          <div id="hint-area"></div>
          <div id="feedback-area" class="mt-4"></div>
        </div>
      </div>
    </div>
  `;

  renderMath(area);
}

let currentHintIndex = 0;

function selectTechnique(el, techId, correctMethod) {
  document.querySelectorAll('.technique-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');

  setTimeout(() => {
    const isCorrect = techId === correctMethod ||
      (correctMethod === 'formula-inmediata' && techId === 'formula-inmediata') ||
      (correctMethod === 'sustitucion' && techId === 'sustitucion') ||
      (correctMethod === 'cambio-variable' && techId === 'sustitucion') ||
      (correctMethod === 'cambio-variable' && techId === 'cambio-variable') ||
      (correctMethod === 'teorema-fundamental' && techId === 'teorema-fundamental') ||
      (correctMethod === 'area-entre-curvas' && techId === 'area-entre-curvas') ||
      (correctMethod === 'metodo-tabular' && techId === 'metodo-tabular') ||
      (correctMethod.includes('fracciones') && techId === 'fracciones-parciales') ||
      (correctMethod.includes('fracciones-parciales') && techId.includes('fracciones'));

    if (isCorrect) {
      el.classList.add('correct');
      showToast('¡Técnica correcta! Ahora resuelve la integral.', 'success', '✅');
      document.getElementById('tech-phase').classList.add('hidden');
      document.getElementById('solve-phase').classList.remove('hidden');
      currentHintIndex = 0;
    } else {
      el.classList.add('incorrect');
      const reason = getTechniqueExplanation(techId, App.currentExercise?.method || correctMethod);
      showToast(`Técnica incorrecta. ${reason}`, 'error', '❌');
      setTimeout(() => {
        el.classList.remove('incorrect', 'selected');
      }, 1500);
    }
    renderMath(document.getElementById('exercise-area'));
  }, 200);
}

function getTechniqueExplanation(chosen, correct) {
  const explanations = {
    'sustitucion': 'La sustitución se usa cuando hay una función compuesta con su derivada.',
    'integracion-por-partes': 'Por partes se usa cuando hay un producto de funciones de tipos diferentes.',
    'fracciones-parciales': 'Fracciones parciales se usa para integrales de funciones racionales.',
    'formula-inmediata': 'Las fórmulas inmediatas son para integrales directas: exp, trig, ln.',
    'regla-potencia': 'La regla de potencias aplica a x^n donde n ≠ -1.',
    'formula-inversa-trig': 'Las fórmulas inversas trig se usan cuando el denominador es √(a²-u²) o a²+u².',
  };
  return explanations[correct] || 'Revisa las características de la integral.';
}

function showHint(idx) {
  const ex = App.currentExercise;
  if (!ex?.hints?.length) return;

  const hints = ex.hints;
  if (currentHintIndex >= hints.length) {
    showToast('No hay más pistas disponibles.', 'info', '💡');
    return;
  }

  const hintArea = document.getElementById('hint-area');
  const hint = hints[currentHintIndex];
  currentHintIndex++;

  const box = document.createElement('div');
  box.className = 'hint-box mt-2';
  box.innerHTML = `<div class="hint-title">Pista ${currentHintIndex}</div><div>\\(${hint.includes('\\') ? hint : hint}\\)</div>`;
  hintArea.appendChild(box);

  const btn = document.getElementById('hint-btn');
  if (btn && currentHintIndex < hints.length) {
    btn.textContent = `💡 Pista ${currentHintIndex + 1}`;
  } else if (btn) {
    btn.textContent = '💡 Sin más pistas';
    btn.disabled = true;
  }

  renderMath(hintArea);
}

function checkAnswer(exId, topicId, index, exercises) {
  const input = document.getElementById('answer-input');
  const val   = (input?.value || '').trim();
  if (!val) { showToast('Escribe tu respuesta primero.', 'error', '⚠️'); return; }

  const ex = App.currentExercise || exercises.find(e => e.id === exId);
  if (!ex) return;

  // Smart answer check
  const correct = normalizeAnswer(val) === normalizeAnswer(ex.answerLatex) ||
    val.toLowerCase().includes(normalizeAnswer(ex.answerLatex).toLowerCase()) ||
    normalizeAnswer(ex.answerLatex).includes(normalizeAnswer(val));

  const feedback = document.getElementById('feedback-area');

  if (correct) {
    input.classList.add('correct');
    feedback.innerHTML = `
      <div class="feedback-correct">
        <span>🎉</span>
        <div>
          <strong>¡Correcto!</strong><br>
          <span style="font-size:0.85rem">Respuesta: \\(${ex.answerLatex}\\)</span>
        </div>
      </div>`;

    const newAchs = Progress.recordExercise(exId, topicId, true, ex.difficulty);
    updateSidebarStats();
    newAchs.forEach(a => showAchievement(a));

    // XP popup
    const xp = [0,10,20,35,50][ex.difficulty] || 10;
    showToast(`+${xp} XP ganados 🌟`, 'xp', '⭐');

    setTimeout(() => {
      loadNextExercise(exercises, index + 1, topicId);
    }, 2000);
  } else {
    input.classList.add('incorrect');
    feedback.innerHTML = `
      <div class="feedback-incorrect">
        <span>❌</span>
        <div>
          <strong>Incorrecto.</strong><br>
          <span style="font-size:0.85rem">Revisa tu respuesta e inténtalo de nuevo.</span>
        </div>
      </div>`;
    Progress.recordExercise(exId, topicId, false, ex.difficulty);
    updateSidebarStats();
    setTimeout(() => {
      input.classList.remove('incorrect');
      feedback.innerHTML = '';
    }, 2000);
  }
  renderMath(feedback);
}

function showSolution(exId, topicId, index, exercises) {
  const ex = App.currentExercise || exercises.find(e => e.id === exId);
  if (!ex) return;

  const steps = (ex.steps || []).map((s, i) => `
    <div class="step-item" id="step-${i}">
      <div class="step-num">${i+1}</div>
      <div class="step-content">\\[${s}\\]</div>
    </div>`).join('');

  const feedback = document.getElementById('feedback-area');
  feedback.innerHTML = `
    <div class="card" style="margin-top:16px">
      <h4 style="margin-bottom:12px">📖 Solución Paso a Paso</h4>
      <div class="step-list">${steps}</div>
      <div class="mt-4">
        <button class="btn btn-secondary btn-sm" onclick="loadNextExercise(${JSON.stringify(exercises).replace(/'/g,"\\'")} , ${index+1}, '${topicId}')">→ Siguiente ejercicio</button>
      </div>
    </div>`;

  // Animate steps
  setTimeout(() => {
    document.querySelectorAll('.step-item').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 200);
    });
  }, 100);

  renderMath(feedback);
  Progress.recordExercise(exId, topicId, false, ex.difficulty);
}

function normalizeAnswer(ans) {
  return (ans || '').replace(/\s+/g,'').replace(/\+C$/,'').replace(/\\,/g,'').toLowerCase();
}

// ══════════════════════════════════════════════
//  VIEW: Practice Mode
// ══════════════════════════════════════════════
function renderPractice() {
  document.getElementById('topbar-title').textContent = 'Modo Práctica';

  const unlockedTopics = TOPICS.filter(t => Progress.isTopicUnlocked(t.id));

  const topicBtns = unlockedTopics.map(t => `
    <button class="btn btn-secondary" onclick="startTopicPractice('${t.id}')" style="justify-content:flex-start;gap:10px">
      <span style="font-size:1.3rem">${t.icon}</span>
      <span>${t.name}</span>
      <span class="mastery-pct" style="margin-left:auto">${Progress.getMastery(t.id)}%</span>
    </button>`).join('');

  document.getElementById('page-content').innerHTML = `
    <div class="page">
      <h2 style="margin-bottom:8px">🎮 Modo Práctica</h2>
      <p class="mb-6">Elige un tema para practicar o inicia una sesión mixta.</p>

      <div class="grid-2" style="gap:24px">
        <div class="card">
          <h3 style="margin-bottom:16px">Práctica por Tema</h3>
          <div style="display:flex;flex-direction:column;gap:8px">${topicBtns}</div>
        </div>
        <div class="card">
          <h3 style="margin-bottom:16px">Modos Especiales</h3>
          <div style="display:flex;flex-direction:column;gap:12px">
            <div class="card card-sm" style="cursor:pointer" onclick="startMixedPractice()">
              <div style="font-size:1.5rem;margin-bottom:8px">🎲</div>
              <div style="font-weight:700">Práctica Mixta</div>
              <p class="text-sm text-muted">Ejercicios de todos los temas mezclados al azar.</p>
            </div>
            <div class="card card-sm" style="cursor:pointer" onclick="startWeaknessPractice()">
              <div style="font-size:1.5rem;margin-bottom:8px">🎯</div>
              <div style="font-weight:700">Practicar Debilidades</div>
              <p class="text-sm text-muted">Ejercicios de los temas con menor dominio.</p>
            </div>
            <div class="card card-sm" style="cursor:pointer" onclick="navigate('examen')">
              <div style="font-size:1.5rem;margin-bottom:8px">📝</div>
              <div style="font-weight:700">Simulacro de Examen</div>
              <p class="text-sm text-muted">Examen cronometrado con todos los temas.</p>
            </div>
          </div>
        </div>
      </div>
      <div id="practice-area" class="mt-6"></div>
    </div>
  `;
}

function startTopicPractice(topicId) {
  const exercises = getExercisesForTopic(topicId, null, true);
  if (!exercises.length) { showToast('No hay ejercicios disponibles para este tema.','error','❌'); return; }
  navigate('topic', { topic: topicId });
  setTimeout(() => {
    switchTopicTab('practica', document.querySelectorAll('.tab-btn')[1]);
  }, 100);
}

function startMixedPractice() {
  const exercises = getAllExercises(10);
  const area = document.getElementById('practice-area') || document.getElementById('page-content');
  area.innerHTML = '<div id="exercise-area"></div>';
  loadNextExercise(exercises, 0, 'mixto');
  renderMath(area);
}

function startWeaknessPractice() {
  const weakTopics = TOPICS.filter(t => Progress.isTopicUnlocked(t.id))
    .sort((a,b) => Progress.getMastery(a.id) - Progress.getMastery(b.id))
    .slice(0, 3).map(t => t.id);

  const exercises = weakTopics.flatMap(id => getExercisesForTopic(id, 3)).sort(() => Math.random() - 0.5);
  if (!exercises.length) { showToast('No hay ejercicios disponibles.','error','❌'); return; }

  const area = document.getElementById('practice-area') || document.getElementById('page-content');
  area.innerHTML = '<div id="exercise-area"></div>';
  loadNextExercise(exercises, 0, 'debilidades');
  renderMath(area);
}

function startDailyChallenge() {
  const s = Progress.get();
  const today = new Date().toDateString();
  if (s.dailyChallengeDate === today && s.dailyChallengeCompleted) {
    showToast('¡Ya completaste el desafío de hoy! Vuelve mañana 🌟','xp','⭐');
    return;
  }
  const exercises = getAllExercises(5);
  navigate('practica');
  setTimeout(() => {
    const area = document.getElementById('practice-area');
    if (area) {
      area.innerHTML = `
        <div class="card" style="border-color:var(--gold);background:rgba(255,209,102,0.05)">
          <h3 style="color:var(--gold)">⭐ Desafío Diario</h3>
          <p class="text-sm text-muted mb-4">Completa estos 5 ejercicios para ganar bonus XP</p>
          <div id="exercise-area"></div>
        </div>`;
      loadNextExercise(exercises, 0, 'daily');
      renderMath(area);
    }
  }, 200);
}

// ══════════════════════════════════════════════
//  VIEW: Boss Battle
// ══════════════════════════════════════════════
function renderBossBattle(topicId) {
  const topic = TOPICS.find(t => t.id === topicId);
  if (!topic) { navigate('mapa'); return; }

  document.getElementById('topbar-title').textContent = `⚔️ Batalla Jefe: ${topic.name}`;

  const exercises = getExercisesForTopic(topicId, 5);
  if (exercises.length < 3) {
    showToast('No hay suficientes ejercicios para la batalla jefe.','error','❌');
    navigate('topic', { topic: topicId });
    return;
  }

  App.bossState = { exercises, current: 0, lives: 3, score: 0, topicId };

  document.getElementById('page-content').innerHTML = `
    <div class="page">
      <div class="boss-battle-header">
        <div class="boss-title">⚔️ BATALLA JEFE</div>
        <h2 style="margin-bottom:4px">${topic.name}</h2>
        <p class="text-muted">Demuestra tu dominio total del tema</p>
        <div style="display:flex;justify-content:center;gap:24px;margin-top:16px">
          <div><span id="boss-lives">❤️❤️❤️</span></div>
          <div class="font-mono" style="color:var(--gold)">Pregunta <span id="boss-q-num">1</span>/5</div>
          <div class="font-mono" style="color:var(--accent2)">Puntaje: <span id="boss-score">0</span></div>
        </div>
      </div>
      <div id="boss-exercise-area"></div>
    </div>
  `;

  loadBossQuestion();
}

function loadBossQuestion() {
  const bs = App.bossState;
  if (!bs) return;

  if (bs.current >= bs.exercises.length || bs.lives <= 0) {
    endBossBattle();
    return;
  }

  document.getElementById('boss-q-num').textContent = bs.current + 1;
  document.getElementById('boss-lives').textContent = '❤️'.repeat(bs.lives) + '🖤'.repeat(3 - bs.lives);
  document.getElementById('boss-score').textContent = bs.score;

  const ex = bs.exercises[bs.current];
  App.currentExercise = ex;

  const area = document.getElementById('boss-exercise-area');
  area.innerHTML = `
    <div class="exercise-card">
      <div class="exercise-body">
        <div class="exercise-question">\\[${ex.questionLatex}\\]</div>
        <div class="answer-area">
          <input type="text" class="answer-input" id="boss-answer" placeholder="Tu respuesta..." />
          <button class="btn btn-primary" onclick="checkBossAnswer()">✓ Responder</button>
        </div>
        <div id="boss-feedback" class="mt-4"></div>
      </div>
    </div>
  `;
  renderMath(area);
}

function checkBossAnswer() {
  const bs = App.bossState;
  const ex = bs.exercises[bs.current];
  const val = (document.getElementById('boss-answer')?.value || '').trim();
  if (!val) return;

  const correct = normalizeAnswer(val) === normalizeAnswer(ex.answerLatex) ||
    normalizeAnswer(ex.answerLatex).includes(normalizeAnswer(val));

  const fb = document.getElementById('boss-feedback');

  if (correct) {
    bs.score++;
    fb.innerHTML = `<div class="feedback-correct"><span>🎉</span><strong>¡Correcto! +1 punto</strong></div>`;
    setTimeout(() => {
      bs.current++;
      loadBossQuestion();
    }, 1200);
  } else {
    bs.lives--;
    fb.innerHTML = `<div class="feedback-incorrect"><span>❌</span><div><strong>Incorrecto.</strong> Respuesta: \\(${ex.answerLatex}\\)</div></div>`;
    document.getElementById('boss-lives').textContent = '❤️'.repeat(bs.lives) + '🖤'.repeat(3 - bs.lives);

    if (bs.lives <= 0) {
      setTimeout(() => endBossBattle(), 1500);
    } else {
      setTimeout(() => {
        bs.current++;
        loadBossQuestion();
      }, 2000);
    }
  }
  renderMath(fb);
}

function endBossBattle() {
  const bs = App.bossState;
  const won = bs.score >= 3 && bs.lives > 0;

  if (won) {
    launchConfetti();
    const newAchs = Progress.recordBoss(bs.topicId, true);
    updateSidebarStats();
    newAchs.forEach(a => showAchievement(a));
  }

  document.getElementById('page-content').innerHTML = `
    <div class="page text-center">
      <div style="font-size:5rem;margin-bottom:16px">${won ? '🏆' : '💀'}</div>
      <h2>${won ? '¡Victoria!' : 'Derrotado'}</h2>
      <p class="mt-2">${won ? `Obtuviste ${bs.score}/5 puntos. ¡Tema dominado!` : `Solo ${bs.score}/5 puntos. ¡Sigue practicando!`}</p>
      ${won ? '<p class="mt-2" style="color:var(--gold)">+150 XP · Siguiente tema desbloqueado</p>' : ''}
      <div class="hero-actions" style="justify-content:center;margin-top:24px">
        ${won ? '' : `<button class="btn btn-secondary" onclick="renderBossBattle('${bs.topicId}')">🔄 Intentar de Nuevo</button>`}
        <button class="btn btn-primary" onclick="navigate('mapa')">🗺️ Ver Mapa</button>
        <button class="btn btn-ghost" onclick="navigate('dashboard')">🏠 Inicio</button>
      </div>
    </div>
  `;
  renderMath(document.getElementById('page-content'));
}

// ══════════════════════════════════════════════
//  VIEW: Exam Simulator
// ══════════════════════════════════════════════
function renderExamSetup() {
  document.getElementById('topbar-title').textContent = 'Simulacro de Examen';
  document.getElementById('page-content').innerHTML = `
    <div class="page text-center">
      <div class="exam-header">
        <div style="font-size:3rem;margin-bottom:16px">📝</div>
        <h2>Simulacro de Examen</h2>
        <p class="mt-2">Condiciones reales de examen: sin pistas, tiempo límite, temas mixtos.</p>
      </div>

      <div class="grid-3 mb-6" style="max-width:700px;margin:0 auto 24px">
        <div class="card text-center">
          <div style="font-size:2rem">10</div>
          <div class="text-sm text-muted">Preguntas</div>
        </div>
        <div class="card text-center">
          <div style="font-size:2rem">30:00</div>
          <div class="text-sm text-muted">Tiempo límite</div>
        </div>
        <div class="card text-center">
          <div style="font-size:2rem">Todos</div>
          <div class="text-sm text-muted">Temas</div>
        </div>
      </div>

      <button class="btn btn-primary btn-lg" onclick="startExam()">📝 Iniciar Simulacro</button>
      <button class="btn btn-ghost btn-lg" onclick="navigate('dashboard')" style="margin-left:12px">Cancelar</button>
    </div>
  `;
}

function startExam() {
  const exercises = getAllExercises(10);
  App.examState = {
    exercises,
    answers: new Array(exercises.length).fill(null),
    current: 0,
    startTime: Date.now(),
    timeLimit: 30 * 60 * 1000,
    finished: false,
  };

  renderExamQuestion();
  startExamTimer();
}

function startExamTimer() {
  if (App.examTimer) clearInterval(App.examTimer);
  App.examTimer = setInterval(() => {
    if (!App.examState || App.examState.finished) { clearInterval(App.examTimer); return; }
    const elapsed = Date.now() - App.examState.startTime;
    const remaining = App.examState.timeLimit - elapsed;

    if (remaining <= 0) {
      clearInterval(App.examTimer);
      finishExam();
      return;
    }

    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    const timerEl = document.getElementById('exam-timer');
    if (timerEl) {
      timerEl.textContent = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
      if (remaining < 5 * 60000) timerEl.classList.add('urgent');
    }
  }, 1000);
}

function renderExamQuestion() {
  const es = App.examState;
  const ex = es.exercises[es.current];
  document.getElementById('topbar-title').textContent = `Examen – Pregunta ${es.current + 1} / ${es.exercises.length}`;

  const dots = es.exercises.map((_, i) => {
    let cls = '';
    if (i === es.current) cls = 'current';
    else if (es.answers[i] !== null) cls = 'correct';
    return `<div class="dot ${cls}"></div>`;
  }).join('');

  document.getElementById('page-content').innerHTML = `
    <div class="page">
      <div class="exam-header">
        <div id="exam-timer" class="exam-timer">30:00</div>
        <div class="exam-progress-dots">${dots}</div>
        <p class="text-sm text-muted mt-2">Pregunta ${es.current+1} de ${es.exercises.length}</p>
      </div>

      <div class="exercise-card">
        <div class="exercise-body">
          <div class="exercise-question">\\[${ex.questionLatex}\\]</div>
          <div class="answer-area">
            <input type="text" class="answer-input" id="exam-answer" placeholder="Tu respuesta..."
              value="${es.answers[es.current] || ''}" />
          </div>
          <div style="display:flex;gap:12px;margin-top:20px;flex-wrap:wrap">
            ${es.current > 0 ? `<button class="btn btn-ghost" onclick="examNav(-1)">← Anterior</button>` : ''}
            ${es.current < es.exercises.length - 1
              ? `<button class="btn btn-primary" onclick="examNav(1)">Siguiente →</button>`
              : `<button class="btn btn-gold btn-lg" onclick="finishExam()">✓ Entregar Examen</button>`}
          </div>
        </div>
      </div>
    </div>
  `;
  renderMath(document.getElementById('page-content'));
}

function examNav(dir) {
  const es = App.examState;
  const val = (document.getElementById('exam-answer')?.value || '').trim();
  es.answers[es.current] = val;
  es.current = Math.max(0, Math.min(es.exercises.length - 1, es.current + dir));
  renderExamQuestion();
}

function finishExam() {
  const es = App.examState;
  es.finished = true;
  clearInterval(App.examTimer);

  // Save last answer
  const val = (document.getElementById('exam-answer')?.value || '').trim();
  if (val) es.answers[es.current] = val;

  let score = 0;
  const results = es.exercises.map((ex, i) => {
    const ans = es.answers[i] || '';
    const correct = ans && (normalizeAnswer(ans) === normalizeAnswer(ex.answerLatex) ||
      normalizeAnswer(ex.answerLatex).includes(normalizeAnswer(ans)));
    if (correct) score++;
    return { ex, answer: ans, correct };
  });

  const pct = Math.round((score / es.exercises.length) * 100);
  const newAchs = Progress.recordExam(score, es.exercises.length);
  updateSidebarStats();
  newAchs.forEach(a => showAchievement(a));

  if (pct >= 80) launchConfetti();

  const elapsed = Date.now() - es.startTime;
  const mins = Math.floor(elapsed / 60000);
  const secs = Math.floor((elapsed % 60000) / 1000);

  const resultRows = results.map((r, i) => `
    <div class="mastery-item">
      <span class="tag ${r.correct ? 'tag-success' : 'tag-error'}">${r.correct ? '✓' : '✗'}</span>
      <span class="mastery-name" style="font-size:0.85rem">P${i+1}: \\(${r.ex.questionLatex.substring(0,40)}...\\)</span>
      <span class="text-xs text-muted">${r.answer || '(sin respuesta)'}</span>
    </div>`).join('');

  document.getElementById('page-content').innerHTML = `
    <div class="page text-center">
      <div class="exam-header">
        <div style="font-size:4rem;margin-bottom:8px">${pct >= 80 ? '🌟' : pct >= 60 ? '📊' : '📉'}</div>
        <h2>Resultado del Examen</h2>
        <div class="exam-timer" style="font-size:4rem;color:${pct>=80?'var(--success)':pct>=60?'var(--gold)':'var(--error)'}">${pct}%</div>
        <p>${score} / ${es.exercises.length} correctas · ${mins}:${String(secs).padStart(2,'0')} min</p>
      </div>

      <div class="grid-3 mb-6">
        <div class="stat-card"><div class="stat-value" style="color:var(--success)">${score}</div><div class="stat-label">Correctas</div></div>
        <div class="stat-card"><div class="stat-value" style="color:var(--error)">${es.exercises.length - score}</div><div class="stat-label">Incorrectas</div></div>
        <div class="stat-card"><div class="stat-value" style="color:var(--gold)">${Math.round(score * 5)}</div><div class="stat-label">XP Ganados</div></div>
      </div>

      <div class="card" style="text-align:left;margin-bottom:24px">
        <h3 style="margin-bottom:16px">Detalle de Respuestas</h3>
        ${resultRows}
      </div>

      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
        <button class="btn btn-primary btn-lg" onclick="renderExamSetup()">🔄 Nuevo Examen</button>
        <button class="btn btn-ghost btn-lg" onclick="navigate('dashboard')">🏠 Inicio</button>
      </div>
    </div>
  `;
  renderMath(document.getElementById('page-content'));
}

// ══════════════════════════════════════════════
//  VIEW: Flashcards
// ══════════════════════════════════════════════
function renderFlashcards() {
  document.getElementById('topbar-title').textContent = 'Flashcards';

  const cards = buildFlashcards();
  App.flashState = { cards, index: 0, flipped: false, reviewed: new Set() };

  renderFlashcardView();
}

function buildFlashcards() {
  const cards = [];
  if (!App.formulas) return cards;
  Object.values(App.formulas).forEach(cat => {
    if (!Array.isArray(cat)) return;
    cat.forEach(f => {
      cards.push({
        front: f.nombre,
        back: f.formulaLatex,
        desc: f.descripcion,
        example: f.ejemplo,
      });
    });
  });
  return cards.sort(() => Math.random() - 0.5);
}

function renderFlashcardView() {
  const fs = App.flashState;
  if (!fs || !fs.cards.length) {
    document.getElementById('page-content').innerHTML = '<div class="page"><div class="card text-center"><p>No hay flashcards disponibles.</p></div></div>';
    return;
  }

  const card = fs.cards[fs.index];
  const pct = Math.round((fs.reviewed.size / fs.cards.length) * 100);

  document.getElementById('page-content').innerHTML = `
    <div class="page text-center">
      <h2 style="margin-bottom:8px">🃏 Flashcards</h2>
      <p class="text-muted mb-6">Haz clic en la tarjeta para voltearla · ${fs.reviewed.size}/${fs.cards.length} revisadas</p>
      <div style="max-width:500px;margin:0 auto 24px">
        <div class="progress-bar"><div class="progress-fill gradient" style="width:${pct}%"></div></div>
      </div>

      <div class="flashcard-container" onclick="flipCard()">
        <div class="flashcard ${fs.flipped ? 'flipped' : ''}" id="flashcard">
          <div class="flashcard-face flashcard-front">
            <div class="flashcard-label">Fórmula</div>
            <div class="flashcard-content" style="font-weight:700;font-size:1.3rem">${card.front}</div>
            <div style="color:var(--text3);font-size:0.8rem;margin-top:16px">Haz clic para ver la fórmula</div>
          </div>
          <div class="flashcard-face flashcard-back">
            <div class="flashcard-label">Resultado</div>
            <div class="flashcard-content">\\[${card.back}\\]</div>
            <div style="color:var(--text3);font-size:0.78rem;margin-top:12px">${card.desc}</div>
          </div>
        </div>
      </div>

      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
        <button class="btn btn-secondary" onclick="flashNav(-1)">← Anterior</button>
        <button class="btn btn-success" onclick="markKnown()">✓ La sé</button>
        <button class="btn btn-error" style="background:var(--error);color:white" onclick="markUnknown()">✗ Repasar</button>
        <button class="btn btn-secondary" onclick="flashNav(1)">Siguiente →</button>
      </div>

      <div style="margin-top:16px;color:var(--text3);font-family:var(--font-mono);font-size:0.8rem">
        ${fs.index + 1} / ${fs.cards.length}
      </div>
    </div>
  `;
  renderMath(document.getElementById('page-content'));
}

function flipCard() {
  App.flashState.flipped = !App.flashState.flipped;
  const el = document.getElementById('flashcard');
  if (el) el.classList.toggle('flipped', App.flashState.flipped);
}

function flashNav(dir) {
  const fs = App.flashState;
  fs.index = (fs.index + dir + fs.cards.length) % fs.cards.length;
  fs.flipped = false;
  Progress.recordFlashcard();
  updateSidebarStats();
  renderFlashcardView();
}

function markKnown() {
  App.flashState.reviewed.add(App.flashState.index);
  showToast('¡Marcada como aprendida! 🎉', 'success', '✅');
  flashNav(1);
}

function markUnknown() {
  showToast('Marcada para repasar 📌', 'info', '📌');
  flashNav(1);
}

// ══════════════════════════════════════════════
//  VIEW: Formula Book
// ══════════════════════════════════════════════
function renderFormulaBook() {
  document.getElementById('topbar-title').textContent = 'Formulario';

  const categories = {
    'antiderivadas':        { label: 'Antiderivadas', icon: '∫' },
    'integralesInmediatas': { label: 'Integrales Inmediatas', icon: '⚡' },
    'inversionTrigonometrica': { label: 'Inversas Trigonométricas', icon: '📐' },
    'integracionPorPartes': { label: 'Integración por Partes', icon: '✂️' },
    'concavidad':           { label: 'Concavidad', icon: '〰️' },
    'optimizacion':         { label: 'Optimización', icon: '📈' },
    'fraccionesParciales':  { label: 'Fracciones Parciales', icon: '🧩' },
    'integralesDefinidas':  { label: 'Integrales Definidas', icon: '📊' },
  };

  let html = '';
  for (const [key, meta] of Object.entries(categories)) {
    const data = App.formulas?.[key];
    if (!data?.length) continue;

    const cards = data.map(f => `
      <div class="formula-card">
        <div class="formula-header">
          <span>${meta.icon}</span>
          <span class="formula-name">${f.nombre}</span>
        </div>
        <div class="formula-body">
          <div class="math-display">\\[${f.formulaLatex}\\]</div>
          <div class="formula-desc">${f.descripcion}</div>
          <div class="formula-example">
            <strong>Ejemplo:</strong><br>\\(${f.ejemplo}\\)
          </div>
        </div>
      </div>`).join('');

    html += `
      <div style="margin-bottom:32px">
        <h3 style="margin-bottom:16px">${meta.icon} ${meta.label}</h3>
        <div class="formula-grid">${cards}</div>
      </div>`;
  }

  document.getElementById('page-content').innerHTML = `
    <div class="page">
      <h2 style="margin-bottom:8px">📚 Formulario Completo</h2>
      <p class="mb-6">Todas las fórmulas que necesitas para el examen.</p>
      ${html || '<div class="card text-center"><p>Cargando fórmulas...</p></div>'}
    </div>
  `;
  renderMath(document.getElementById('page-content'));
}

// ══════════════════════════════════════════════
//  VIEW: Achievements
// ══════════════════════════════════════════════
function renderAchievements() {
  document.getElementById('topbar-title').textContent = 'Logros';
  const achs = Progress.getAchievements();
  const earned = achs.filter(a => a.earned).length;

  const cards = achs.map(a => `
    <div class="achievement-card ${a.earned ? 'earned' : 'locked'}">
      <span class="achievement-emoji">${a.emoji}</span>
      <div class="achievement-name">${a.name}</div>
      <div class="achievement-desc">${a.desc}</div>
      ${a.earned ? '<div class="tag tag-success" style="margin-top:8px;display:inline-flex">✓ Obtenido</div>' : ''}
    </div>`).join('');

  document.getElementById('page-content').innerHTML = `
    <div class="page">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px">
        <div>
          <h2 style="margin-bottom:4px">🏆 Logros</h2>
          <p>${earned} / ${achs.length} obtenidos</p>
        </div>
        <div class="stat-card" style="text-align:center;padding:16px 24px">
          <div class="stat-value">${Math.round(earned/achs.length*100)}%</div>
          <div class="stat-label">Completado</div>
        </div>
      </div>
      <div style="margin-bottom:20px">
        <div class="progress-bar" style="height:12px">
          <div class="progress-fill gradient" style="width:${Math.round(earned/achs.length*100)}%"></div>
        </div>
      </div>
      <div class="achievement-grid">${cards}</div>
    </div>
  `;
}

// ══════════════════════════════════════════════
//  VIEW: Settings
// ══════════════════════════════════════════════
function renderSettings() {
  document.getElementById('topbar-title').textContent = 'Configuración';
  const s = Progress.get();

  document.getElementById('page-content').innerHTML = `
    <div class="page">
      <h2 style="margin-bottom:24px">⚙️ Configuración</h2>
      <div class="card" style="max-width:600px">
        <h3 style="margin-bottom:20px">Apariencia</h3>
        <div class="mastery-item">
          <span class="mastery-name">Modo Oscuro</span>
          <button class="btn btn-secondary btn-sm" onclick="toggleTheme()">
            ${s.theme === 'dark' ? '☀️ Cambiar a Claro' : '🌙 Cambiar a Oscuro'}
          </button>
        </div>
      </div>

      <div class="card" style="max-width:600px;margin-top:20px">
        <h3 style="margin-bottom:20px">Progreso</h3>
        <div class="mastery-item">
          <span class="mastery-name">XP Total</span>
          <span class="font-mono">${s.totalXP} XP</span>
        </div>
        <div class="mastery-item">
          <span class="mastery-name">Ejercicios completados</span>
          <span class="font-mono">${s.completedExercises.length}</span>
        </div>
        <div class="mastery-item">
          <span class="mastery-name">Racha actual</span>
          <span class="font-mono">${s.streak} días 🔥</span>
        </div>
        <div class="mastery-item">
          <span class="mastery-name">Reiniciar progreso</span>
          <button class="btn btn-danger btn-sm" onclick="confirmReset()">⚠️ Reiniciar Todo</button>
        </div>
      </div>

      <div class="card" style="max-width:600px;margin-top:20px">
        <h3 style="margin-bottom:12px">Acerca de CalcQuest</h3>
        <p class="text-sm text-muted">Plataforma de aprendizaje de Cálculo Integral interactiva y gamificada.</p>
        <p class="text-sm text-muted mt-2">Versión 1.0 · Hecho con ❤️ para estudiantes de Cálculo</p>
      </div>
    </div>
  `;
}

function toggleTheme() {
  const s = Progress.get();
  s.theme = s.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', s.theme);
  Progress.save();
  renderSettings();
  showToast(`Tema cambiado a ${s.theme === 'dark' ? 'oscuro 🌙' : 'claro ☀️'}`, 'success', '🎨');
}

function confirmReset() {
  if (confirm('¿Seguro que quieres reiniciar TODO tu progreso? Esta acción no se puede deshacer.')) {
    Progress.reset();
    showToast('Progreso reiniciado.', 'info', '🔄');
    updateSidebarStats();
    navigate('dashboard');
  }
}

// ══════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════
async function init() {
  // Load progress
  const s = Progress.load();

  // Apply theme
  document.documentElement.setAttribute('data-theme', s.theme || 'dark');

  // Wire nav items
  document.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', () => {
      const view  = el.dataset.view;
      const topic = el.dataset.topic;
      if (topic) navigate(view, { topic });
      else navigate(view);
      // Mobile: close sidebar
      document.getElementById('sidebar').classList.remove('open');
    });
  });

  // Mobile menu toggle
  document.getElementById('menu-toggle')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });

  // Load data
  await loadAllData();

  // Hide loading screen
  const loading = document.getElementById('loading-screen');
  if (loading) {
    loading.style.opacity = '0';
    loading.style.transition = 'opacity 400ms';
    setTimeout(() => loading.remove(), 400);
  }

  // Navigate to dashboard
  navigate('dashboard');
  updateSidebarStats();
}

// Start when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
