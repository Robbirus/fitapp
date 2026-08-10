import { useDatabase } from "../db/DatabaseContext";
import { loadProfileSettings, loadLatestBodyMeasurement } from "../db/Queries";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Text, View, Button, ScrollView } from "react-native";
import { globalStyles } from "../styles/GlobalStyles";
import {
  calculateWaistHipRatio,
  obtainWHRCategory,
} from "../utils/BodyCompositionCalculator";

export default function WHRScreen({ navigation }) {
  const db = useDatabase();
  const [waist, setWaist] = useState(null);
  const [hip, setHip] = useState(null);
  const [gender, setGender] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadWHRparameters();
    }, []),
  );

  const explanations = {
    "Risque faible":
      "Ton rapport taille-hanche indique une répartition des graisses à faible risque cardiovasculaire.",
    "Risque modéré":
      "Ton rapport taille-hanche indique un risque modéré ; surveiller l'évolution peut être utile.",
    "Risque élevé":
      "Ton rapport taille-hanche est dans la zone à risque élevé ; envisage d'en parler à un professionnel de santé.",
  };

  const loadWHRparameters = async () => {
    const latestMeasurement = await loadLatestBodyMeasurement(db);
    const profile = await loadProfileSettings(db);
    setWaist(latestMeasurement?.waist || null);
    setHip(latestMeasurement?.hip || null);
    setGender(profile?.gender || null);
  };

  const whr = calculateWaistHipRatio(waist, hip);

  if (whr === null) {
    return (
      <View style={globalStyles.container}>
        <Text>Ajoute au moins une mesure corporelle pour voir ton RTH.</Text>
      </View>
    );
  }

  const category = obtainWHRCategory(whr, gender);

  return (
    <ScrollView style={globalStyles.scrollContainer}>
      <Text style={globalStyles.title}>Rapport Taille-Hanche</Text>
      <Text style={globalStyles.label}>RTH : {whr}</Text>
      <Text style={globalStyles.label}>Catégorie : {category}</Text>
      <Text style={globalStyles.label}>
        {explanations[category] || "Aucune explication disponible."}
      </Text>
    </ScrollView>
  );
}
