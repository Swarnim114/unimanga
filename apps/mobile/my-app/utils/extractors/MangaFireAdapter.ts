import { BaseWebsiteAdapter } from './BaseWebsiteAdapter';

/**
 * MangaFire Adapter
 * 
 * Supports: https://mangafire.to/manga/[slug]
 * 
 * Features:
 * - Large collection
 * - Multiple sources
 * - Fast updates
 */
export class MangaFireAdapter extends BaseWebsiteAdapter {
  getName(): string {
    return 'MangaFire';
  }

  getUrlPatterns(): RegExp[] {
    return [
      /mangafire\.to\/manga/i,
    ];
  }

  getInjectionScript(): string {
    return `
      (function() {
        try {
          const data = {};
          
          // Title
          const titleEl = document.querySelector('h1.name, h1.title, h1');
          data.title = titleEl ? titleEl.textContent.trim() : '';
          
          // Description
          const descEl = document.querySelector('.description, .synopsis, [class*="desc"]');
          data.description = descEl ? descEl.textContent.trim().substring(0, 500) : '';
          
          // Cover Image
          const coverEl = document.querySelector('img.cover, img.poster, img[alt*="cover"]');
          data.coverImage = coverEl ? coverEl.src : '';
          
          // Author
          const authorEl = document.querySelector('[class*="author"], .info-item:contains("Author") span');
          data.author = authorEl ? authorEl.textContent.trim() : '';
          
          // Genres
          const genreEls = document.querySelectorAll('.genres a, [class*="genre"] a, .badge');
          data.genres = Array.from(genreEls).map(el => el.textContent.trim()).filter(Boolean).slice(0, 5);
          
          // Status
          const statusEl = document.querySelector('.status, [class*="status"]');
          const statusText = statusEl ? statusEl.textContent.toLowerCase() : '';
          if (statusText.includes('ongoing')) data.mangaStatus = 'ongoing';
          else if (statusText.includes('completed')) data.mangaStatus = 'completed';
          else data.mangaStatus = 'ongoing';
          
          data.sourceUrl = window.location.href.split('?')[0];
          data.sourceWebsite = 'MangaFire';
          
          return JSON.stringify(data);
        } catch(e) {
          return JSON.stringify({ error: e.message });
        }
      })();
    `;
  }
}
