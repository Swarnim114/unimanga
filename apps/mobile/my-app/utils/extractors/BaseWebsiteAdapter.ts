/**
 * ADAPTER PATTERN - Base Abstract Class
 * 
 * Defines the contract that all website adapters must follow.
 * This ensures consistent behavior across all manga website extractors.
 */

import { MangaMetadata } from './types';

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
}

/**
 * Abstract base class for all website adapters
 * 
 * Responsibilities:
 * - Define the contract for metadata extraction
 * - Provide URL pattern matching
 * - Validate extracted metadata
 * 
 * To create a new adapter:
 * 1. Extend this class
 * 2. Implement getName(), getUrlPatterns(), and getInjectionScript()
 * 3. Optionally override canHandle() and validateMetadata() for custom logic
 */
export abstract class BaseWebsiteAdapter {
  /**
   * Get the name of the website (e.g., "AsuraScans")
   */
  abstract getName(): string;

  /**
   * Get URL patterns that identify this website
   * Used for automatic adapter selection
   * 
   * @returns Array of RegExp patterns
   */
  abstract getUrlPatterns(): RegExp[];

  /**
   * Generate JavaScript injection code for metadata extraction
   * 
   * This code runs in the WebView context and must:
   * - Extract manga metadata from the DOM
   * - Return a JSON string with all extracted data
   * - Handle errors gracefully and return error information
   * 
   * @returns JavaScript code as a string
   */
  abstract getInjectionScript(): string;

  /**
   * Detect if a given URL belongs to a manga detail page on this website
   * 
   * Override this if you need custom detection logic beyond pattern matching.
   * Default implementation uses getUrlPatterns().
   * 
   * @param url - The URL to check
   * @returns true if this adapter can handle the URL
   */
  canHandle(url: string): boolean {
    return this.getUrlPatterns().some(pattern => pattern.test(url));
  }

  /**
   * Validate extracted metadata
   * 
   * Override this to add website-specific validation logic.
   * Default implementation checks for required fields.
   * 
   * @param metadata - The extracted metadata object
   * @returns ValidationResult with isValid flag and optional errors
   */
  validateMetadata(metadata: any): ValidationResult {
    const errors: string[] = [];

    if (!metadata?.title) {
      errors.push('Missing required field: title');
    }
    if (!metadata?.sourceUrl) {
      errors.push('Missing required field: sourceUrl');
    }
    if (!metadata?.sourceWebsite) {
      errors.push('Missing required field: sourceWebsite');
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Detect if the URL is a chapter page (not a series page)
   * 
   * @param url - The URL to check
   * @returns true if this is a chapter page
   */
  isChapterPage(url: string): boolean {
    // Common patterns for chapter pages
    return /\/(chapter|ch|episode|ep|read)\/\d+/i.test(url);
  }

  /**
   * Extract series URL from a chapter URL
   * Override this for website-specific logic
   * 
   * @param chapterUrl - The chapter page URL
   * @returns The series page URL, or null if cannot be determined
   */
  getSeriesUrlFromChapter(chapterUrl: string): string | null {
    // Default implementation: remove chapter path
    const match = chapterUrl.match(/(.*)\/(chapter|ch|episode|ep|read)\/\d+/i);
    return match ? match[1] : null;
  }
}
