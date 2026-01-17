import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { authService } from '../../services/auth.service';

export default function SignupScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await authService.register(username, email, password);
      console.log('Registration successful!', response.message);
      router.replace('/(main)/home');
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#1C1C1E]">
      <StatusBar barStyle="light-content" backgroundColor="#1C1C1E" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center"
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-8 py-12">
            {/* Logo/Title */}
            <View className="items-center mb-12">
              <Text className="text-4xl font-bold text-white mb-2">UniManga</Text>
              <Text className="text-gray-400 text-base">Create your account</Text>
            </View>

            {/* Username Input */}
            <View className="mb-4">
              <Text className="text-gray-400 text-sm mb-2 ml-1">Username</Text>
              <TextInput
                className="bg-[#2C2C2E] text-white px-4 py-4 rounded-xl text-base"
                placeholder="Choose a username"
                placeholderTextColor="#8E8E93"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-gray-400 text-sm mb-2 ml-1">Email</Text>
              <TextInput
                className="bg-[#2C2C2E] text-white px-4 py-4 rounded-xl text-base"
                placeholder="Enter your email"
                placeholderTextColor="#8E8E93"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            {/* Password Input */}
            <View className="mb-4">
              <Text className="text-gray-400 text-sm mb-2 ml-1">Password</Text>
              <TextInput
                className="bg-[#2C2C2E] text-white px-4 py-4 rounded-xl text-base"
                placeholder="Create a password"
                placeholderTextColor="#8E8E93"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {/* Confirm Password Input */}
            <View className="mb-8">
              <Text className="text-gray-400 text-sm mb-2 ml-1">Confirm Password</Text>
              <TextInput
                className="bg-[#2C2C2E] text-white px-4 py-4 rounded-xl text-base"
                placeholder="Confirm your password"
                placeholderTextColor="#8E8E93"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {/* Register Button */}
            <TouchableOpacity
              className={`py-4 rounded-xl items-center ${
                isLoading ? 'bg-[#4F46E5]/50' : 'bg-[#6366F1]'
              }`}
              onPress={handleSignup}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold text-base">
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            {/* Login Link */}
            <View className="flex-row justify-center mt-8">
              <Text className="text-gray-400 text-sm">
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text className="text-[#6366F1] text-sm font-semibold">
                  Login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
