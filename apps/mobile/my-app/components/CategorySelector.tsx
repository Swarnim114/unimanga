import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { Category, apiService } from '../services/api.service';

interface CategorySelectorProps {
  visible: boolean;
  categories: Category[];
  loading: boolean;
  onSelect: (categoryId: string) => void;
  onClose: () => void;
  onCategoryCreated?: () => void;
}

export default function CategorySelector({
  visible,
  categories,
  loading,
  onSelect,
  onClose,
  onCategoryCreated,
}: CategorySelectorProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    try {
      setCreating(true);
      await apiService.createCategory({ name: newCategoryName.trim() });
      setNewCategoryName('');
      setShowCreateForm(false);
      onCategoryCreated?.();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create category');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/70 justify-center items-center">
        <View className="bg-[#2C2C2E] rounded-2xl w-11/12 max-w-md overflow-hidden">
          {/* Header */}
          <View className="bg-[#6366F1] px-6 py-4">
            <Text className="text-white text-xl font-bold text-center">
              Select Category
            </Text>
            <Text className="text-white/80 text-sm text-center mt-1">
              Choose where to add this manga
            </Text>
          </View>

          {/* Content */}
          <ScrollView className="max-h-96">
            {loading ? (
              <View className="py-12">
                <ActivityIndicator size="large" color="#6366F1" />
                <Text className="text-white/60 text-center mt-4">
                  Loading categories...
                </Text>
              </View>
            ) : showCreateForm ? (
              <View className="px-6 py-6">
                <Text className="text-white text-lg font-semibold mb-4">
                  Create New Category
                </Text>
                <TextInput
                  className="bg-[#1C1C1E] text-white px-4 py-3 rounded-lg mb-4 border border-white/10"
                  placeholder="Category name..."
                  placeholderTextColor="#666"
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                  autoFocus
                  editable={!creating}
                />
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    className="flex-1 bg-[#1C1C1E] px-4 py-3 rounded-lg items-center border border-white/10"
                    onPress={() => {
                      setShowCreateForm(false);
                      setNewCategoryName('');
                    }}
                    activeOpacity={0.8}
                    disabled={creating}
                  >
                    <Text className="text-white/80 font-semibold">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-[#6366F1] px-4 py-3 rounded-lg items-center flex-row justify-center"
                    onPress={handleCreateCategory}
                    activeOpacity={0.8}
                    disabled={creating}
                  >
                    {creating ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text className="text-white font-semibold">Create</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : categories.length === 0 ? (
              <View className="py-12 px-6">
                <Text className="text-white text-center text-lg font-semibold mb-2">
                  No Categories Found
                </Text>
                <Text className="text-white/60 text-center mb-6">
                  Create a category to start organizing your manga
                </Text>
                <TouchableOpacity
                  className="bg-[#6366F1] py-3 px-6 rounded-lg"
                  onPress={() => setShowCreateForm(true)}
                  activeOpacity={0.8}
                >
                  <Text className="text-white text-center font-semibold">
                    + Create Category
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View className="py-3">
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category._id}
                      className="flex-row items-center px-6 py-4 active:bg-white/5"
                      onPress={() => onSelect(category._id)}
                      activeOpacity={0.8}
                    >
                      {/* Icon */}
                      <View
                        className="w-12 h-12 rounded-full items-center justify-center mr-4"
                        style={{ backgroundColor: category.color + '20' }}
                      >
                        <Text style={{ fontSize: 24 }}>{category.icon}</Text>
                      </View>

                      {/* Category Info */}
                      <View className="flex-1">
                        <Text className="text-white font-semibold text-lg">
                          {category.name}
                        </Text>
                        {category.isDefault && (
                          <Text className="text-white/40 text-xs mt-1">
                            Default category
                          </Text>
                        )}
                      </View>

                      {/* Arrow */}
                      <Text className="text-white/40 text-xl">›</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Add Create Category Button */}
                <View className="border-t border-white/10">
                  <TouchableOpacity
                    className="py-4 active:bg-white/5"
                    onPress={() => setShowCreateForm(true)}
                    activeOpacity={0.8}
                  >
                    <Text className="text-[#6366F1] text-center font-semibold">
                      + Create New Category
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>

          {/* Cancel Button */}
          <View className="border-t border-white/10">
            <TouchableOpacity
              className="py-4 active:bg-white/5"
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text className="text-white/80 text-center font-semibold">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
