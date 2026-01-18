import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StatusBar, ScrollView, ActivityIndicator, Image, Alert, Modal } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { authService } from '../../services/auth.service';
import { apiService, Website, UserManga } from '../../services/api.service';
import { cleanMangaTitle, formatChapterDisplay } from '../../utils/mangaHelpers';

export default function HomeScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'sources' | 'library'>('sources');
  const [websites, setWebsites] = useState<Website[]>([]);
  const [library, setLibrary] = useState<UserManga[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [loadingWebsites, setLoadingWebsites] = useState(true);
  const [loadingLibrary, setLoadingLibrary] = useState(true);
  const [selectedManga, setSelectedManga] = useState<UserManga | null>(null);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  useEffect(() => {
    loadWebsites();
    loadLibrary();
    loadCategories();
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

  const loadCategories = async () => {
    try {
      const data = await apiService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
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

  const handleOpenManga = (item: UserManga) => {
    // Open browser at the last read URL or the manga's main URL
    const urlToOpen = item.lastReadUrl || item.manga.sourceUrl;
    const websiteInfo = typeof item.manga.sourceWebsite === 'object' 
      ? item.manga.sourceWebsite 
      : null;
    
    router.push({
      pathname: '/(main)/browser',
      params: {
        name: websiteInfo?.name || 'Manga',
        url: urlToOpen,
        color: websiteInfo?.color || '#6366F1',
        mangaId: item.manga._id,
        userMangaId: item._id,
      },
    });
  };

  // Filter library by selected category
  const filteredLibrary = selectedCategoryId 
    ? library.filter(item => item.category._id === selectedCategoryId)
    : library;

  // Count manga per category
  const getCategoryCount = (categoryId: string) => {
    return library.filter(item => item.category._id === categoryId).length;
  };

  const handleLongPressManga = (item: UserManga) => {
    setSelectedManga(item);
    setShowOptionsModal(true);
  };

  const handleDeleteManga = async () => {
    if (!selectedManga) return;

    Alert.alert(
      'Delete Manga',
      `Are you sure you want to remove "${cleanMangaTitle(selectedManga.manga.title)}" from your library?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteMangaFromLibrary(selectedManga._id);
              setShowOptionsModal(false);
              setSelectedManga(null);
              await loadLibrary();
              Alert.alert('Success', 'Manga removed from library');
            } catch (error) {
              console.error('Failed to delete manga:', error);
              Alert.alert('Error', 'Failed to remove manga from library');
            }
          },
        },
      ]
    );
  };

  const handleChangeCategory = () => {
    setShowOptionsModal(false);
    setShowCategoryModal(true);
  };

  const handleCategorySelect = async (categoryId: string) => {
    if (!selectedManga) return;

    try {
      await apiService.updateMangaCategory(selectedManga._id, categoryId);
      setShowCategoryModal(false);
      setSelectedManga(null);
      await loadLibrary();
      Alert.alert('Success', 'Category updated');
    } catch (error) {
      console.error('Failed to update category:', error);
      Alert.alert('Error', 'Failed to update category');
    }
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
            
            {/* Category Filter Tabs */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              className="mb-4"
            >
              {/* All Categories */}
              <TouchableOpacity
                className={`mr-2 px-4 py-2 rounded-full ${
                  selectedCategoryId === null 
                    ? 'bg-[#6366F1]' 
                    : 'bg-[#2C2C2E]'
                }`}
                onPress={() => setSelectedCategoryId(null)}
                activeOpacity={0.8}
              >
                <Text className={`font-semibold text-sm ${
                  selectedCategoryId === null 
                    ? 'text-white' 
                    : 'text-gray-400'
                }`}>
                  All ({library.length})
                </Text>
              </TouchableOpacity>

              {/* Individual Categories */}
              {categories.map((category) => (
                <TouchableOpacity
                  key={category._id}
                  className={`mr-2 px-4 py-2 rounded-full ${
                    selectedCategoryId === category._id 
                      ? 'bg-[#6366F1]' 
                      : 'bg-[#2C2C2E]'
                  }`}
                  onPress={() => setSelectedCategoryId(category._id)}
                  activeOpacity={0.8}
                >
                  <Text className={`font-semibold text-sm ${
                    selectedCategoryId === category._id 
                      ? 'text-white' 
                      : 'text-gray-400'
                  }`}>
                    {category.name} ({getCategoryCount(category._id)})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text className="text-gray-400 text-sm mb-4">
              {filteredLibrary.length} manga {selectedCategoryId ? 'in this category' : 'in your collection'}
            </Text>
            
            {loadingLibrary ? (
              <View className="py-12 items-center">
                <ActivityIndicator size="large" color="#6366F1" />
                <Text className="text-gray-400 mt-4">Loading library...</Text>
              </View>
            ) : filteredLibrary.length === 0 ? (
              <View className="items-center justify-center py-12">
                <Text className="text-gray-400 text-center mb-2">
                  {selectedCategoryId ? 'No manga in this category' : 'Your library is empty'}
                </Text>
                <Text className="text-gray-500 text-sm text-center">
                  {selectedCategoryId 
                    ? 'Add manga to this category or select another' 
                    : 'Browse sources and add manga to get started'}
                </Text>
              </View>
            ) : (
              filteredLibrary.map((item) => (
                <TouchableOpacity
                  key={item._id}
                  className="bg-[#2C2C2E] rounded-xl mb-3 overflow-hidden"
                  activeOpacity={0.8}
                  onPress={() => handleOpenManga(item)}
                  onLongPress={() => handleLongPressManga(item)}
                >
                  <View className="flex-row p-4">
                    {/* Cover Image or Placeholder */}
                    {item.manga.coverImage ? (
                      <Image
                        source={{ uri: item.manga.coverImage }}
                        className="w-16 h-24 rounded-lg mr-4"
                        resizeMode="cover"
                      />
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
                        <Text className="text-white font-bold text-base mb-1" numberOfLines={2}>
                          {cleanMangaTitle(item.manga.title)}
                        </Text>
                        <Text className="text-gray-400 text-xs mb-2">
                          {item.category.name}
                        </Text>
                      </View>
                      
                      <View>
                        <Text className="text-gray-400 text-xs">
                          {formatChapterDisplay(item.currentChapter)}
                        </Text>
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

      {/* Options Modal */}
      <Modal
        visible={showOptionsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptionsModal(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center"
          activeOpacity={1}
          onPress={() => setShowOptionsModal(false)}
        >
          <View className="bg-[#2C2C2E] rounded-2xl w-4/5 overflow-hidden" onStartShouldSetResponder={() => true}>
            <View className="p-4 border-b border-white/10">
              <Text className="text-white font-bold text-lg" numberOfLines={2}>
                {selectedManga && cleanMangaTitle(selectedManga.manga.title)}
              </Text>
            </View>

            <TouchableOpacity
              className="px-6 py-4 border-b border-white/5 active:bg-white/5"
              onPress={handleChangeCategory}
              activeOpacity={0.8}
            >
              <Text className="text-white text-base">📁 Change Category</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="px-6 py-4 active:bg-white/5"
              onPress={handleDeleteManga}
              activeOpacity={0.8}
            >
              <Text className="text-red-500 text-base">🗑️ Remove from Library</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="px-6 py-4 border-t border-white/10 active:bg-white/5"
              onPress={() => setShowOptionsModal(false)}
              activeOpacity={0.8}
            >
              <Text className="text-gray-400 text-base text-center">Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center"
          activeOpacity={1}
          onPress={() => setShowCategoryModal(false)}
        >
          <View className="bg-[#2C2C2E] rounded-2xl w-4/5 max-h-96 overflow-hidden" onStartShouldSetResponder={() => true}>
            <View className="p-4 border-b border-white/10">
              <Text className="text-white font-bold text-lg">Select Category</Text>
            </View>

            <ScrollView className="max-h-80">
              {categories.map((category) => (
                <TouchableOpacity
                  key={category._id}
                  className="px-6 py-4 border-b border-white/5 active:bg-white/5"
                  onPress={() => handleCategorySelect(category._id)}
                  activeOpacity={0.8}
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-white text-base">{category.name}</Text>
                    {selectedManga?.category._id === category._id && (
                      <Text className="text-[#6366F1]">✓</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              className="px-6 py-4 border-t border-white/10 active:bg-white/5"
              onPress={() => setShowCategoryModal(false)}
              activeOpacity={0.8}
            >
              <Text className="text-gray-400 text-base text-center">Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
