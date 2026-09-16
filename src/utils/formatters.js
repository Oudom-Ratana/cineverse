/**
 * Formatting & Media Streaming Helper Utilities
 */

/**
 * Returns VidSrc embed streaming URL for Movies or TV Series episodes
 * @param {'movie'|'tv'} mediaType
 * @param {string|number} id - TMDB ID
 * @param {number} [season] - Season number for TV
 * @param {number} [episode] - Episode number for TV
 * @returns {string}
 */
export const getVidSrcEmbedUrl = (mediaType = 'movie', id, season = 1, episode = 1) => {
  if (!id) return '';
  if (mediaType === 'tv') {
    return `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`;
  }
  return `https://vidsrc.to/embed/movie/${id}`;
};

/**
 * Get TMDB Poster image URL with size fallback
 */
export const getPosterUrl = (path, size = 'w500') => {
  if (!path) return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80';
  if (path.startsWith('http')) return path;
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

/**
 * Get TMDB Backdrop image URL with size fallback
 */
export const getBackdropUrl = (path, size = 'original') => {
  if (!path) return 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1920&q=80';
  if (path.startsWith('http')) return path;
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

/**
 * Format runtime from minutes into "Xh Ym"
 * @param {number} minutes
 * @returns {string}
 */
export const formatRuntime = (minutes) => {
  if (!minutes || isNaN(minutes)) return 'N/A';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
};

/**
 * Format numbers as USD currency
 * @param {number} amount
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

/**
 * Format ISO date string into readable date (e.g. "Aug 26, 2026")
 * @param {string} dateStr
 * @returns {string}
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch (e) {
    return dateStr;
  }
};

/**
 * Truncate long strings with ellipsis
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncateText = (text, maxLength = 120) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
};
