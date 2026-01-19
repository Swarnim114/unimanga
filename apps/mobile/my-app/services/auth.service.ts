import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Production API URL (Render deployment)
const API_URL = 'https://unimanga.onrender.com/api/auth';

interface AuthResponse {
  message: string;
  token: string;
  user?: any;
  existingUser?: any;
}

interface ApiError {
  message: string;
}

export const authService = {
  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/register`, {
        username,
        email,
        password,
      });
      
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiError = error.response?.data as ApiError;
        throw apiError?.message || 'Registration failed';
      }
      throw 'Registration failed';
    }
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/login`, {
        email,
        password,
      });
      
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.existingUser));
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiError = error.response?.data as ApiError;
        throw apiError?.message || 'Login failed';
      }
      throw 'Login failed';
    }
  },

  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.log('Logout error:', error);
    }
  },

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      return null;
    }
  },

  async getUser(): Promise<any | null> {
    try {
      const userStr = await AsyncStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      return null;
    }
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }
};
