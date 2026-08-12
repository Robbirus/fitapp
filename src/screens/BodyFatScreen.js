import { useDatabase } from "../db/DatabaseContext";
import {
  loadLatestWeight,
  loadProfileSettings,
  loadLatestBodyMeasurement,
} from "../db/Queries";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  Text,
  View,
  Button,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { getTodayISO } from "../utils/DateHelpers";
import { globalStyles } from "../styles/GlobalStyles";
import { calculateBodyFatPercentage } from "../utils/BodyCompositionCalculator";
import { Dimensions } from "react-native";
import {
  calculateWaistHipRatio,
  obtainWHRCategory,
  obtainBodyFatCategory,
} from "../utils/BodyCompositionCalculator";

const screenWidth = Dimensions.get("window").width;

const PERIOD_OPTIONS = [
  { value: "week", label: "Semaine" },
  { value: "month", label: "Mois" },
  { value: "year", label: "Année" },
];


export default function BodyFatScreen({ navigation }) {
  const db = useDatabase();
  const [waist, setWaist] = useState(null);
  const [hip, setHip] = useState(null);
  const [neck, setNeck] = useState(null);
  const [gender, setGender] = useState(null);
  const [height, setHeight] = useState(null);

  const today = getTodayISO();

  useFocusEffect(
    useCallback(() => {
      loadBodyFatparameters();
    }, []),
  );

  const loadBodyFatparameters = async () => {
    const latestMeasurement = await loadLatestBodyMeasurement(db);
    const latestProfile = await loadProfileSettings(db);
    setWaist(latestMeasurement?.waist || null);
    setHip(latestMeasurement?.hip || null);
    setNeck(latestMeasurement?.neck || null);

    setGender(latestProfile?.gender || null);
    setHeight(latestProfile?.height || null);
  };

  const computeBodyFatPercentage = () => {
    return calculateBodyFatPercentage({ gender, height, neck, waist, hip });
  };

  const computeBodyFatCategory = () => {
    const bodyFat = computeBodyFatPercentage();
    return obtainBodyFatCategory(bodyFat, gender);
  };

  const bodyFat = computeBodyFatPercentage();
  if (bodyFat === null) {
    return (
      <View style={globalStyles.container}>
        <Text>
          Ajoute tes mesures corporelles et ton profil pour voir ce résultat.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={globalStyles.scrollContainer}>
      <Text style={globalStyles.title}>
        Résultats de la composition corporelle
      </Text>
      <Text style={globalStyles.label}>
        Pourcentage de graisse corporelle:{" "}
        {computeBodyFatPercentage().toFixed(2)}%
      </Text>
      <Text style={globalStyles.label}>
        Catégorie: {computeBodyFatCategory()}
      </Text>
    </ScrollView>
  );
}
