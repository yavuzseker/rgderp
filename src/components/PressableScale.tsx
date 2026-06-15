import { useRef, ReactNode } from "react";
import { Animated, Pressable, ViewStyle, StyleProp } from "react-native";

interface PressableScaleProps {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
}

/** Basıldığında hafifçe küçülen, premium his veren dokunma sarmalayıcısı. */
export function PressableScale({
  children,
  onPress,
  style,
  scaleTo = 0.97,
}: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const animate = (to: number) =>
    Animated.spring(scale, {
      toValue: to,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => animate(scaleTo)}
      onPressOut={() => animate(1)}
    >
      <Animated.View style={[{ transform: [{ scale }] }, style]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
