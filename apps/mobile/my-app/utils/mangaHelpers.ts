/**
 * Clean manga title by removing chapter numbers and website names
 * Examples:
 * "Swordmaster's Youngest Son Chapter 194 - Asura Scans" -> "Swordmaster's Youngest Son"
 * "One Piece Ch. 1050" -> "One Piece"
 */
export function cleanMangaTitle(title: string): string {
  if (!title) return '';
  
  // Remove website suffixes like " - Asura Scans", " - WeebCentral", etc
  let cleaned = title.replace(/\s*[-–—]\s*(Asura\s*Scans?|Webtoons?|MangaFire|Manga\s*Fire|WeebCentral|Weeb\s*Central)\s*$/i, '');
  
  // Remove chapter indicators at the end
  // Matches: "Chapter 194", "Ch. 194", "Ch 194", "Episode 50", "Ep. 50", etc.
  cleaned = cleaned.replace(/\s+(Chapter|Ch\.?|Episode|Ep\.?)\s+\d+(\.\d+)?\s*$/i, '');
  
  return cleaned.trim();
}

/**
 * Extract chapter number from URL or title
 * Examples:
 * "https://asuracomic.net/series/swordmasters-youngest-son-b62b5a15/chapter/194" -> "194"
 * "https://weebcentral.com/chapter/abc123" -> null (needs title parsing)
 * "Chapter 194" -> "194"
 */
export function extractChapterNumber(url: string, title?: string): string | null {
  // Try to extract from URL first
  // Pattern 1: /chapter/123 or /ch/123 or /episode/123
  const urlMatch = url.match(/\/(chapter|ch|episode|ep)\/(\d+(?:\.\d+)?)/i);
  if (urlMatch) {
    return urlMatch[2];
  }
  
  // Pattern 2: /123 at the end (common in some sites)
  const endNumberMatch = url.match(/\/(\d+(?:\.\d+)?)(?:\/|$)/);
  if (endNumberMatch && parseFloat(endNumberMatch[1]) > 0) {
    return endNumberMatch[1];
  }
  
  // If URL extraction fails, try title
  if (title) {
    const titleMatch = title.match(/(?:Chapter|Ch\.?|Episode|Ep\.?)\s+(\d+(?:\.\d+)?)/i);
    if (titleMatch) {
      return titleMatch[1];
    }
  }
  
  return null;
}

/**
 * Format chapter display text
 * @param currentChapter Current chapter string (e.g., "194", "0")
 * @returns Formatted string like "Chapter 194"
 */
export function formatChapterDisplay(currentChapter: string | number): string {
  const chapter = currentChapter.toString();
  
  // Don't show "Chapter 0"
  if (chapter === '0' || chapter === '') {
    return 'Not started';
  }
  
  return `Chapter ${chapter}`;
}

/**
 * Calculate progress percentage based on current chapter and total chapters
 */
export function calculateProgress(currentChapter: string | number, totalChapters?: number): number {
  if (!totalChapters || totalChapters === 0) return 0;
  
  const current = parseFloat(currentChapter.toString());
  if (isNaN(current) || current === 0) return 0;
  
  const progress = Math.round((current / totalChapters) * 100);
  return Math.min(100, Math.max(0, progress));
}

/**
 * Extract series/manga detail page URL from a chapter URL
 * Examples:
 * "https://asuracomic.net/series/swordmasters-youngest-son-b62b5a15/chapter/194" 
 * -> "https://asuracomic.net/series/swordmasters-youngest-son-b62b5a15"
 */
export function getSeriesUrl(url: string): string {
  // AsuraScans pattern: remove /chapter/XXX part
  if (url.includes('asuracomic.net') || url.includes('asurascans')) {
    const match = url.match(/(.*\/series\/[^\/]+)/);
    if (match) return match[1];
  }
  
  // WeebCentral, MangaFire, etc. - add patterns as needed
  
  return url;
}

/**
 * Check if a URL is a series/manga detail page (not a chapter page)
 */
export function isSeriesPage(url: string): boolean {
  // AsuraScans
  if (url.includes('asuracomic.net') || url.includes('asurascans')) {
    return url.includes('/series/') && !url.includes('/chapter/');
  }
  
  // Add other website patterns as needed
  
  return false;
}
