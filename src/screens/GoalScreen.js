import { useState, useCallback, useContext } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ScrollView, TouchableOpacity, Text } from "react-native";
import { useDatabase } from "../db/DatabaseContext";
import { notifyUnlockedAchievements } from "../db/Queries";
import { loadProfileFormData, saveProfileFormData } from "../utils/ProfileFormHelpers";
import { globalStyles } from "../styles/GlobalStyles";
import { AchievementContext } from "../contexts/AchievementContext";
import GoalsSection from "../components/profile/GoalsSection";

export default function GoalsScreen() {
  const db = useDatabase();
  const { showAchievement } = useContext(AchievementContext);
  const [form, setForm] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadProfileFormData(db).then(setForm);
    }, [db]),
  );

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    if (!form.latestWeight) {
      alert("Ajoute d'abord une entrée de poids dans l'onglet Poids avant de configurer ton profil.");
      return;
    }
    const result = await saveProfileFormData(db, form);
    notifyUnlockedAchievements(result, showAchievement);
    alert("Objectifs mis à jour !");
  };

  if (!form) return null;

  return (
    <ScrollView contentContainerStyle={globalStyles.scrollContainer}>
      <GoalsSection
        activityLevel={form.activityLevel} setActivityLevel={set("activityLevel")}
        weightGoal={form.weightGoal} setWeightGoal={set("weightGoal")}
        weightGoalRate={form.weightGoalRate} setWeightGoalRate={set("weightGoalRate")}
        targetWeight={form.targetWeight} setTargetWeight={set("targetWeight")}
        latestWeight={form.latestWeight}
      />
      <TouchableOpacity style={globalStyles.primaryButton} activeOpacity={0.6} onPress={save}>
        <Text style={globalStyles.primaryButtonText}>Enregistrer et recalculer mes objectifs</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}