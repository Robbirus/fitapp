import { useState, useCallback } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useDatabase } from "../db/DatabaseContext";
import { loadAchievements } from "../db/Queries";
import { refreshAchievements } from "../db/Achievements";
import { globalStyles } from "../styles/GlobalStyles";
import { dashboardStyles } from "../styles/DashboardStyle";

const CATEGORY_LABELS = {
  streak: "Séries",
  nutrition: "Nutrition",
  sport: "Sport",
  weight: "Poids",
  general: "Général",
};

const CATEGORY_ORDER = ["streak", "nutrition", "sport", "weight", "general"];

function AchievementRow({ achievement }) {
  const unlocked = achievement.is_unlocked === 1;
  const progress = Math.min(achievement.current_value / achievement.target_value, 1);

  return (
    <View
      style={[
        globalStyles.card,
        dashboardStyles.achievementCard,
        { opacity: unlocked ? 1 : 0.85 },
      ]}
    >
      <View style={globalStyles.rowBetween}>
        <Text style={globalStyles.sectionTitle}>
          {unlocked ? "🏆 " : "🔒 "}
          {achievement.title}
        </Text>
        <Text style={dashboardStyles.achievementProgressText}>
          {Math.min(achievement.current_value, achievement.target_value)}/{achievement.target_value}
        </Text>
      </View>
      <Text style={globalStyles.sectionSubtitle}>{achievement.description}</Text>

      <View style={globalStyles.progressBarBackground}>
        <View
          style={[
            globalStyles.progressBarFill,
            {
              width: `${progress * 100}%`,
              backgroundColor: unlocked ? "#4CAF50" : "#0095ff",
            },
          ]}
        />
      </View>

      {unlocked && achievement.unlocked_at && (
        <Text style={dashboardStyles.achievementUnlockedDate}>
          Débloqué le{" "}
          {new Date(achievement.unlocked_at).toLocaleDateString("fr-FR")}
        </Text>
      )}
    </View>
  );
}

export default function AchievementsScreen() {
  const db = useDatabase();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [db]),
  );

  const loadAll = async () => {
    if (!db) return;
    setLoading(true);
    try {
      await refreshAchievements(db);
      const rows = await loadAchievements(db);
      setAchievements(rows);
    } catch (error) {
      console.log("ERROR loading achievements:", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && achievements.length === 0) {
    return (
      <View style={globalStyles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const unlockedCount = achievements.filter((a) => a.is_unlocked === 1).length;

  return (
    <ScrollView contentContainerStyle={globalStyles.scrollContainer}>
      <Text style={globalStyles.titre}>Succès</Text>
      <Text
        style={[globalStyles.sectionSubtitle, { textAlign: "center", marginBottom: 20 }]}
      >
        {unlockedCount} / {achievements.length} débloqués
      </Text>

      {CATEGORY_ORDER.map((category) => {
        const items = achievements.filter((a) => a.category === category);
        if (items.length === 0) return null;
        return (
          <View key={category} style={dashboardStyles.categorySection}>
            <Text style={globalStyles.subTitle}>{CATEGORY_LABELS[category] || category}</Text>
            {items.map((achievement) => (
              <AchievementRow key={achievement.id} achievement={achievement} />
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
}