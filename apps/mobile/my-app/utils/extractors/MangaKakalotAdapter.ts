import { BaseWebsiteAdapter } from './BaseWebsiteAdapter';

/**
 * MangaKakalot Adapter
 * 
 * Supports: 
 * - https://mangakakalot.com/manga/[id]
 * - https://manganato.com/manga/[id]
 * 
 * Features:
 * - Large collection
 * - Multiple mirror sites
 * - Fast updates
 */
export class MangaKakalotAdapter extends BaseWebsiteAdapter {
  getName(): string {
    return 'MangaKakalot';
  }

  getUrlPatterns(): RegExp[] {
    return [
      /mangakakalot\.com\/manga/i,
      /manganato\.com\/manga/i,
    ];
  }

  getInjectionScript(): string {
    return `
      (function() {
        try {
          const data = {};
          
          // Title
          const titleEl = document.querySelector('h1, .manga-info-text h1');
          data.title = titleEl ? titleEl.textContent.trim() : '';
          
          // Description
          const descEl = document.querySelector('#noidungm, #panel-story-info-description, .panel-story-info-description');
          data.description = descEl ? descEl.textContent.trim().replace('Description :', '').substring(0, 500) : '';
          
          // Cover Image
          const coverEl = document.querySelector('.manga-info-pic img, .info-image img, img.img-loading');
          data.coverImage = coverEl ? coverEl.src : '';
          
          // Author
          const infoItems = document.querySelectorAll('.manga-info-text li, .table-value');
          let author = '';
          infoItems.forEach(item => {
            const text = item.textContent;
            if (text.includes('Author') || text.includes('author')) {
              author = text.split(':')[1]?.trim() || '';
            }
          });
          data.author = author;
          
          // Genres
          const genreEls = document.querySelectorAll('.manga-info-text li a[href*="genre"], .table-value a');
          data.genres = Array.from(genreEls).map(el => el.textContent.trim()).filter(Boolean).slice(0, 5);
          
          // Status
          let status = 'ongoing';
          infoItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            if (text.includes('status')) {
              if (text.includes('ongoing')) status = 'ongoing';
              else if (text.includes('completed')) status = 'completed';
            }
          });
          data.mangaStatus = status;
          
          data.sourceUrl = window.location.href.split('?')[0];
          data.sourceWebsite = 'MangaKakalot';
          
          return JSON.stringify(data);
        } catch(e) {
          return JSON.stringify({ error: e.message });
        }
      })();
    `;
  }
}
