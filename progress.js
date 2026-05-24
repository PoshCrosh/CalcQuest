/* =============================================
   CalcQuest – Progress & Gamification System
   ============================================= */

const Progress = (() => {
  const STORAGE_KEY = 'calcquest_data';

  const RANKS = [
    { name: 'Novato',           minXP: 0,    icon: '🌱', level: 1 },
    { name: 'Aprendiz',         minXP: 100,  icon: '📚', level: 2 },
    { name: 'Estudiante',       minXP: 300,  icon: '🔍', level: 3 },
    { name: 'Analista',         minXP: 600,  icon: '⚡', level: 4 },
    { name: 'Integrador',       minXP: 1000, icon: '∫',  level: 5 },
    { name: 'Caballero Cálculo',minXP: 1800, icon: '⚔️', level: 6 },
    { name: 'Maestro Cálculo',  minXP: 3000, icon: '👑', level: 7 },
  ];

  const ACHIEVEMENTS = [
    { id: 'first_correct',   name: 'Primera Sangre',       desc: 'Resuelve tu primer ejercicio',    emoji: '🎯', condition: s => s.totalCorrect >= 1 },
    { id: 'ten_correct',     name: 'Decena',                desc: 'Resuelve 10 ejercicios correctos',emoji: '🔟', condition: s => s.totalCorrect >= 10 },
    { id: 'fifty_correct',   name: 'Cincuentón',            desc: '50 ejercicios correctos',         emoji: '💪', condition: s => s.totalCorrect >= 50 },
    { id: 'streak_3',        name: 'En Racha',              desc: '3 días seguidos estudiando',      emoji: '🔥', condition: s => s.streak >= 3 },
    { id: 'streak_7',        name: 'Semana Completa',       desc: '7 días seguidos',                 emoji: '📅', condition: s => s.streak >= 7 },
    { id: 'first_boss',      name: 'Cazador de Jefes',      desc: 'Completa tu primera Batalla Jefe',emoji: '⚔️', condition: s => s.bossesBeaten >= 1 },
    { id: 'three_bosses',    name: 'Exterminador',          desc: 'Vence 3 Batallas Jefe',           emoji: '🏆', condition: s => s.bossesBeaten >= 3 },
    { id: 'first_exam',      name: 'Examinado',             desc: 'Completa tu primer Simulacro',    emoji: '📝', condition: s => s.examsCompleted >= 1 },
    { id: 'exam_80',         name: 'Sobresaliente',         desc: 'Obtén 80%+ en un simulacro',      emoji: '🌟', condition: s => s.bestExamScore >= 80 },
    { id: 'exam_100',        name: 'Perfección',            desc: 'Obtén 100% en un simulacro',      emoji: '💎', condition: s => s.bestExamScore >= 100 },
    { id: 'master_anti',     name: 'Rey Antiderivadas',     desc: 'Domina Antiderivadas al 100%',    emoji: '🟢', condition: s => (s.mastery['antiderivativas'] || 0) >= 100 },
    { id: 'master_sub',      name: 'Mago Sustitución',      desc: 'Domina Sustitución al 100%',      emoji: '🔮', condition: s => (s.mastery['sustitucion'] || 0) >= 100 },
    { id: 'all_flashcards',  name: 'Memorista',             desc: 'Revisa todas las flashcards',     emoji: '🃏', condition: s => s.flashcardsReviewed >= 20 },
    { id: 'xp_500',          name: 'Acumulador',            desc: 'Acumula 500 XP',                  emoji: '⚡', condition: s => s.totalXP >= 500 },
    { id: 'xp_1000',         name: 'Millonario XP',         desc: 'Acumula 1000 XP',                 emoji: '💰', condition: s => s.totalXP >= 1000 },
  ];

  const DEFAULT_STATE = {
    totalXP: 0,
    currentLevelXP: 0,
    streak: 0,
    lastStudyDate: null,
    totalCorrect: 0,
    totalAttempted: 0,
    bossesBeaten: 0,
    examsCompleted: 0,
    bestExamScore: 0,
    flashcardsReviewed: 0,
    completedExercises: [],
    recentExercises: [],
    mastery: {},
    unlockedTopics: ['antiderivativas','integrales-inmediatas','optimizacion','concavidad'],
    earnedAchievements: [],
    examHistory: [],
    theme: 'dark',
    dailyChallengeCompleted: false,
    dailyChallengeDate: null,
  };

  let state = null;

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      state = raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : { ...DEFAULT_STATE };
    } catch (e) {
      state = { ...DEFAULT_STATE };
    }
    updateStreak();
    return state;
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function reset() {
    state = { ...DEFAULT_STATE };
    save();
  }

  function get() { return state; }

  function updateStreak() {
    const today = new Date().toDateString();
    const last  = state.lastStudyDate;
    if (!last) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (last !== today && last !== yesterday.toDateString()) {
      state.streak = 0;
      save();
    }
  }

  function markStudied() {
    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (state.lastStudyDate !== today) {
      if (state.lastStudyDate === yesterday.toDateString()) {
        state.streak++;
      } else if (state.lastStudyDate !== today) {
        state.streak = 1;
      }
      state.lastStudyDate = today;
      save();
    }
  }

  function addXP(amount, source = '') {
    state.totalXP += amount;
    state.currentLevelXP += amount;
    markStudied();

    const newAchievements = checkAchievements();
    save();

    return { added: amount, total: state.totalXP, newAchievements };
  }

  function recordExercise(exerciseId, topic, correct, difficulty = 1) {
    state.totalAttempted++;

    if (correct) {
      state.totalCorrect++;
      if (!state.completedExercises.includes(exerciseId)) {
        state.completedExercises.push(exerciseId);
      }

      // Update mastery
      const current = state.mastery[topic] || 0;
      const gain = Math.max(2, 5 - difficulty) * (difficulty === 1 ? 8 : difficulty === 2 ? 6 : 5);
      state.mastery[topic] = Math.min(100, current + gain);

      // XP
      const xp = [0, 10, 20, 35, 50][difficulty] || 10;
      addXP(xp);
    }

    // Track recent
    state.recentExercises = [exerciseId, ...state.recentExercises.slice(0, 19)];
    markStudied();

    const newAchievements = checkAchievements();
    save();

    return newAchievements;
  }

  function recordBoss(topic, won) {
    if (won) {
      state.bossesBeaten++;
      addXP(150);
      // Unlock next topic
      unlockNextTopic(topic);
    }
    markStudied();
    save();
    return checkAchievements();
  }

  function recordExam(score, total) {
    const pct = Math.round((score / total) * 100);
    state.examsCompleted++;
    if (pct > state.bestExamScore) state.bestExamScore = pct;
    state.examHistory.push({ date: new Date().toISOString(), score: pct });
    addXP(Math.round(pct * 0.5));
    markStudied();
    save();
    return checkAchievements();
  }

  function recordFlashcard() {
    state.flashcardsReviewed++;
    save();
    return checkAchievements();
  }

  const TOPIC_ORDER = [
    'antiderivativas', 'integrales-inmediatas', 'cambio-variable',
    'optimizacion', 'concavidad',
    'inversas-trigonometricas', 'sustitucion', 'integrales-definidas',
    'integracion-por-partes', 'metodo-uv', 'vaca-sin-cola', 'metodo-tabular',
    'fracciones-parciales-caso1', 'fracciones-parciales-caso2', 'fracciones-parciales-caso3',
    'aplicaciones-integrales-definidas'
  ];

  function unlockNextTopic(currentTopic) {
    const idx = TOPIC_ORDER.indexOf(currentTopic);
    if (idx >= 0 && idx < TOPIC_ORDER.length - 1) {
      const next = TOPIC_ORDER[idx + 1];
      if (!state.unlockedTopics.includes(next)) {
        state.unlockedTopics.push(next);
      }
    }
  }

  function checkAchievements() {
    const newOnes = [];
    for (const ach of ACHIEVEMENTS) {
      if (!state.earnedAchievements.includes(ach.id) && ach.condition(state)) {
        state.earnedAchievements.push(ach.id);
        newOnes.push(ach);
      }
    }
    if (newOnes.length) save();
    return newOnes;
  }

  function getRank() {
    let rank = RANKS[0];
    for (const r of RANKS) {
      if (state.totalXP >= r.minXP) rank = r;
    }
    return rank;
  }

  function getXPToNext() {
    const rank = getRank();
    const idx = RANKS.indexOf(rank);
    if (idx >= RANKS.length - 1) return { current: state.totalXP, needed: state.totalXP, pct: 100, isMax: true };
    const next = RANKS[idx + 1];
    const pct = Math.round(((state.totalXP - rank.minXP) / (next.minXP - rank.minXP)) * 100);
    return { current: state.totalXP - rank.minXP, needed: next.minXP - rank.minXP, pct: Math.min(pct, 100), nextRank: next };
  }

  function getMastery(topic) { return state.mastery[topic] || 0; }
  function isTopicUnlocked(topic) { return state.unlockedTopics.includes(topic); }
  function isExerciseDone(id) { return state.completedExercises.includes(id); }
  function getAchievements() { return ACHIEVEMENTS.map(a => ({ ...a, earned: state.earnedAchievements.includes(a.id) })); }

  return { load, save, reset, get, addXP, recordExercise, recordBoss, recordExam,
           recordFlashcard, getRank, getXPToNext, getMastery, isTopicUnlocked,
           isExerciseDone, getAchievements, RANKS, ACHIEVEMENTS, TOPIC_ORDER };
})();
