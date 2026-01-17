import { BaseWebsiteAdapter } from './BaseWebsiteAdapter';

/**
 * Webtoons Adapter
 * 
 * Supports: https://www.webtoons.com/[language]/[genre]/[series]/list
 * 
 * Features:
 * - Vertical scroll format
 * - Multi-language support
 * - Original content and licensed titles
 */
export class WebtoonsAdapter extends BaseWebsiteAdapter {
  getName(): string {
    return 'Webtoons';
  }

  getUrlPatterns(): RegExp[] {
    return [
      /webtoons\.com\/[a-z]+\/[a-z-]+\/[a-z0-9-]+/i,
    ];
  }

  getInjectionScript(): string {
    return `
      (function() {
        try {
          const data = {};
          
          // Title
          const titleEl = document.querySelector('h1.subj, h1._title');
          data.title = titleEl ? titleEl.textContent.trim() : '';
          
          // Description
          const descEl = document.querySelector('p.summary, p._summary');
          data.description = descEl ? descEl.textContent.trim().substring(0, 500) : '';
          
          // Cover Image
          const coverEl = document.querySelector('img.thumb, span._thumbnail img');
          data.coverImage = coverEl ? coverEl.src : '';
          
          // Author
          const authorEl = document.querySelector('.author, ._authorName');
          data.author = authorEl ? authorEl.textContent.trim().replace('author info', '').trim() : '';
          
          // Genre
          const genreEl = document.querySelector('.genre, h2._genre');
          const genre = genreEl ? genreEl.textContent.trim() : 'Webtoon';
          data.genres = [genre, 'Webtoon'];
          
          // Status
          const statusEl = document.querySelector('.day_info, ._statusText');
          const statusText = statusEl ? statusEl.textContent.toLowerCase() : '';
          if (statusText.includes('completed') || statusText.includes('complete')) {
            data.mangaStatus = 'completed';
          } else {
            data.mangaStatus = 'ongoing';
          }
          
          data.sourceUrl = window.location.href.split('?')[0].split('/list')[0] + '/list';
          data.sourceWebsite = 'Webtoons';
          
          return JSON.stringify(data);
        } catch(e) {
          return JSON.stringify({ error: e.message });
        }
      })();
    `;
  }
}
