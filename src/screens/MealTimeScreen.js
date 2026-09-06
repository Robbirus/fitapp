import { useState, useCallback, useContext } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ScrollView, TouchableOpacity, Text } from "react-native";
import { useDatabase } from "../db/DatabaseContext";
import { notifyUnlockedAchievements } from "../db/Queries";
import { loadProfileFormData, saveProfileFormData } from "../utils/ProfileFormHelpers";
import { globalStyles } from "../styles/GlobalStyles";
import { AchievementContext } from "../contexts/AchievementContext";
import MealTimesSection from "../components/profile/MealTimesSection";

export default function MealTimesScreen() {
  const db = useDatabase();
  const { showAchievement } = useContext(AchievementContext);
  const [form, setForm] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadProfileFormData(db).then(setForm);
    }, [db]),
  );

  const save = async () => {
    if (!form.latestWeight) {
      alert("Ajoute d'abord une entrée de poids dans l'onglet Poids avant de configurer ton profil.");
      return;
    }
    const result = await saveProfileFormData(db, form);
    notifyUnlockedAchievements(result, showAchievement);
    alert("Horaires mis à jour !");
  };

  if (!form) return null;

  return (
    <ScrollView contentContainerStyle={globalStyles.scrollContainer}>
      <MealTimesSection
        mealTimes={form.mealTimes}
        setMealTimes={(updater) =>
          setForm((prev) => ({
            ...prev,
            mealTimes: typeof updater === "function" ? updater(prev.mealTimes) : updater,
          }))
        }
        waterGoal={form.waterGoal}
        setWaterGoal={(value) => setForm((prev) => ({ ...prev, waterGoal: value }))}
      />
      <TouchableOpacity style={globalStyles.primaryButton} activeOpacity={0.6} onPress={save}>
        <Text style={globalStyles.primaryButtonText}>Enregistrer</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}