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
          const debug = { attempts: {} };
          
          // Title - Try multiple selectors
          let title = '';
          const titleSelectors = [
            'h1.name',
            'h1.title',
            'h1',
            '.manga-name',
            '.info-title h1',
            '[class*="title"] h1'
          ];
          
          for (const selector of titleSelectors) {
            const el = document.querySelector(selector);
            debug.attempts[selector] = el ? el.textContent.trim() : 'not found';
            if (el && el.textContent.trim()) {
              title = el.textContent.trim();
              debug.titleSource = selector;
              break;
            }
          }
          
          // Fallback to meta tags
          if (!title) {
            const metaTitle = document.querySelector('meta[property="og:title"]') ||
                             document.querySelector('meta[name="title"]');
            debug.attempts['meta'] = metaTitle ? metaTitle.content : 'not found';
            title = metaTitle ? metaTitle.content.split('|')[0].trim() : '';
            if (title) debug.titleSource = 'meta[property="og:title"]';
          }
          
          // Final fallback to document.title
          if (!title && document.title) {
            title = document.title.split('|')[0].split('-')[0].trim();
            if (title) debug.titleSource = 'document.title';
          }
          
          data.title = title;
          
          // Description - Try multiple selectors
          let description = '';
          const descSelectors = [
            '.description',
            '.synopsis',
            '[class*="desc"]',
            '[class*="summary"]',
            '.info-desc',
            'div[class*="description"] p'
          ];
          
          for (const selector of descSelectors) {
            const el = document.querySelector(selector);
            if (el && el.textContent.trim() && el.textContent.trim().length > 20) {
              description = el.textContent.trim();
              break;
            }
          }
          
          // Fallback to meta description
          if (!description) {
            const metaDesc = document.querySelector('meta[property="og:description"]') || 
                            document.querySelector('meta[name="description"]');
            description = metaDesc ? metaDesc.content : '';
          }
          
          data.description = description.substring(0, 500);
          
          // Cover Image - Try multiple selectors
          let coverImage = '';
          const imageSelectors = [
            'img.cover',
            'img.poster',
            'img[alt*="cover"]',
            '.manga-poster img',
            '.info-img img',
            'img[class*="cover"]',
            'img[class*="poster"]'
          ];
          
          const images = Array.from(document.querySelectorAll('img'));
          for (const selector of imageSelectors) {
            const el = document.querySelector(selector);
            if (el && el.src && !el.src.includes('logo') && !el.src.includes('icon')) {
              coverImage = el.src;
              break;
            }
          }
          
          // Fallback: find largest image
          if (!coverImage && images.length > 0) {
            const largeImage = images.find(img => 
              img.width > 150 && 
              img.height > 200 && 
              !img.src.includes('logo') &&
              !img.src.includes('icon')
            );
            coverImage = largeImage ? largeImage.src : '';
          }
          
          // Final fallback to meta image
          if (!coverImage) {
            const metaImg = document.querySelector('meta[property="og:image"]');
            coverImage = metaImg ? metaImg.content : '';
          }
          
          data.coverImage = coverImage;
          
          // Author - Try multiple selectors
          let author = '';
          const authorSelectors = [
            '[class*="author"]',
            '.info-item:contains("Author") span',
            '.meta-data .author',
            'a[href*="/author/"]'
          ];
          
          for (const selector of authorSelectors) {
            try {
              const el = document.querySelector(selector);
              if (el && el.textContent.trim() && 
                  !el.textContent.toLowerCase().includes('unknown') &&
                  el.textContent.trim().length > 0) {
                author = el.textContent.trim().replace('Author:', '').trim();
                break;
              }
            } catch(e) {}
          }
          
          data.author = author;
          
          // Genres - Try multiple selectors
          let genres = [];
          const genreSelectors = [
            '.genres a',
            '[class*="genre"] a',
            '.badge',
            '.tag',
            'a[href*="/genre/"]'
          ];
          
          for (const selector of genreSelectors) {
            try {
              const genreEls = document.querySelectorAll(selector);
              if (genreEls.length > 0) {
                genres = Array.from(genreEls)
                  .map(el => el.textContent.trim())
                  .filter(g => g && g.length > 0 && g.length < 20)
                  .slice(0, 5);
                if (genres.length > 0) break;
              }
            } catch(e) {}
          }
          
          data.genres = genres.length > 0 ? genres : ['Manga'];
          
          // Status - Try multiple selectors
          let status = 'ongoing';
          const statusSelectors = [
            '.status',
            '[class*="status"]',
            '.info-status',
            '.meta-data .status'
          ];
          
          for (const selector of statusSelectors) {
            try {
              const el = document.querySelector(selector);
              if (el) {
                const statusText = el.textContent.toLowerCase();
                if (statusText.includes('completed') || statusText.includes('finished')) {
                  status = 'completed';
                  break;
                } else if (statusText.includes('ongoing') || statusText.includes('publishing')) {
                  status = 'ongoing';
                  break;
                }
              }
            } catch(e) {}
          }
          
          data.mangaStatus = status;
          
          // Clean up URL
          data.sourceUrl = window.location.href.split('?')[0].split('#')[0];
          data.sourceWebsite = 'MangaFire';
          data._debug = debug;
          
          return JSON.stringify(data);
        } catch(e) {
          return JSON.stringify({ error: e.message, stack: e.stack });
        }
      })();
    `;
  }
}
