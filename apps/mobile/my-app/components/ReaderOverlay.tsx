import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MangaMetadata } from '../utils/metadataExtractors';
import { apiService, Category } from '../services/api.service';
import CategorySelector from './CategorySelector';

interface ReaderOverlayProps {
  visible: boolean;
  metadata: MangaMetadata | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReaderOverlay({
  visible,
  metadata,
  onClose,
  onSuccess,
}: ReaderOverlayProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [addingToLibrary, setAddingToLibrary] = useState(false);

  useEffect(() => {
    if (visible) {
      console.log('ReaderOverlay opened, loading categories...');
      loadCategories();
    }
  }, [visible]);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const fetchedCategories = await apiService.getCategories();
      setCategories(fetchedCategories);
      
      if (fetchedCategories.length === 0) {
        console.warn('No categories found for user. User may need to create categories first.');
      }
    } catch (error: any) {
      console.error('Failed to load categories:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load categories. Please check your connection.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleAddToLibrary = () => {
    if (!metadata) return;
    setShowCategorySelector(true);
  };

  const handleCategorySelect = async (categoryId: string) => {
    if (!metadata) return;

    try {
      setAddingToLibrary(true);
      setShowCategorySelector(false);

      await apiService.addMangaToLibrary({
        title: metadata.title,
        description: metadata.description,
        author: metadata.author,
        artist: metadata.artist,
        coverImage: metadata.coverImage,
        sourceWebsite: metadata.sourceWebsite,
        sourceUrl: metadata.sourceUrl,
        genres: metadata.genres,
        mangaStatus: metadata.mangaStatus,
        totalChapters: metadata.totalChapters,
        alternativeTitles: metadata.alternativeTitles,
        lastChapterAdded: metadata.lastChapterAdded,
        rating: metadata.rating,
        categoryId,
        readingStatus: 'plan-to-read',
      });

      Alert.alert('Success', `${metadata.title} added to your library!`);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to add manga to library:', error);
      
      // Check if manga already exists
      if (error.response?.data?.message?.includes('already in your library')) {
        Alert.alert('Already Added', 'This manga is already in your library');
      } else {
        Alert.alert('Error', 'Failed to add manga to library. Please try again.');
      }
    } finally {
      setAddingToLibrary(false);
    }
  };

  if (!visible || !metadata) return null;

  return (
    <>
      {/* Main Overlay */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#1C1C1E',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          maxHeight: '80%',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 10,
        }}
      >
        {/* Handle Bar */}
        <View className="items-center py-3">
          <View className="w-12 h-1 bg-white/20 rounded-full" />
        </View>

        <ScrollView className="flex-1">
          {/* Close Button */}
          <TouchableOpacity
            className="absolute top-4 right-4 z-10 bg-black/30 w-8 h-8 rounded-full items-center justify-center"
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text className="text-white text-lg font-bold">×</Text>
          </TouchableOpacity>

          {/* Manga Info */}
          <View className="px-6 pb-6">
            {/* Cover and Title */}
            <View className="flex-row mb-4">
              {metadata.coverImage ? (
                <Image
                  source={{ uri: metadata.coverImage }}
                  className="w-24 h-32 rounded-lg mr-4"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-24 h-32 rounded-lg mr-4 bg-white/10 items-center justify-center">
                  <Text className="text-white/40 text-4xl">📚</Text>
                </View>
              )}

              <View className="flex-1">
                <Text className="text-white font-bold text-xl mb-2" numberOfLines={3}>
                  {metadata.title}
                </Text>
                
                {metadata.author && (
                  <View className="flex-row items-center mb-1">
                    <Text className="text-white/60 text-sm">✍️ </Text>
                    <Text className="text-white/80 text-sm">{metadata.author}</Text>
                  </View>
                )}

                {metadata.mangaStatus && (
                  <View className="mt-2">
                    <View
                      className="px-3 py-1 rounded-full self-start"
                      style={{
                        backgroundColor:
                          metadata.mangaStatus === 'completed'
                            ? '#10B981'
                            : metadata.mangaStatus === 'hiatus'
                            ? '#F59E0B'
                            : '#6366F1',
                      }}
                    >
                      <Text className="text-white text-xs font-semibold uppercase">
                        {metadata.mangaStatus}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Genres */}
            {metadata.genres && metadata.genres.length > 0 && (
              <View className="mb-4">
                <Text className="text-white/60 text-xs font-semibold mb-2">GENRES</Text>
                <View className="flex-row flex-wrap">
                  {metadata.genres.map((genre, index) => (
                    <View
                      key={index}
                      className="bg-white/10 px-3 py-1 rounded-full mr-2 mb-2"
                    >
                      <Text className="text-white/80 text-xs">{genre}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Description */}
            {metadata.description && (
              <View className="mb-4">
                <Text className="text-white/60 text-xs font-semibold mb-2">DESCRIPTION</Text>
                <Text className="text-white/80 text-sm leading-5" numberOfLines={6}>
                  {metadata.description}
                </Text>
              </View>
            )}

            {/* Source Info */}
            <View className="mb-4">
              <Text className="text-white/60 text-xs font-semibold mb-2">SOURCE</Text>
              <View className="bg-white/5 px-4 py-3 rounded-lg">
                <Text className="text-white/80 text-sm font-semibold mb-1">
                  {metadata.sourceWebsite}
                </Text>
                <Text className="text-white/40 text-xs" numberOfLines={1}>
                  {metadata.sourceUrl}
                </Text>
              </View>
            </View>

            {/* Additional Info */}
            <View className="flex-row flex-wrap mb-6">
              {metadata.totalChapters !== undefined && metadata.totalChapters > 0 && (
                <View className="bg-white/5 px-4 py-2 rounded-lg mr-2 mb-2">
                  <Text className="text-white/60 text-xs">Chapters</Text>
                  <Text className="text-white font-semibold">{metadata.totalChapters}</Text>
                </View>
              )}

              {metadata.rating !== undefined && metadata.rating > 0 && (
                <View className="bg-white/5 px-4 py-2 rounded-lg mr-2 mb-2">
                  <Text className="text-white/60 text-xs">Rating</Text>
                  <Text className="text-white font-semibold">
                    {metadata.rating.toFixed(1)} ⭐
                  </Text>
                </View>
              )}
            </View>

            {/* Add to Library Button */}
            <TouchableOpacity
              className="bg-[#6366F1] py-4 rounded-xl items-center active:bg-[#5558E3]"
              onPress={handleAddToLibrary}
              disabled={addingToLibrary || loadingCategories}
              activeOpacity={0.8}
            >
              {addingToLibrary ? (
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white font-bold text-lg ml-2">Adding...</Text>
                </View>
              ) : (
                <View className="flex-row items-center">
                  <Text className="text-white text-2xl mr-2">+</Text>
                  <Text className="text-white font-bold text-lg">Add to Library</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Category Selector Modal */}
      <CategorySelector
        visible={showCategorySelector}
        categories={categories}
        loading={loadingCategories}
        onSelect={handleCategorySelect}
        onClose={() => setShowCategorySelector(false)}
        onCategoryCreated={loadCategories}
      />
    </>
  );
}
