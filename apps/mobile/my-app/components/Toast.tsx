import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function Toast({ message, type = 'info', visible, onHide, duration = 3000 }: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          tension: 65,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -20,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  if (!visible) return null;

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-500/95',
          icon: 'checkmark-circle' as const,
          iconColor: '#FFF',
        };
      case 'error':
        return {
          bg: 'bg-red-500/95',
          icon: 'close-circle' as const,
          iconColor: '#FFF',
        };
      case 'warning':
        return {
          bg: 'bg-orange-500/95',
          icon: 'warning' as const,
          iconColor: '#FFF',
        };
      case 'info':
      default:
        return {
          bg: 'bg-[#6366F1]/95',
          icon: 'information-circle' as const,
          iconColor: '#FFF',
        };
    }
  };

  const toastStyle = getToastStyle();

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY }],
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        zIndex: 9999,
        marginTop: -50, // Half of approximate toast height to truly center
      }}
      className="px-6"
    >
      <View className={`${toastStyle.bg} rounded-2xl p-4 shadow-2xl flex-row items-center`}>
        <Ionicons name={toastStyle.icon} size={24} color={toastStyle.iconColor} />
        <Text className="text-white text-base font-medium ml-3 flex-1" numberOfLines={3}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}

// Hook for managing toast state
export function useToast() {
  const [toast, setToast] = React.useState<{
    visible: boolean;
    message: string;
    type: ToastType;
  }>({
    visible: false,
    message: '',
    type: 'info',
  });

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  return {
    toast,
    showToast,
    hideToast,
  };
}
