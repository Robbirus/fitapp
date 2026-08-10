import { useDatabase } from "../db/DatabaseContext";
import { loadLatestWeight, loadProfileSettings } from "../db/Queries";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Text, View, Button, FlatList, TouchableOpacity } from "react-native";
import { getTodayISO } from "../utils/DateHelpers";
import { globalStyles } from "../styles/GlobalStyles";

export default function BMIScreen({ navigation }) {
  const db = useDatabase();
  const [mass, setMass] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  const today = getTodayISO();

  useFocusEffect(
    useCallback(() => {
      loadBMIParameters();
    }, []),
  );

  const loadBMIParameters = async () => {
    const latestWeight = await loadLatestWeight(db);
    const profileSettings = await loadProfileSettings(db);
    setMass([latestWeight, profileSettings]);
  };

  if (!mass[0]) {
    return (
      <View style={globalStyles.container}>
        <Text>
          Ajoute au moins une entrée de poids et les paramètres du profil pour
          voir ton IMC.
        </Text>
      </View>
    );
  }

  const calculateBMI = (weight, height) => {
    if (!weight || !height) return null;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(2);
  };

  const obtainBMICategory = (bmi) => {
    if (bmi < 18.5) return "Insuffisance pondérale";
    if (bmi >= 18.5 && bmi < 24.9) return "Poids normal";
    if (bmi >= 25 && bmi < 29.9) return "Surpoids";
    if (bmi >= 30) return "Obésité";
    return null;
  };

  const bmi = calculateBMI(mass[0], mass[1]?.height);

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Calculateur d'IMC</Text>
      <Text style={globalStyles.label}>Poids actuel : {mass[0]} kg</Text>
      <Text style={globalStyles.label}>Taille : {mass[1]?.height} cm</Text>
      <Text style={globalStyles.label}>IMC : {bmi}</Text>
      <Text style={globalStyles.label}>
        Catégorie : {obtainBMICategory(bmi)}
      </Text>
      <Button
        title="Modifier les paramètres du profil"
        onPress={() => navigation.navigate("Profil")}
      />
    </View>
  );
}
