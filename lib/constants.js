// Rank thresholds (total XP across all tools)
export const RANKS = [
  { name: 'Cadet', emoji: '🛡️', minXp: 0, color: '#94a3b8' },
  { name: 'Soldier', emoji: '⚔️', minXp: 1000, color: '#22c55e' },
  { name: 'Knight', emoji: '🗡️', minXp: 3000, color: '#06b6d4' },
  { name: 'Wizard', emoji: '🧙', minXp: 6000, color: '#f59e0b' },
  { name: 'Archmage', emoji: '👑', minXp: 10000, color: '#a855f7' },
];

// Level definitions
export const LEVELS = [
  { slug: 'cadet', name: 'Cadet', displayName: '🛡️ Cadet', orderIndex: 1, stageCount: 15, xpPerStage: 30 },
  { slug: 'soldier', name: 'Soldier', displayName: '⚔️ Soldier', orderIndex: 2, stageCount: 15, xpPerStage: 50 },
  { slug: 'knight', name: 'Knight', displayName: '🗡️ Knight', orderIndex: 3, stageCount: 15, xpPerStage: 80 },
  { slug: 'wizard', name: 'Wizard', displayName: '🧙 Wizard', orderIndex: 4, stageCount: 12, xpPerStage: 120 },
  { slug: 'archmage', name: 'Archmage', displayName: '👑 Archmage', orderIndex: 5, stageCount: 10, xpPerStage: 200 },
];

// Judge0 Language IDs
export const LANGUAGE_IDS = {
  python: '71',
  javascript: '63',
  typescript: '74',
  go: '60',
  rust: '73',
  cpp: '54',
  bash: '46',
  sql: '82',
};

// Tool categories
export const CATEGORIES = {
  language: { label: 'Languages', emoji: '💻' },
  tool: { label: 'Developer Tools', emoji: '🔧' },
  framework: { label: 'Frameworks', emoji: '⚡' },
};

// Exercise type display names
export const EXERCISE_TYPES = {
  quiz: { label: 'Quiz', emoji: '❓', color: '#06b6d4' },
  'fill-code': { label: 'Fill the Code', emoji: '✏️', color: '#f59e0b' },
  'coding-challenge': { label: 'Coding Challenge', emoji: '⚔️', color: '#22c55e' },
  debug: { label: 'Debug Quest', emoji: '🐛', color: '#ef4444' },
  project: { label: 'Project', emoji: '🏗️', color: '#a855f7' },
  refactor: { label: 'Refactor', emoji: '♻️', color: '#06b6d4' },
};

// Stage status icons
export const STAGE_STATUS = {
  completed: { icon: '✅', label: 'Completed' },
  in_progress: { icon: '🔶', label: 'In Progress' },
  not_started: { icon: '🔒', label: 'Locked' },
  available: { icon: '⭐', label: 'Available' },
};

// Total stages per tool
export const TOTAL_STAGES_PER_TOOL = 67;

// Max active tools
export const MAX_ACTIVE_TOOLS = 2;
