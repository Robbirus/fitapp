import React, { createContext, useState, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';

export const AchievementContext = createContext();

export function AchievementProvider({ children }) {
  const [achievement, setAchievement] = useState(null);
  const slideAnim = useRef(new Animated.Value(-150)).current; 

  const showAchievement = (title, description) => {
    setAchievement({ title, description });
    
    // Séquence d'animation : descend, patiente 3s, remonte
    Animated.sequence([
      Animated.timing(slideAnim, { toValue: 50, duration: 500, useNativeDriver: true }),
      Animated.delay(3000),
      Animated.timing(slideAnim, { toValue: -150, duration: 500, useNativeDriver: true })
    ]).start(() => setAchievement(null));
  };

  return (
    <AchievementContext.Provider value={{ showAchievement }}>
      {children}
      {achievement && (
        <Animated.View style={[styles.toast, { transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.title}>🏆 Succès Débloqué !</Text>
          <Text style={styles.desc}>{achievement.title}</Text>
          <Text style={styles.sub}>{achievement.description}</Text>
        </Animated.View>
      )}
    </AchievementContext.Provider>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 0, left: 20, right: 20,
    backgroundColor: '#FFD700', // Doré
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5,
    elevation: 6,
    zIndex: 9999, 
    alignItems: 'center'
  },
  title: { fontWeight: 'bold', fontSize: 16, color: '#000', marginBottom: 4 },
  desc: { fontWeight: '600', fontSize: 14, color: '#333' },
  sub: { fontSize: 12, color: '#555', marginTop: 2, textAlign: 'center' }
});