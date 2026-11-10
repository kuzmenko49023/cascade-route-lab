import { useCallback, useRef } from 'react';
import { Animated } from 'react-native';
import { theme } from '../constants/theme';

/**
 * Press feedback the safe way: the Pressable stays the parent and only drives
 * these callbacks, so no animated wrapper can ever swallow the tap.
 * transform/opacity only, so the native driver is legal here.
 */
export function usePressScale(to: number = 0.95) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: to,
      tension: theme.spring.press.tension,
      friction: theme.spring.press.friction,
      useNativeDriver: true,
    }).start();
  }, [scale, to]);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      tension: theme.spring.press.tension,
      friction: theme.spring.press.friction,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  return { scale, onPressIn, onPressOut };
}
