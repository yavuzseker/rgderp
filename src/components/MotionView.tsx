import { useEffect, useRef, ReactNode } from "react";
import { Animated, ViewStyle, StyleProp } from "react-native";

interface MotionViewProps {
  children: ReactNode;
  /** Giriş gecikmesi (ms) — listelerde kademeli (stagger) animasyon için */
  delay?: number;
  /** Başlangıç dikey kayması (px) */
  offsetY?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Mount anında fade + yukarı kayma animasyonu uygulayan basit sarmalayıcı.
 * react-native Animated kullanır → web dahil her platformda ekstra kurulum gerektirmez.
 */
export function MotionView({
  children,
  delay = 0,
  offsetY = 16,
  duration = 420,
  style,
}: MotionViewProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(offsetY)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, duration, opacity, translateY]);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}
