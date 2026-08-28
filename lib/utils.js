import { RANKS } from './constants';

/**
 * Get rank based on total XP.
 */
export function getRankFromXp(totalXp) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (totalXp >= r.minXp) rank = r;
  }
  return rank;
}

/**
 * Get next rank threshold.
 */
export function getNextRankThreshold(totalXp) {
  for (const r of RANKS) {
    if (totalXp < r.minXp) return r;
  }
  return null; // Already max rank
}

/**
 * Calculate progress percentage.
 */
export function calcProgress(completed, total) {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/**
 * Format XP number with commas.
 */
export function formatXp(xp) {
  return xp.toLocaleString();
}

/**
 * Get relative time string (e.g., "2 days ago").
 */
export function getRelativeTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString();
}

/**
 * Difficulty rating to star display.
 */
export function starsDisplay(rating) {
  const filled = '⭐'.repeat(rating);
  const empty = '☆'.repeat(5 - rating);
  return filled + empty;
}

/**
 * Slugify a string.
 */
export function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
