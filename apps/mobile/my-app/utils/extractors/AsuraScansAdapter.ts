import { BaseWebsiteAdapter } from './BaseWebsiteAdapter';

/**
 * AsuraScans Adapter
 * 
 * Supports: https://asuracomic.net/series/[slug]
 * 
 * Features:
 * - Fast releases
 * - Popular manhwa and manga
 * - Community translations
 */
export class AsuraScansAdapter extends BaseWebsiteAdapter {
  getName(): string {
    return 'AsuraScans';
  }

  getUrlPatterns(): RegExp[] {
    return [
      /asuracomic\.net\/series/i,
      /asurascans\./i,
    ];
  }

  getInjectionScript(): string {
    return `
      (function() {
        try {
          const data = {};
          
          // Title
          const titleEl = document.querySelector('h1.text-3xl, h1[class*="title"], .entry-title');
          data.title = titleEl ? titleEl.textContent.trim() : '';
          
          // Description
          const descEl = document.querySelector('[class*="description"], .entry-content p, .summary__content');
          data.description = descEl ? descEl.textContent.trim().substring(0, 500) : '';
          
          // Cover Image
          const coverEl = document.querySelector('img[class*="cover"], .series-thumb img, img.attachment-post-thumbnail');
          data.coverImage = coverEl ? coverEl.src : '';
          
          // Author
          const authorEl = document.querySelector('[class*="author"], .author-content a');
          data.author = authorEl ? authorEl.textContent.trim() : '';
          
          // Genres
          const genreEls = document.querySelectorAll('.genres a, [class*="genre"] a');
          data.genres = Array.from(genreEls).map(el => el.textContent.trim()).filter(Boolean).slice(0, 5);
          
          // Status
          const statusEl = document.querySelector('[class*="status"], .post-status span');
          const statusText = statusEl ? statusEl.textContent.toLowerCase() : '';
          if (statusText.includes('ongoing')) data.mangaStatus = 'ongoing';
          else if (statusText.includes('completed')) data.mangaStatus = 'completed';
          else data.mangaStatus = 'ongoing';
          
          data.sourceUrl = window.location.href.split('?')[0];
          data.sourceWebsite = 'AsuraScans';
          
          return JSON.stringify(data);
        } catch(e) {
          return JSON.stringify({ error: e.message });
        }
      })();
    `;
  }
}
