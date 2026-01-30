import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StatusBar, ScrollView, ActivityIndicator, Image, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { apiService, Website } from '../../services/api.service';
import { cleanMangaTitle, formatChapterDisplay } from '../../utils/mangaHelpers';
import { useLibrary, useMangaActions, useMangaMenu } from '../../hooks/useLibrary';
import { Toast, useToast } from '../../components/Toast';

export default function HomeScreen() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [activeTab, setActiveTab] = useState<'sources' | 'library'>('sources');
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loadingWebsites, setLoadingWebsites] = useState(true);
  const { toast, showToast, hideToast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteCallback, setDeleteCallback] = useState<(() => void) | null>(null);

  // Use custom hooks for library management
  const library = useLibrary((error) => showToast(error, 'error'));
  const mangaMenu = useMangaMenu();
  const mangaActions = useMangaActions(
    (message) => {
      library.loadLibrary();
      mangaMenu.closeAll();
      showToast(message, 'success');
    },
    (message) => showToast(message, 'error'),
    (title, message, onYes) => {
      setDeleteCallback(() => onYes);
      setShowDeleteConfirm(true);
    }
  );

  useEffect(() => {
    loadWebsites();
  }, []);

  const loadWebsites = async () => {
    try {
      setLoadingWebsites(true);
      const data = await apiService.getWebsites();
      setWebsites(data);
    } catch (error) {
      console.log('Failed to load websites:', error);
    } finally {
      setLoadingWebsites(false);
    }
  };

  const handleLogout = async () => {
    console.log('Logging out...');
    await logout();
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

  const handleOpenManga = (item: typeof library.filteredLibrary[0]) => {
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

  const handleDeleteManga = async () => {
    if (!mangaMenu.selectedManga) return;
    await mangaActions.deleteManga(
      mangaMenu.selectedManga._id,
      cleanMangaTitle(mangaMenu.selectedManga.manga.title)
    );
  };

  const handleCategorySelect = async (categoryId: string) => {
    if (!mangaMenu.selectedManga) return;
    await mangaActions.changeMangaCategory(
      mangaMenu.selectedManga._id,
      categoryId,
      cleanMangaTitle(mangaMenu.selectedManga.manga.title)
    );
    mangaMenu.closeAll();
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
          className={`flex-1 py-3 mr-2 rounded-xl items-center ${activeTab === 'sources' ? 'bg-[#6366F1]' : 'bg-[#2C2C2E]'
            }`}
          onPress={() => setActiveTab('sources')}
          activeOpacity={0.8}
        >
          <Text className={`font-semibold ${activeTab === 'sources' ? 'text-white' : 'text-gray-400'
            }`}>
            Sources
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 ml-2 rounded-xl items-center ${activeTab === 'library' ? 'bg-[#6366F1]' : 'bg-[#2C2C2E]'
            }`}
          onPress={() => setActiveTab('library')}
          activeOpacity={0.8}
        >
          <Text className={`font-semibold ${activeTab === 'library' ? 'text-white' : 'text-gray-400'
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
                className={`mr-2 px-4 py-2 rounded-full ${library.selectedCategory === 'all'
                  ? 'bg-[#6366F1]'
                  : 'bg-[#2C2C2E]'
                  }`}
                onPress={() => library.setSelectedCategory('all')}
                activeOpacity={0.8}
              >
                <Text className={`font-semibold text-sm ${library.selectedCategory === 'all'
                  ? 'text-white'
                  : 'text-gray-400'
                  }`}>
                  All ({library.library.length})
                </Text>
              </TouchableOpacity>

              {/* Individual Categories */}
              {library.categories.map((category) => (
                <TouchableOpacity
                  key={category._id}
                  className={`mr-2 px-4 py-2 rounded-full ${library.selectedCategory === category._id
                    ? 'bg-[#6366F1]'
                    : 'bg-[#2C2C2E]'
                    }`}
                  onPress={() => library.setSelectedCategory(category._id)}
                  activeOpacity={0.8}
                >
                  <Text className={`font-semibold text-sm ${library.selectedCategory === category._id
                    ? 'text-white'
                    : 'text-gray-400'
                    }`}>
                    {category.name} ({library.getCategoryCount(category._id)})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text className="text-gray-400 text-sm mb-4">
              {library.filteredLibrary.length} manga {library.selectedCategory !== 'all' ? 'in this category' : 'in your collection'}
            </Text>

            {library.loading ? (
              <View className="py-12 items-center">
                <ActivityIndicator size="large" color="#6366F1" />
                <Text className="text-gray-400 mt-4">Loading library...</Text>
              </View>
            ) : library.filteredLibrary.length === 0 ? (
              <View className="items-center justify-center py-12">
                <Text className="text-gray-400 text-center mb-2">
                  {library.selectedCategory !== 'all' ? 'No manga in this category' : 'Your library is empty'}
                </Text>
                <Text className="text-gray-500 text-sm text-center">
                  {library.selectedCategory !== 'all'
                    ? 'Add manga to this category or select another'
                    : 'Browse sources and add manga to get started'}
                </Text>
              </View>
            ) : (
              library.filteredLibrary.map((item) => (
                <TouchableOpacity
                  key={item._id}
                  className="bg-[#2C2C2E] rounded-xl mb-3 overflow-hidden"
                  activeOpacity={0.8}
                  onPress={() => handleOpenManga(item)}
                  onLongPress={() => mangaMenu.openOptionsMenu(item)}
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
        visible={mangaMenu.showOptionsMenu}
        transparent
        animationType="fade"
        onRequestClose={mangaMenu.closeOptionsMenu}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={mangaMenu.closeOptionsMenu}
          />
          <View className="bg-[#1C1C1E] rounded-t-3xl overflow-hidden" onStartShouldSetResponder={() => true}>
            {/* Handle Bar */}
            <View className="items-center py-3">
              <View className="w-12 h-1 bg-white/20 rounded-full" />
            </View>

            {/* Title */}
            <View className="px-6 pb-4">
              <Text className="text-white font-bold text-xl" numberOfLines={2}>
                {mangaMenu.selectedManga && cleanMangaTitle(mangaMenu.selectedManga.manga.title)}
              </Text>
            </View>

            {/* Options */}
            <View className="px-4 pb-6">
              <TouchableOpacity
                className="flex-row items-center justify-center bg-[#2C2C2E] px-4 py-4 rounded-xl mb-3 active:bg-[#3C3C3E]"
                onPress={mangaMenu.openCategoryModal}
                activeOpacity={0.8}
              >
                <Text className="text-2xl mr-3">📁</Text>
                <Text className="text-white text-base font-medium">Change Category</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center justify-center bg-[#2C2C2E] px-4 py-4 rounded-xl mb-3 active:bg-[#3C3C3E]"
                onPress={handleDeleteManga}
                activeOpacity={0.8}
              >
                <Text className="text-2xl mr-3">🗑️</Text>
                <Text className="text-red-400 text-base font-medium">Remove from Library</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-[#2C2C2E] px-4 py-4 rounded-xl active:bg-[#3C3C3E]"
                onPress={mangaMenu.closeOptionsMenu}
                activeOpacity={0.8}
              >
                <Text className="text-gray-400 text-base text-center font-semibold">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Category Selection Modal */}
      <Modal
        visible={mangaMenu.showCategoryModal}
        transparent
        animationType="fade"
        onRequestClose={mangaMenu.closeCategoryModal}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={mangaMenu.closeCategoryModal}
          />
          <View className="bg-[#1C1C1E] rounded-t-3xl max-h-[80%] overflow-hidden" onStartShouldSetResponder={() => true}>
            {/* Handle Bar */}
            <View className="items-center py-3">
              <View className="w-12 h-1 bg-white/20 rounded-full" />
            </View>

            {/* Title */}
            <View className="px-6 pb-4">
              <Text className="text-white font-bold text-xl">Select Category</Text>
            </View>

            <ScrollView className="px-4 pb-6">
              {library.categories.map((category) => (
                <TouchableOpacity
                  key={category._id}
                  className="flex-row items-center justify-between bg-[#2C2C2E] px-4 py-4 rounded-xl mb-3 active:bg-[#3C3C3E]"
                  onPress={() => handleCategorySelect(category._id)}
                  activeOpacity={0.8}
                >
                  <Text className="text-white text-base font-medium">{category.name}</Text>
                  {mangaMenu.selectedManga?.category._id === category._id && (
                    <View className="bg-[#6366F1] w-6 h-6 rounded-full items-center justify-center">
                      <Text className="text-white text-sm font-bold">✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View className="px-4 pb-6">
              <TouchableOpacity
                className="bg-[#2C2C2E] px-4 py-4 rounded-xl active:bg-[#3C3C3E]"
                onPress={mangaMenu.closeCategoryModal}
                activeOpacity={0.8}
              >
                <Text className="text-gray-400 text-base text-center font-semibold">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={() => setShowDeleteConfirm(false)}
          />
          <View className="bg-[#1C1C1E] rounded-t-3xl overflow-hidden" onStartShouldSetResponder={() => true}>
            {/* Handle Bar */}
            <View className="items-center py-3">
              <View className="w-12 h-1 bg-white/20 rounded-full" />
            </View>

            {/* Content */}
            <View className="px-6 pb-6">
              <Text className="text-white font-bold text-xl mb-3">Delete Manga</Text>
              <Text className="text-gray-400 text-base leading-6 mb-6">
                Are you sure you want to remove "{mangaMenu.selectedManga && cleanMangaTitle(mangaMenu.selectedManga.manga.title)}" from your library?
              </Text>

              <View className="flex-row gap-4">
                <TouchableOpacity
                  className="flex-1 bg-[#2C2C2E] px-4 py-4 rounded-xl active:bg-[#3C3C3E]"
                  onPress={() => setShowDeleteConfirm(false)}
                  activeOpacity={0.8}
                >
                  <Text className="text-gray-400 text-base text-center font-semibold">Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 bg-red-500/20 px-4 py-4 rounded-xl active:bg-red-500/30"
                  onPress={() => {
                    setShowDeleteConfirm(false);
                    deleteCallback?.();
                  }}
                  activeOpacity={0.8}
                >
                  <Text className="text-red-400 text-base text-center font-bold">Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </View>
  );
}
