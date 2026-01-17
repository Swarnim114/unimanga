import { BaseWebsiteAdapter } from './BaseWebsiteAdapter';

/**
 * MangaDex Adapter
 * 
 * Supports: https://mangadex.org/title/[id]/[slug]
 * 
 * Features:
 * - Multi-language support
 * - Comprehensive metadata (tags, authors, artists)
 * - Cover images and descriptions
 */
export class MangaDexAdapter extends BaseWebsiteAdapter {
  getName(): string {
    return 'MangaDex';
  }

  getUrlPatterns(): RegExp[] {
    return [
      /mangadex\.org\/title\/[a-f0-9-]+/i,
    ];
  }

  getInjectionScript(): string {
    return `
      (function() {
        try {
          const data = {};
          
          // Title
          const titleEl = document.querySelector('h1.text-3xl, h1[class*="title"]');
          data.title = titleEl ? titleEl.textContent.trim() : '';
          
          // Description
          const descEl = document.querySelector('[class*="description"], .text-sm.leading-relaxed');
          data.description = descEl ? descEl.textContent.trim().substring(0, 500) : '';
          
          // Cover Image
          const coverEl = document.querySelector('img[alt*="cover"], .rounded.shadow-md');
          data.coverImage = coverEl ? coverEl.src : '';
          
          // Author/Artist
          const authorEl = document.querySelector('a[href*="/author/"]');
          data.author = authorEl ? authorEl.textContent.trim() : '';
          
          // Genres
          const genreEls = document.querySelectorAll('a[href*="/tag/"]');
          data.genres = Array.from(genreEls).map(el => el.textContent.trim()).filter(Boolean).slice(0, 5);
          
          // Status
          const statusEl = document.querySelector('[class*="status"]');
          const statusText = statusEl ? statusEl.textContent.toLowerCase() : '';
          if (statusText.includes('ongoing')) data.mangaStatus = 'ongoing';
          else if (statusText.includes('completed')) data.mangaStatus = 'completed';
          else if (statusText.includes('hiatus')) data.mangaStatus = 'hiatus';
          else data.mangaStatus = 'ongoing';
          
          // Source URL
          data.sourceUrl = window.location.href.split('?')[0];
          data.sourceWebsite = 'MangaDex';
          
          return JSON.stringify(data);
        } catch(e) {
          return JSON.stringify({ error: e.message });
        }
      })();
    `;
  }
}
