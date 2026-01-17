import { BaseWebsiteAdapter } from './BaseWebsiteAdapter';

/**
 * MangaPlus (Shueisha) Adapter
 * 
 * Supports: https://mangaplus.shueisha.co.jp/titles/[id]
 * 
 * Features:
 * - Official Shueisha titles
 * - Simultaneous release with Japan
 * - High-quality scans
 */
export class MangaPlusAdapter extends BaseWebsiteAdapter {
  getName(): string {
    return 'MangaPlus';
  }

  getUrlPatterns(): RegExp[] {
    return [
      /mangaplus\.shueisha\.co\.jp\/titles/i,
      /mangaplus\.shueisha\.co\.jp\/viewer/i,
    ];
  }

  getInjectionScript(): string {
    return `
      (function() {
        try {
          const data = {};
          
          // Title
          const titleEl = document.querySelector('h1.TitleDetailHeader-module_title, h1');
          data.title = titleEl ? titleEl.textContent.trim() : '';
          
          // Description
          const descEl = document.querySelector('.TitleDetailHeader-module_overview, [class*="overview"]');
          data.description = descEl ? descEl.textContent.trim().substring(0, 500) : '';
          
          // Cover Image
          const coverEl = document.querySelector('img.TitleDetailHeader-module_img, img[class*="title"]');
          data.coverImage = coverEl ? coverEl.src : '';
          
          // Author
          const authorEl = document.querySelector('.TitleDetailHeader-module_author, [class*="author"]');
          data.author = authorEl ? authorEl.textContent.trim() : '';
          
          // Genres
          data.genres = ['Manga', 'Shueisha'];
          
          // Status - MangaPlus usually shows ongoing series
          data.mangaStatus = 'ongoing';
          
          data.sourceUrl = window.location.href.split('?')[0];
          data.sourceWebsite = 'MangaPlus';
          
          return JSON.stringify(data);
        } catch(e) {
          return JSON.stringify({ error: e.message });
        }
      })();
    `;
  }
}
