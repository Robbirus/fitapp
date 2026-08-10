import { useDatabase } from "../db/DatabaseContext";
import {
  loadProfileSettings,
  updateProfileSettings,
  loadLatestWeight,
  updateSettings,
} from "../db/Queries";
import { calculateGoals } from "../utils/NutritionCalculator";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  Text,
  View,
  TextInput,
  Button,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { getTodayISO } from "../utils/DateHelpers";
import { globalStyles } from "../styles/GlobalStyles";

const ACTIVITY_OPTIONS = [
  { value: "sedentary", label: "Sédentaire" },
  { value: "light", label: "Léger" },
  { value: "moderate", label: "Modéré" },
  { value: "active", label: "Intense" },
];

const GOAL_OPTIONS = [
  { value: "lose", label: "Perdre" },
  { value: "maintain", label: "Maintenir" },
  { value: "gain", label: "Prendre" },
];

const RATE_OPTIONS = [0.25, 0.5, 0.75, 1];

export default function ProfileScreen({ navigation }) {
  const db = useDatabase();
  const [profile, setProfile] = useState(null);
  const [latestWeight, setLatestWeight] = useState(null);

  // Form fields
  const [name, setName] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState(1);
  const [activityLevel, setActivityLevel] = useState("moderate");
  const [weightGoal, setWeightGoal] = useState("maintain");
  const [weightGoalRate, setWeightGoalRate] = useState(0.5);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const loadData = async () => {
    const p = await loadProfileSettings(db);
    setProfile(p);
    setName(p.name);
    setHeight(p.height.toString());
    setAge(p.age.toString());
    setGender(p.gender);
    setActivityLevel(p.activity_level);
    setWeightGoal(p.weight_goal);
    setWeightGoalRate(p.weight_goal_rate);

    const w = await loadLatestWeight(db);
    setLatestWeight(w);
  };

  const save = async () => {
    if (!latestWeight) {
      alert(
        "Ajoute d'abord une entrée de poids dans l'onglet Poids avant de configurer ton profil.",
      );
      return;
    }

    const profileData = {
      name,
      height: parseFloat(height),
      age: parseInt(age),
      gender,
      activityLevel,
      weightGoal,
      weightGoalRate: weightGoal === "maintain" ? 0 : weightGoalRate,
      goalStartDate: getTodayISO(),
      goalStartWeight: latestWeight,
    };

    await updateProfileSettings(db, profileData);

    // Recalculates and saves the nutritional objectives
    const goals = calculateGoals({ weight: latestWeight, ...profileData });
    await updateSettings(db, {
      calorieGoal: goals.calorieGoal,
      proteinGoal: goals.proteinGoal,
      carbsGoal: goals.carbsGoal,
      fatGoal: goals.fatGoal,
    });

    alert("Profil et objectifs mis à jour !");
    loadData();
  };

  if (!profile) return null;

  return (
    <ScrollView contentContainerStyle={globalStyles.scrollContainer}>
      <Text style={globalStyles.titre}>Votre profil</Text>

      <Text style={globalStyles.label}>Nom :</Text>
      <TextInput
        style={globalStyles.input}
        value={name}
        onChangeText={setName}
      />

      <Text style={globalStyles.label}>Taille (cm) :</Text>
      <TextInput
        style={globalStyles.input}
        value={height}
        onChangeText={setHeight}
        keyboardType="numeric"
      />

      <Text style={globalStyles.label}>Âge :</Text>
      <TextInput
        style={globalStyles.input}
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />

      <Text style={globalStyles.label}>Sexe :</Text>
      <View style={globalStyles.optionsRow}>
        {[
          { value: 1, label: "Homme" },
          { value: 2, label: "Femme" },
        ].map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[
              globalStyles.option,
              gender === opt.value && globalStyles.optionSelected,
            ]}
            onPress={() => setGender(opt.value)}
          >
            <Text
              style={
                gender === opt.value
                  ? globalStyles.optionTextSelected
                  : globalStyles.optionText
              }
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={globalStyles.label}>Niveau d'activité :</Text>
      <View style={globalStyles.optionsRow}>
        {ACTIVITY_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[
              globalStyles.option,
              activityLevel === opt.value && globalStyles.optionSelected,
            ]}
            onPress={() => setActivityLevel(opt.value)}
          >
            <Text
              style={
                activityLevel === opt.value
                  ? globalStyles.optionTextSelected
                  : globalStyles.optionText
              }
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={globalStyles.label}>Objectif :</Text>
      <View style={globalStyles.optionsRow}>
        {GOAL_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[
              globalStyles.option,
              weightGoal === opt.value && globalStyles.optionSelected,
            ]}
            onPress={() => setWeightGoal(opt.value)}
          >
            <Text
              style={
                weightGoal === opt.value
                  ? globalStyles.optionTextSelected
                  : globalStyles.optionText
              }
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {weightGoal !== "maintain" && (
        <>
          <Text style={globalStyles.label}>Rythme (kg / semaine) :</Text>
          <View style={globalStyles.optionsRow}>
            {RATE_OPTIONS.map((rate) => (
              <TouchableOpacity
                key={rate}
                style={[
                  globalStyles.option,
                  weightGoalRate === rate && globalStyles.optionSelected,
                ]}
                onPress={() => setWeightGoalRate(rate)}
              >
                <Text
                  style={
                    weightGoalRate === rate
                      ? globalStyles.optionTextSelected
                      : globalStyles.optionText
                  }
                >
                  {rate}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <Text style={globalStyles.weightInfo}>
        Poids actuel utilisé pour le calcul :{" "}
        {latestWeight ? `${latestWeight} kg` : "aucune entrée"}
      </Text>

      <TouchableOpacity style={globalStyles.primaryButton} onPress={save}>
        <Text style={globalStyles.primaryButtonText}>
          Enregistrer et recalculer mes objectifs
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={globalStyles.primaryButton}
        onPress={() => navigation.navigate("Poids")}
      >
        <Text style={globalStyles.primaryButtonText}>Mon poids</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={globalStyles.primaryButton}
        onPress={() => navigation.navigate("Mesures")}
      >
        <Text style={globalStyles.primaryButtonText}>
          Mes mesures corporelles
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
