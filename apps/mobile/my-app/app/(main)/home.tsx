import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StatusBar, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { authService } from '../../services/auth.service';
import { apiService, Website, UserManga } from '../../services/api.service';

export default function HomeScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'sources' | 'library'>('sources');
  const [websites, setWebsites] = useState<Website[]>([]);
  const [library, setLibrary] = useState<UserManga[]>([]);
  const [loadingWebsites, setLoadingWebsites] = useState(true);
  const [loadingLibrary, setLoadingLibrary] = useState(true);

  useEffect(() => {
    loadWebsites();
    loadLibrary();
  }, []);

  // Reload library when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadLibrary();
    }, [])
  );

  const loadWebsites = async () => {
    try {
      setLoadingWebsites(true);
      const data = await apiService.getWebsites();
      setWebsites(data);
    } catch (error) {
      console.error('Failed to load websites:', error);
    } finally {
      setLoadingWebsites(false);
    }
  };

  const loadLibrary = async () => {
    try {
      setLoadingLibrary(true);
      const data = await apiService.getUserLibrary();
      setLibrary(data);
    } catch (error) {
      console.error('Failed to load library:', error);
    } finally {
      setLoadingLibrary(false);
    }
  };

  const handleLogout = async () => {
    console.log('Logging out...');
    await authService.logout();
    router.replace('/(auth)/login');
  };

  const handleOpenWebsite = (website: Website) => {
    router.push({
      pathname: '/(main)/browser',
      params: {
        name: website.name,
        url: website.url,
        color: website.color,
        websiteId: website._id,
      },
    });
  };

  return (
    <View className="flex-1 bg-[#1C1C1E]">
      <StatusBar barStyle="light-content" backgroundColor="#1C1C1E" />
      
      {/* Header */}
      <View className="px-6 pt-12 pb-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-3xl font-bold text-white">UniManga</Text>
          <TouchableOpacity
            className="bg-[#2C2C2E] px-4 py-2 rounded-lg"
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text className="text-[#6366F1] font-semibold text-sm">
              Logout
            </Text>
          </TouchableOpacity>
        </View>
        <Text className="text-gray-400 text-base">
          Read manga from multiple sources
        </Text>
      </View>

      {/* Tab Switcher */}
      <View className="flex-row px-6 mb-4">
        <TouchableOpacity
          className={`flex-1 py-3 mr-2 rounded-xl items-center ${
            activeTab === 'sources' ? 'bg-[#6366F1]' : 'bg-[#2C2C2E]'
          }`}
          onPress={() => setActiveTab('sources')}
          activeOpacity={0.8}
        >
          <Text className={`font-semibold ${
            activeTab === 'sources' ? 'text-white' : 'text-gray-400'
          }`}>
            Sources
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 ml-2 rounded-xl items-center ${
            activeTab === 'library' ? 'bg-[#6366F1]' : 'bg-[#2C2C2E]'
          }`}
          onPress={() => setActiveTab('library')}
          activeOpacity={0.8}
        >
          <Text className={`font-semibold ${
            activeTab === 'library' ? 'text-white' : 'text-gray-400'
          }`}>
            Library
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        {activeTab === 'sources' ? (
          /* Manga Sources Section */
          <View className="px-6">
            <Text className="text-white text-xl font-bold mb-4">
              Browse Manga Sources
            </Text>
            <Text className="text-gray-400 text-sm mb-4">
              Select a source to browse and read manga
            </Text>
            
            {loadingWebsites ? (
              <View className="py-12 items-center">
                <ActivityIndicator size="large" color="#6366F1" />
                <Text className="text-gray-400 mt-4">Loading sources...</Text>
              </View>
            ) : websites.length === 0 ? (
              <View className="py-12 items-center">
                <Text className="text-gray-400 text-center">
                  No manga sources available
                </Text>
              </View>
            ) : (
              websites.map((source) => (
                <TouchableOpacity
                  key={source._id}
                  className="bg-[#2C2C2E] rounded-xl p-4 mb-3 flex-row items-center justify-between"
                  onPress={() => handleOpenWebsite(source)}
                  activeOpacity={0.8}
                >
                  <View className="flex-row items-center flex-1">
                    <View 
                      className="w-12 h-12 rounded-full items-center justify-center mr-4"
                      style={{ backgroundColor: source.color }}
                    >
                      <Text className="text-white font-bold text-lg">
                        {source.name.charAt(0)}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-semibold text-base mb-1">
                        {source.name}
                      </Text>
                      <Text className="text-gray-400 text-xs">
                        {source.language} • {source.url.replace('https://', '')}
                      </Text>
                    </View>
                  </View>
                  <View className="bg-[#1C1C1E] px-3 py-1 rounded-lg">
                    <Text className="text-[#6366F1] text-xs font-semibold">
                      Open
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        ) : (
          /* Library Section */
          <View className="px-6">
            <Text className="text-white text-xl font-bold mb-4">
              My Library
            </Text>
            <Text className="text-gray-400 text-sm mb-4">
              {library.length} manga in your collection
            </Text>
            
            {loadingLibrary ? (
              <View className="py-12 items-center">
                <ActivityIndicator size="large" color="#6366F1" />
                <Text className="text-gray-400 mt-4">Loading library...</Text>
              </View>
            ) : library.length === 0 ? (
              <View className="items-center justify-center py-12">
                <Text className="text-gray-400 text-center mb-2">
                  Your library is empty
                </Text>
                <Text className="text-gray-500 text-sm text-center">
                  Browse sources and add manga to get started
                </Text>
              </View>
            ) : (
              library.map((item) => (
                <TouchableOpacity
                  key={item._id}
                  className="bg-[#2C2C2E] rounded-xl mb-3 overflow-hidden"
                  activeOpacity={0.8}
                >
                  <View className="flex-row p-4">
                    {/* Cover Image or Placeholder */}
                    {item.manga.coverImage ? (
                      <View className="w-16 h-24 rounded-lg mr-4 bg-[#3C3C3E]">
                        {/* TODO: Add Image component when available */}
                        <View className="w-full h-full rounded-lg items-center justify-center bg-[#6366F1]">
                          <Text className="text-white text-xs font-bold text-center px-2">
                            {item.manga.title.split(' ')[0]}
                          </Text>
                        </View>
                      </View>
                    ) : (
                      <View className="w-16 h-24 rounded-lg mr-4 items-center justify-center bg-[#6366F1]">
                        <Text className="text-white text-xs font-bold text-center px-2">
                          {item.manga.title.split(' ')[0]}
                        </Text>
                      </View>
                    )}
                    
                    {/* Manga Info */}
                    <View className="flex-1 justify-between">
                      <View>
                        <Text className="text-white font-bold text-base mb-1">
                          {item.manga.title}
                        </Text>
                        <Text className="text-gray-400 text-xs mb-2">
                          {item.category.name}
                        </Text>
                      </View>
                      
                      <View>
                        <View className="flex-row items-center justify-between mb-2">
                          <Text className="text-gray-400 text-xs">
                            Chapter {item.currentChapter} / {item.manga.totalChapters || '?'}
                          </Text>
                          <Text className="text-[#6366F1] text-xs font-semibold">
                            {item.progress}%
                          </Text>
                        </View>
                        
                        {/* Progress Bar */}
                        <View className="h-1.5 bg-[#1C1C1E] rounded-full overflow-hidden">
                          <View 
                            className="h-full bg-[#6366F1] rounded-full"
                            style={{ width: `${item.progress}%` }}
                          />
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
        
        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
