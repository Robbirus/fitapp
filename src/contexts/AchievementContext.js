import React, { createContext, useState, useRef, useEffect } from 'react';
import { Animated, Text } from 'react-native';
import { achievementToastStyles as styles } from '../styles/ComponentStyle';

export const AchievementContext = createContext();

export function AchievementProvider({ children }) {
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);
  const slideAnim = useRef(new Animated.Value(-150)).current;

  const showAchievement = (title, description) => {
    setQueue((q) => [...q, { title, description }]);
  };

  useEffect(() => {
    if (!current && queue.length > 0) {
      setCurrent(queue[0]);
      setQueue((q) => q.slice(1));
    }
  }, [queue, current]);

  useEffect(() => {
    if (!current) return;
    let cancelled = false;
    Animated.sequence([
      Animated.timing(slideAnim, { toValue: 50, duration: 500, useNativeDriver: true }),
      Animated.delay(3000),
      Animated.timing(slideAnim, { toValue: -150, duration: 500, useNativeDriver: true }),
    ]).start(() => {
      if (!cancelled) setCurrent(null);
    });
    return () => { cancelled = true; };
  }, [current]);


  return (
    <AchievementContext.Provider value={{ showAchievement }}>
      {children}
      {current && (
        <Animated.View style={[styles.toast, { transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.title}>🏆 Succès Débloqué !</Text>
          <Text style={styles.desc}>{current.title}</Text>
          <Text style={styles.sub}>{current.description}</Text>
        </Animated.View>
      )}
    </AchievementContext.Provider>
  );
}