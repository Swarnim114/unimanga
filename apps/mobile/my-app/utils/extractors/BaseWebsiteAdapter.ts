/**
 * ADAPTER PATTERN - Base Abstract Class
 * 
 * Defines the contract that all website adapters must follow.
 * This ensures consistent behavior across all manga website extractors.
 */

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
   * Get the name of the website (e.g., "MangaDex")
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
   * @returns true if metadata is valid
   */
  validateMetadata(metadata: any): boolean {
    return !!(metadata?.title && metadata?.sourceUrl && metadata?.sourceWebsite);
  }
}
