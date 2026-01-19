/**
 * Custom Hooks for Library Management
 * 
 * Separates library concerns from UI components
 */

import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { apiService, UserManga, Category } from '../services/api.service';

/**
 * Hook for managing library data and filtering
 */
export function useLibrary(onError?: (message: string) => void) {
  const [library, setLibrary] = useState<UserManga[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  // Load library and categories
  const loadLibrary = useCallback(async () => {
    try {
      setLoading(true);
      const [libraryData, categoriesData] = await Promise.all([
        apiService.getUserLibrary(),
        apiService.getCategories(),
      ]);
      setLibrary(libraryData);
      setCategories(categoriesData);
    } catch (error) {
      console.log('[useLibrary] Failed to load library:', error);
      onError?.('Failed to load library');
    } finally {
      setLoading(false);
    }
  }, []); // Remove onError from dependencies to prevent infinite loop

  // Auto-reload library when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadLibrary();
    }, [loadLibrary])
  );

  // Filter library by category
  const filteredLibrary = selectedCategory === 'all'
    ? library
    : library.filter((item) => item.category._id === selectedCategory);

  // Get manga count per category
  const getCategoryCount = (categoryId: string): number => {
    return library.filter((item) => item.category._id === categoryId).length;
  };

  return {
    library,
    filteredLibrary,
    categories,
    selectedCategory,
    setSelectedCategory,
    loading,
    loadLibrary,
    getCategoryCount,
  };
}

/**
 * Hook for managing manga actions (delete, change category, etc.)
 */
export function useMangaActions(
  onSuccess?: (message: string) => void,
  onError?: (message: string) => void,
  onConfirm?: (title: string, message: string, onYes: () => void) => void
) {
  const [actionInProgress, setActionInProgress] = useState(false);

  const deleteManga = async (mangaId: string, mangaTitle: string) => {
    return new Promise<boolean>((resolve) => {
      const performDelete = async () => {
        try {
          setActionInProgress(true);
          await apiService.deleteMangaFromLibrary(mangaId);
          onSuccess?.('Manga removed from library');
          resolve(true);
        } catch (error) {
          console.log('[useMangaActions] Failed to delete manga:', error);
          onError?.('Failed to remove manga from library');
          resolve(false);
        } finally {
          setActionInProgress(false);
        }
      };

      if (onConfirm) {
        onConfirm(
          'Delete Manga',
          `Are you sure you want to remove "${mangaTitle}" from your library?`,
          performDelete
        );
      } else {
        performDelete();
      }
    });
  };

  const changeMangaCategory = async (
    mangaId: string,
    categoryId: string,
    mangaTitle: string
  ) => {
    try {
      setActionInProgress(true);
      await apiService.updateMangaCategory(mangaId, categoryId);
      onSuccess?.(`Category updated for "${mangaTitle}"`);
      return true;
    } catch (error) {
      console.log('[useMangaActions] Failed to change category:', error);
      onError?.('Failed to update category');
      return false;
    } finally {
      setActionInProgress(false);
    }
  };

  return {
    actionInProgress,
    deleteManga,
    changeMangaCategory,
  };
}

/**
 * Hook for managing manga card actions menu
 */
export function useMangaMenu() {
  const [selectedManga, setSelectedManga] = useState<UserManga | null>(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const openOptionsMenu = (manga: UserManga) => {
    setSelectedManga(manga);
    setShowOptionsMenu(true);
  };

  const closeOptionsMenu = () => {
    setShowOptionsMenu(false);
    setSelectedManga(null);
  };

  const openCategoryModal = () => {
    setShowOptionsMenu(false);
    setShowCategoryModal(true);
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false);
  };

  const closeAll = () => {
    setShowOptionsMenu(false);
    setShowCategoryModal(false);
    setSelectedManga(null);
  };

  return {
    selectedManga,
    showOptionsMenu,
    showCategoryModal,
    openOptionsMenu,
    closeOptionsMenu,
    openCategoryModal,
    closeCategoryModal,
    closeAll,
  };
}
