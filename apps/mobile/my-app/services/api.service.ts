import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.1.18:3000/api';

// Helper to get auth headers
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
};

export interface Website {
  _id: string;
  name: string;
  url: string;
  language: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Manga {
  _id: string;
  title: string;
  alternativeTitles: string[];
  description?: string;
  author?: string;
  artist?: string;
  coverImage?: string;
  genres: string[];
  status: 'ongoing' | 'completed' | 'hiatus' | 'cancelled';
  sourceWebsite: string;
  sourceUrl: string;
  totalChapters: number;
  lastChapterAdded?: string;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  user: string;
  color: string;
  icon: string;
  order: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserManga {
  _id: string;
  user: string;
  manga: Manga;
  category: Category;
  currentChapter: string;
  totalChaptersRead: number;
  progress: number;
  status: 'reading' | 'plan-to-read' | 'completed' | 'on-hold' | 'dropped';
  favorite: boolean;
  startedAt?: string;
  completedAt?: string;
  lastReadAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const apiService = {
  // Websites
  async getWebsites(): Promise<Website[]> {
    try {
      const config = await getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/websites`, config);
      return response.data.websites;
    } catch (error) {
      console.error('Error fetching websites:', error);
      throw error;
    }
  },

  // Library
  async getUserLibrary(filters?: {
    categoryId?: string;
    status?: string;
    favorite?: boolean;
  }): Promise<UserManga[]> {
    try {
      const config = await getAuthHeaders();
      const params = new URLSearchParams();
      if (filters?.categoryId) params.append('categoryId', filters.categoryId);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.favorite !== undefined) params.append('favorite', filters.favorite.toString());
      
      const url = `${API_BASE_URL}/library${params.toString() ? '?' + params.toString() : ''}`;
      const response = await axios.get(url, config);
      return response.data.library;
    } catch (error) {
      console.error('Error fetching library:', error);
      throw error;
    }
  },

  async addMangaToLibrary(data: {
    mangaId?: string;
    title?: string;
    description?: string;
    author?: string;
    artist?: string;
    coverImage?: string;
    sourceWebsite?: string;
    sourceUrl?: string;
    genres?: string[];
    mangaStatus?: 'ongoing' | 'completed' | 'hiatus' | 'cancelled';
    totalChapters?: number;
    alternativeTitles?: string[];
    lastChapterAdded?: string;
    rating?: number;
    categoryId: string;
    readingStatus?: 'reading' | 'plan-to-read' | 'completed' | 'on-hold' | 'dropped';
  }): Promise<UserManga> {
    try {
      const config = await getAuthHeaders();
      const response = await axios.post(`${API_BASE_URL}/library`, data, config);
      return response.data.userManga;
    } catch (error) {
      console.error('Error adding manga to library:', error);
      throw error;
    }
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    try {
      const config = await getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/categories`, config);
      return response.data.categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  async createCategory(data: {
    name: string;
    color?: string;
    icon?: string;
  }): Promise<Category> {
    try {
      const config = await getAuthHeaders();
      const response = await axios.post(`${API_BASE_URL}/categories`, data, config);
      return response.data.category;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  async updateCategory(id: string, data: {
    name?: string;
    color?: string;
    icon?: string;
    order?: number;
  }): Promise<Category> {
    try {
      const config = await getAuthHeaders();
      const response = await axios.put(`${API_BASE_URL}/categories/${id}`, data, config);
      return response.data.category;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  async deleteCategory(id: string): Promise<void> {
    try {
      const config = await getAuthHeaders();
      await axios.delete(`${API_BASE_URL}/categories/${id}`, config);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },
};
