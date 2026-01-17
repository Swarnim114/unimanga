/**
 * Metadata Extractors
 * 
 * Simple implementation focused on AsuraScans for now.
 * Other websites can be added following the same pattern.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface MangaMetadata {
  title: string;
  description?: string;
  author?: string;
  artist?: string;
  coverImage?: string;
  sourceWebsite: string;
  sourceUrl: string;
  genres?: string[];
  mangaStatus?: 'ongoing' | 'completed' | 'hiatus' | 'cancelled';
  totalChapters?: number;
  alternativeTitles?: string[];
  lastChapterAdded?: string;
  rating?: number;
}

// ============================================================================
// ASURASCANS EXTRACTOR
// ============================================================================

export const asuraScansExtractor = {
  name: 'AsuraScans',
  urlPatterns: [/asuracomic\.net\/series/i, /asurascans\./i],
  
  canHandle(url: string): boolean {
    return this.urlPatterns.some(pattern => pattern.test(url));
  },
  
  getInjectionScript(): string {
    return `
      (function() {
        try {
          const data = {};
          
          // Wait for content to load - try to find any h1 first
          const waitForContent = () => {
            const h1Elements = document.querySelectorAll('h1');
            const allText = Array.from(h1Elements).map(el => el.textContent.trim()).filter(t => t && t !== 'summary');
            
            // Title - try to get the largest/most prominent h1
            let title = '';
            if (allText.length > 0) {
              // Get the longest non-empty h1 that's not "summary"
              title = allText.reduce((longest, current) => 
                current.length > longest.length ? current : longest
              , '');
            }
            
            // Fallback: try meta tags
            if (!title) {
              const metaTitle = document.querySelector('meta[property="og:title"]') ||
                               document.querySelector('meta[name="title"]');
              title = metaTitle ? metaTitle.content : '';
            }
            
            // Fallback: try document title
            if (!title) {
              title = document.title.split('|')[0].split('-')[0].trim();
            }
            
            data.title = title;
            
            // Description - try multiple approaches
            let description = '';
            
            // Try meta description
            const metaDesc = document.querySelector('meta[property="og:description"]') ||
                            document.querySelector('meta[name="description"]');
            if (metaDesc) {
              description = metaDesc.content;
            }
            
            // Try visible description elements
            if (!description) {
              const descEl = document.querySelector('.description') || 
                           document.querySelector('[class*="description"]') ||
                           document.querySelector('.summary') ||
                           document.querySelector('[class*="summary"]') ||
                           Array.from(document.querySelectorAll('p')).find(p => p.textContent.length > 100);
              description = descEl ? descEl.textContent.trim() : '';
            }
            
            data.description = description.substring(0, 500);
            
            // Cover Image - avoid logos and backgrounds
            const images = Array.from(document.querySelectorAll('img'));
            let coverEl = images.find(img => 
              img.alt && (img.alt.toLowerCase().includes('cover') || img.alt.toLowerCase().includes(title.toLowerCase()))
            );
            
            if (!coverEl) {
              coverEl = images.find(img => 
                !img.src.includes('logo') && 
                !img.src.includes('bg.png') &&
                !img.src.includes('background') &&
                img.width > 150 && 
                img.height > 200
              );
            }
            
            // Try meta image
            if (!coverEl || coverEl.src.includes('logo') || coverEl.src.includes('bg.png')) {
              const metaImg = document.querySelector('meta[property="og:image"]');
              if (metaImg && !metaImg.content.includes('logo') && !metaImg.content.includes('bg.png')) {
                data.coverImage = metaImg.content;
              } else {
                data.coverImage = coverEl ? coverEl.src : '';
              }
            } else {
              data.coverImage = coverEl ? coverEl.src : '';
            }
            
            // Author
            let authorEl = document.querySelector('a[href*="author"]') ||
                          document.querySelector('[class*="author"]');
            data.author = authorEl ? authorEl.textContent.trim() : '';
            
            // Genres
            let genreEls = document.querySelectorAll('a[href*="genre"]') ||
                          document.querySelectorAll('.genres a') ||
                          document.querySelectorAll('[class*="genre"] a');
            data.genres = Array.from(new Set(
              Array.from(genreEls)
                .map(el => el.textContent.trim().replace(/,$/g, ''))
                .filter(Boolean)
            )).slice(0, 5);
            
            // Status
            let statusEl = document.querySelector('[class*="status"]') ||
                          document.querySelector('.post-status span');
            const statusText = statusEl ? statusEl.textContent.toLowerCase() : '';
            if (statusText.includes('ongoing')) data.mangaStatus = 'ongoing';
            else if (statusText.includes('completed')) data.mangaStatus = 'completed';
            else data.mangaStatus = 'ongoing';
            
            data.sourceUrl = window.location.href.split('?')[0];
            data.sourceWebsite = 'AsuraScans';
            
            return data;
          };
          
          const result = waitForContent();
          
          // Debug logging
          console.log('AsuraScans extraction:', {
            title: result.title,
            titleLength: result.title.length,
            hasDescription: !!result.description,
            hasCover: !!result.coverImage,
            genresCount: result.genres.length
          });
          
          return JSON.stringify(result);
        } catch(e) {
          console.error('AsuraScans extraction error:', e);
          return JSON.stringify({ error: e.message });
        }
      })();
    `;
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get the appropriate extractor for a given URL
 */
export const getExtractorForUrl = (url: string) => {
  // For now, only AsuraScans
  if (asuraScansExtractor.canHandle(url)) {
    return asuraScansExtractor;
  }
  return null;
};

/**
 * Check if URL is a manga detail page we can extract from
 */
export const isMangaDetailPage = (url: string): boolean => {
  return getExtractorForUrl(url) !== null;
};

/**
 * Parse extracted metadata from WebView message
 */
export const parseMetadata = (jsonString: string): MangaMetadata | null => {
  try {
    console.log('Parsing metadata from:', jsonString?.substring(0, 100) + '...');
    
    if (!jsonString || typeof jsonString !== 'string') {
      console.error('Invalid input: not a string');
      return null;
    }
    
    const data = JSON.parse(jsonString);
    
    if (data.error) {
      console.error('Metadata extraction error from page:', data.error);
      return null;
    }
    
    if (!data.title) {
      console.error('No title found in extracted data');
      return null;
    }
    
    // Validate required fields
    if (!data.sourceUrl || !data.sourceWebsite) {
      console.error('Missing required metadata fields (sourceUrl or sourceWebsite)');
      return null;
    }
    
    console.log('Successfully parsed metadata for:', data.title);
    return data as MangaMetadata;
  } catch (error) {
    console.error('Failed to parse metadata JSON:', error);
    return null;
  }
};
