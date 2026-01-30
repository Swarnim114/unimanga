/**
 * Custom Hooks for Browser WebView
 * 
 * Separates concerns and makes browser logic reusable and testable
 */

import { useState, useRef, useEffect } from 'react';
import { WebView } from 'react-native-webview';
import { metadataService } from '../utils/extractors/MetadataService';
import { MangaMetadata } from '../utils/extractors/types';
import { extractChapterNumber } from '../utils/mangaHelpers';
import { apiService } from '../services/api.service';

/**
 * Hook for managing WebView navigation state
 */
export function useWebViewNavigation(webViewRef: React.RefObject<WebView | null>) {
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [loading, setLoading] = useState(true);

  const handleNavigationStateChange = (navState: any) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
    setCurrentUrl(navState.url);
  };

  const handleBack = () => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
    }
  };

  const handleForward = () => {
    if (canGoForward && webViewRef.current) {
      webViewRef.current.goForward();
    }
  };

  const handleRefresh = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  return {
    canGoBack,
    canGoForward,
    currentUrl,
    loading,
    setLoading,
    handleNavigationStateChange,
    handleBack,
    handleForward,
    handleRefresh,
  };
}

/**
 * Hook for metadata extraction from manga pages
 */
export function useMetadataExtraction(
  webViewRef: React.RefObject<WebView | null>,
  currentUrl: string,
  showOverlay: boolean,
  onUnsupportedWebsite?: () => void,
  onExtractionFailed?: () => void
) {
  const [extractedMetadata, setExtractedMetadata] = useState<MangaMetadata | null>(null);

  // Auto-extract metadata when navigating to manga detail pages
  useEffect(() => {
    if (!currentUrl || showOverlay) return;

    if (metadataService.isMangaDetailPage(currentUrl)) {
      const timer = setTimeout(() => {
        extractMetadata(currentUrl, false);
      }, 3500); // 3.5 second delay for dynamic content

      return () => clearTimeout(timer);
    }
  }, [currentUrl, showOverlay]);

  const extractMetadata = async (url: string, isManual: boolean = false) => {
    const adapter = metadataService.getExtractorForUrl(url);

    if (!adapter) {
      if (isManual) {
        onUnsupportedWebsite?.();
      }
      return false;
    }

    const script = metadataService.getInjectionScript(url);
    if (!script) {
      if (isManual) {
        onExtractionFailed?.();
      }
      return false;
    }

    try {
      await webViewRef.current?.injectJavaScript(script);
      return true;
    } catch (error) {
      console.log('[useMetadataExtraction] Failed to inject script:', error);
      if (isManual) {
        onExtractionFailed?.();
      }
      return false;
    }
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const messageData = event.nativeEvent.data;
      console.log('[useMetadataExtraction] Received message from WebView');

      const metadata = metadataService.parseMetadata(messageData);
      if (metadata) {
        setExtractedMetadata(metadata);
        console.log('[useMetadataExtraction] Successfully extracted:', metadata.title);
      }
    } catch (error) {
      console.log('[useMetadataExtraction] Error handling message:', error);
    }
  };

  const clearMetadata = () => {
    setExtractedMetadata(null);
  };

  return {
    extractedMetadata,
    extractMetadata,
    handleWebViewMessage,
    clearMetadata,
  };
}

/**
 * Hook for tracking reading progress
 */
export function useProgressTracking(userMangaId?: string) {
  const progressUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (progressUpdateTimeoutRef.current) {
        clearTimeout(progressUpdateTimeoutRef.current);
      }
    };
  }, []);

  const updateProgress = (url: string) => {
    if (!userMangaId) return;

    // Clear any pending update
    if (progressUpdateTimeoutRef.current) {
      clearTimeout(progressUpdateTimeoutRef.current);
    }

    // Debounce progress updates (wait 2 seconds after navigation stops)
    progressUpdateTimeoutRef.current = setTimeout(async () => {
      try {
        const chapterNumber = extractChapterNumber(url);

        if (chapterNumber) {
          console.log('[useProgressTracking] Updating - Chapter:', chapterNumber);

          await apiService.updateMangaProgress(userMangaId, {
            lastReadUrl: url,
            currentChapter: chapterNumber,
            status: 'reading',
          });

          console.log('[useProgressTracking] Progress updated successfully');
        }
      } catch (error) {
        console.log('[useProgressTracking] Failed to update progress:', error);
      }
    }, 2000);
  };

  return { updateProgress };
}
