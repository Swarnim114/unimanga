import { BaseWebsiteAdapter } from './BaseWebsiteAdapter';

/**
 * WeebCentral Adapter
 * 
 * Supports: https://weebcentral.com/
 * 
 * Features:
 * - Manga and manhwa content
 * - Fast updates
 * - English translations
 */
export class WeebCentralAdapter extends BaseWebsiteAdapter {
  getName(): string {
    return 'WeebCentral';
  }

  getUrlPatterns(): RegExp[] {
    return [
      /weebcentral\.com\/series/i,
      /weebcentral\.com\/manga/i,
    ];
  }

  /**
   * Override to detect WeebCentral chapter pages
   * Chapter URLs: /series/[ID]/[NAME]/chapter/[NUMBER]
   */
  isChapterPage(url: string): boolean {
    return /\/chapter\/\d+/i.test(url);
  }

  /**
   * Override to extract series URL from chapter URL
   * Chapter: weebcentral.com/series/01J76XY.../Kagurabachi/chapter/108
   * Series:  weebcentral.com/series/01J76XY.../Kagurabachi
   */
  getSeriesUrlFromChapter(chapterUrl: string): string | null {
    const match = chapterUrl.match(/(.*\/series\/[^/]+\/[^/]+)\/chapter\/\d+/i);
    return match ? match[1] : null;
  }

  getInjectionScript(): string {
    return `
      (function() {
        try {
          const data = {};
          
          // Title - h1 works perfectly on WeebCentral
          const titleEl = document.querySelector('h1');
          if (titleEl) {
            data.title = titleEl.textContent.trim();
          } else {
            // Fallback to meta tag
            const metaTitle = document.querySelector('meta[property="og:title"]');
            data.title = metaTitle ? metaTitle.content.replace(' | Weeb Central', '') : '';
          }
          
          // Description - WeebCentral relies on meta tags
          const metaDesc = document.querySelector('meta[property="og:description"]') ||
                          document.querySelector('meta[name="description"]');
          data.description = metaDesc ? metaDesc.content.substring(0, 500) : '';
          
          // Cover Image - Look for image with "cover" in alt attribute
          const images = Array.from(document.querySelectorAll('img'));
          
          // First, try to find image with "cover" in alt text
          let coverEl = images.find(img => 
            img.alt && img.alt.toLowerCase().includes('cover') && 
            !img.alt.toLowerCase().includes('logo')
          );
          
          // Fallback to meta og:image (WeebCentral has good meta tags)
          if (!coverEl) {
            const metaImg = document.querySelector('meta[property="og:image"]');
            if (metaImg && !metaImg.content.includes('brand.png')) {
              data.coverImage = metaImg.content;
            }
          } else {
            data.coverImage = coverEl.src;
          }
          
          // If still no cover, try finding large image (exclude brand/logo)
          if (!data.coverImage) {
            coverEl = images.find(img => 
              !img.src.includes('brand.png') && 
              !img.src.includes('logo') &&
              !img.src.includes('icon') &&
              img.width > 200 && 
              img.height > 250
            );
            data.coverImage = coverEl ? coverEl.src : '';
          }
          
          // Author - WeebCentral doesn't display author prominently, default empty
          data.author = '';
          
          // Genres - WeebCentral doesn't show genres on series page, default to generic
          data.genres = ['Manga'];
          
          // Status - Default to ongoing (WeebCentral doesn't show status)
          data.mangaStatus = 'ongoing';
          
          data.sourceUrl = window.location.href.split('?')[0];
          data.sourceWebsite = 'WeebCentral';
          
          return JSON.stringify(data);
        } catch(e) {
          return JSON.stringify({ error: e.message });
        }
      })();
    `;
  }
}
