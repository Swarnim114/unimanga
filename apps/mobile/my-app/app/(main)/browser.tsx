import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import ReaderOverlay from '../../components/ReaderOverlay';
import { metadataService } from '../../utils/extractors/MetadataService';
import { 
  useWebViewNavigation, 
  useMetadataExtraction, 
  useProgressTracking 
} from '../../hooks/useWebView';
import { Toast, useToast } from '../../components/Toast';

export default function BrowserScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);
  
  // Component state
  const [showOverlay, setShowOverlay] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  // URL params
  const websiteName = params.name as string || 'Browser';
  let websiteUrl = params.url as string;
  const websiteColor = params.color as string || '#6366F1';
  const userMangaId = params.userMangaId as string;
  
  // Convert mobile Webtoons URLs to desktop version (more compatible)
  if (websiteUrl && websiteUrl.includes('m.webtoons.com')) {
    websiteUrl = websiteUrl.replace('m.webtoons.com', 'www.webtoons.com');
  }

  // Custom hooks for separation of concerns
  const navigation = useWebViewNavigation(webViewRef);
  const metadata = useMetadataExtraction(
    webViewRef, 
    navigation.currentUrl, 
    showOverlay,
    () => showToast('This website is not supported yet', 'warning'),
    () => showToast('Failed to extract manga information', 'error')
  );
  const progress = useProgressTracking(userMangaId);

  // Handle navigation changes
  const handleNavigationStateChange = (navState: any) => {
    navigation.handleNavigationStateChange(navState);
    progress.updateProgress(navState.url);
  };

  // Handle "+ Library" button click
  const handleAddToLibrary = async () => {
    if (!navigation.currentUrl) return;

    // Check if current page is supported
    if (!metadataService.isMangaDetailPage(navigation.currentUrl)) {
      showToast('Please navigate to a manga detail page first', 'warning');
      return;
    }

    // Show overlay if we already have valid metadata
    if (metadata.extractedMetadata?.title) {
      setShowOverlay(true);
      return;
    }

    // Extract metadata manually
    console.log('[Browser] Manually extracting metadata...');
    const success = await metadata.extractMetadata(navigation.currentUrl, true);
    
    if (success) {
      // Wait a bit for the message, then show overlay or alert
      setTimeout(() => {
        if (metadata.extractedMetadata?.title) {
          setShowOverlay(true);
        } else {
          showToast('Could not extract manga information. Please try again.', 'error');
        }
      }, 1000);
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
                {navigation.currentUrl || websiteUrl}
              </Text>
            </View>
          </View>
        </View>

        {/* Navigation Controls */}
        <View className="flex-row items-center justify-between mt-2">
          <View className="flex-row items-center">
            <TouchableOpacity
              className={`mr-3 px-4 py-2 rounded-lg ${
                navigation.canGoBack ? 'bg-white/20' : 'bg-white/10'
              }`}
              onPress={navigation.handleBack}
              disabled={!navigation.canGoBack}
              activeOpacity={0.8}
            >
              <Text className={`font-semibold ${
                navigation.canGoBack ? 'text-white' : 'text-white/40'
              }`}>
                ←
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className={`mr-3 px-4 py-2 rounded-lg ${
                navigation.canGoForward ? 'bg-white/20' : 'bg-white/10'
              }`}
              onPress={navigation.handleForward}
              disabled={!navigation.canGoForward}
              activeOpacity={0.8}
            >
              <Text className={`font-semibold ${
                navigation.canGoForward ? 'text-white' : 'text-white/40'
              }`}>
                →
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white/20 px-4 py-2 rounded-lg"
              onPress={navigation.handleRefresh}
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
      {navigation.loading && (
        <View className="absolute top-1/2 left-1/2 -ml-5 -mt-5 z-10">
          <ActivityIndicator size="large" color={websiteColor} />
        </View>
      )}

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ 
          uri: websiteUrl,
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
          }
        }}
        style={{ flex: 1 }}
        onLoadStart={() => navigation.setLoading(true)}
        onLoadEnd={() => navigation.setLoading(false)}
        onNavigationStateChange={handleNavigationStateChange}
        onMessage={metadata.handleWebViewMessage}
        javaScriptEnabled
        domStorageEnabled
        userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        thirdPartyCookiesEnabled
        sharedCookiesEnabled
        cacheEnabled
        incognito={false}
        setSupportMultipleWindows={false}
        allowsInlineMediaPlayback
      />

      {/* Reader Overlay */}
      <ReaderOverlay
        visible={showOverlay}
        metadata={metadata.extractedMetadata}
        onClose={() => setShowOverlay(false)}
        onSuccess={() => {
          setShowOverlay(false);
          metadata.clearMetadata();
        }}
      />

      {/* Toast Notifications */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </View>
  );
}
