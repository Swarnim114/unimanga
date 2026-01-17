import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import ReaderOverlay from '../../components/ReaderOverlay';
import { 
  getExtractorForUrl, 
  isMangaDetailPage, 
  parseMetadata,
  MangaMetadata 
} from '../../utils/metadataExtractors';

export default function BrowserScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [showOverlay, setShowOverlay] = useState(false);
  const [extractedMetadata, setExtractedMetadata] = useState<MangaMetadata | null>(null);
  
  const webViewRef = React.useRef<WebView>(null);

  const websiteName = params.name as string || 'Browser';
  const websiteUrl = params.url as string;
  const websiteColor = params.color as string || '#6366F1';

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

  const handleAddToLibrary = async () => {
    if (!currentUrl) return;

    // Check if current page is a manga detail page
    if (!isMangaDetailPage(currentUrl)) {
      alert('Please navigate to a manga detail page first');
      return;
    }

    // Show overlay if we already have valid metadata
    if (extractedMetadata && extractedMetadata.title) {
      setShowOverlay(true);
      return;
    }

    // Get the appropriate extractor and extract metadata
    const extractor = getExtractorForUrl(currentUrl);
    if (!extractor) {
      alert('This website is not supported yet');
      return;
    }

    console.log('Manually extracting metadata...');

    try {
      // Extract metadata with immediate execution (no delay)
      const baseScript = extractor.getInjectionScript();
      const script = `
        (function() {
          try {
            const result = ${baseScript};
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(result);
            }
            return result;
          } catch(e) {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ error: e.message }));
            }
            return JSON.stringify({ error: e.message });
          }
        })();
        true;
      `;
      
      await webViewRef.current?.injectJavaScript(script);
      
      // Wait a bit for the message, then show overlay or alert
      setTimeout(() => {
        if (extractedMetadata && extractedMetadata.title) {
          setShowOverlay(true);
        } else {
          alert('Could not extract manga information. The page may not be fully loaded yet. Please wait a moment and try again.');
        }
      }, 1000);
    } catch (error) {
      console.error('Failed to extract metadata:', error);
      alert('Failed to extract manga information');
    }
  };

  const handleNavigationStateChange = async (navState: any) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
    setCurrentUrl(navState.url);

    // Check if we're on a manga detail page and extract metadata
    if (isMangaDetailPage(navState.url)) {
      const extractor = getExtractorForUrl(navState.url);
      if (extractor && webViewRef.current) {
        // Delay extraction to ensure page is fully loaded (increased delay)
        setTimeout(async () => {
          try {
            // Get the base injection script
            const baseScript = extractor.getInjectionScript();
            
            // Wrap it to post message to React Native
            const script = `
              (function() {
                try {
                  // Execute the extraction
                  const result = ${baseScript};
                  
                  // Post the result back to React Native
                  if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(result);
                  }
                } catch(e) {
                  if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({ error: e.message }));
                  }
                }
              })();
              true;
            `;
            
            await webViewRef.current?.injectJavaScript(script);
          } catch (error) {
            console.error('Failed to extract metadata:', error);
          }
        }, 3500); // Increased to 3.5 seconds for dynamic content
      }
    }
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const messageData = event.nativeEvent.data;
      console.log('Received WebView message:', messageData);
      
      const metadata = parseMetadata(messageData);
      if (metadata) {
        setExtractedMetadata(metadata);
        console.log('Successfully extracted metadata:', metadata.title);
      } else {
        console.log('Failed to parse metadata from message');
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
    }
  };

  return (
    <View className="flex-1 bg-[#1C1C1E]">
      <StatusBar barStyle="light-content" backgroundColor="#1C1C1E" />
      
      {/* Header */}
      <View className="px-4 pt-12 pb-3" style={{ backgroundColor: websiteColor }}>
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity
              className="mr-4 bg-white/20 px-3 py-2 rounded-lg"
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold">← Back</Text>
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-white font-bold text-lg" numberOfLines={1}>
                {websiteName}
              </Text>
              <Text className="text-white/80 text-xs" numberOfLines={1}>
                {currentUrl || websiteUrl}
              </Text>
            </View>
          </View>
        </View>

        {/* Navigation Controls */}
        <View className="flex-row items-center justify-between mt-2">
          <View className="flex-row items-center">
            <TouchableOpacity
              className={`mr-3 px-4 py-2 rounded-lg ${
                canGoBack ? 'bg-white/20' : 'bg-white/10'
              }`}
              onPress={handleBack}
              disabled={!canGoBack}
              activeOpacity={0.8}
            >
              <Text className={`font-semibold ${
                canGoBack ? 'text-white' : 'text-white/40'
              }`}>
                ←
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className={`mr-3 px-4 py-2 rounded-lg ${
                canGoForward ? 'bg-white/20' : 'bg-white/10'
              }`}
              onPress={handleForward}
              disabled={!canGoForward}
              activeOpacity={0.8}
            >
              <Text className={`font-semibold ${
                canGoForward ? 'text-white' : 'text-white/40'
              }`}>
                →
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white/20 px-4 py-2 rounded-lg"
              onPress={handleRefresh}
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold">⟳</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="bg-white/20 px-4 py-2 rounded-lg"
            onPress={handleAddToLibrary}
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">+ Library</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Loading Indicator */}
      {loading && (
        <View className="absolute top-1/2 left-1/2 -ml-5 -mt-5 z-10">
          <ActivityIndicator size="large" color={websiteColor} />
        </View>
      )}

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: websiteUrl }}
        style={{ flex: 1 }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={handleNavigationStateChange}
        onMessage={handleWebViewMessage}
        javaScriptEnabled
        domStorageEnabled
      />

      {/* Reader Overlay */}
      <ReaderOverlay
        visible={showOverlay}
        metadata={extractedMetadata}
        onClose={() => setShowOverlay(false)}
        onSuccess={() => {
          setShowOverlay(false);
          setExtractedMetadata(null);
        }}
      />
    </View>
  );
}
