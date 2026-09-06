import { useState, useCallback, useContext } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ScrollView, TouchableOpacity, Text } from "react-native";
import { useDatabase } from "../db/DatabaseContext";
import { notifyUnlockedAchievements } from "../db/Queries";
import { loadProfileFormData, saveProfileFormData } from "../utils/ProfileFormHelpers";
import { globalStyles } from "../styles/GlobalStyles";
import { AchievementContext } from "../contexts/AchievementContext";
import DietStyleSection from "../components/profile/DietStyleSection";

export default function DietStyleScreen() {
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
    alert("Style de régime mis à jour !");
  };

  if (!form) return null;

  return (
    <ScrollView contentContainerStyle={globalStyles.scrollContainer}>
      <DietStyleSection
        dietStyle={form.dietStyle}
        setDietStyle={(value) => setForm((prev) => ({ ...prev, dietStyle: value }))}
      />
      <TouchableOpacity style={globalStyles.primaryButton} activeOpacity={0.6} onPress={save}>
        <Text style={globalStyles.primaryButtonText}>Enregistrer</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}