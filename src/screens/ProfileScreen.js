import { useDatabase } from "../db/DatabaseContext";
import {
  loadProfileSettings,
  updateProfileSettings,
  loadLatestWeight,
  updateSettings,
  notifyUnlockedAchievements,
} from "../db/Queries";
import { calculateGoals } from "../utils/NutritionCalculator";
import { useState, useCallback, useContext } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ScrollView, TouchableOpacity, Text } from "react-native";
import { getTodayISO } from "../utils/DateHelpers";
import { globalStyles } from "../styles/GlobalStyles";
import { AchievementContext } from "../contexts/AchievementContext";

import PersonalInfoSection from "../components/profile/PersonalInfoSection";
import GoalsSection from "../components/profile/GoalsSection";
import DietStyleSection from "../components/profile/DietStyleSection";
import MealTimesSection from "../components/profile/MealTimesSection";

export default function ProfileScreen({ navigation }) {
  const db = useDatabase();
  const [profile, setProfile] = useState(null);
  const [latestWeight, setLatestWeight] = useState(null);
  const { showAchievement } = useContext(AchievementContext);

  // Informations personnelles
  const [name, setName] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState(1);
  const [ethnicity, setEthnicity] = useState("caucasian");

  // Objectifs
  const [activityLevel, setActivityLevel] = useState("moderate");
  const [weightGoal, setWeightGoal] = useState("maintain");
  const [weightGoalRate, setWeightGoalRate] = useState(0.5);
  const [dietStyle, setDietStyle] = useState("balanced");

  // Horaires de repas & Hydratation
  const [mealTimes, setMealTimes] = useState({
    breakfast: "08:00",
    lunch: "12:30",
    snack: "16:30",
    dinner: "20:00",
  });
  const [waterGoal, setWaterGoal] = useState("2.0");

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const p = await loadProfileSettings(db);
    setProfile(p);
    setName(p.name);
    setHeight(p.height.toString());
    setAge(p.age.toString());
    setGender(p.gender);
    setEthnicity(p.ethnicity);
    setActivityLevel(p.activity_level);
    setWeightGoal(p.weight_goal);
    setWeightGoalRate(p.weight_goal_rate);
    setDietStyle(p.diet_style || "balanced");

    if (p.meal_times) setMealTimes(JSON.parse(p.meal_times));
    if (p.water_goal) setWaterGoal(p.water_goal.toString());

    const w = await loadLatestWeight(db);
    setLatestWeight(w?.value || null);
  };

  const save = async () => {
    if (!latestWeight) {
      alert("Ajoute d'abord une entrée de poids dans l'onglet Poids avant de configurer ton profil.");
      return;
    }

    const profileData = {
      name,
      height: parseFloat(height),
      age: parseInt(age),
      gender,
      ethnicity,
      activityLevel,
      weightGoal,
      weightGoalRate: weightGoal === "maintain" ? 0 : weightGoalRate,
      dietStyle,
      goalStartDate: getTodayISO(),
      goalStartWeight: latestWeight,
      mealTimes: JSON.stringify(mealTimes),
      waterGoal: parseFloat(waterGoal),
    };

    const result = await updateProfileSettings(db, profileData);
    notifyUnlockedAchievements(result, showAchievement);

    const goals = calculateGoals({ weight: latestWeight, ...profileData });
    await updateSettings(db, {
      calorieGoal: goals.calorieGoal,
      proteinGoal: goals.proteinGoal,
      carbsGoal: goals.carbsGoal,
      fatGoal: goals.fatGoal,
      fiberGoal: goals.fiberGoal,
      waterGoal: parseFloat(waterGoal),
    });

    alert("Information et objectifs mis à jour !");
    loadData();
  };

  if (!profile) return null;

  return (
    <ScrollView contentContainerStyle={globalStyles.scrollContainer}>
      <TouchableOpacity
        style={[globalStyles.primaryButton, { marginBottom: 16, backgroundColor: "#FFD700" }]}
        activeOpacity={0.6}
        onPress={() => navigation.navigate("Succès")}
      >
        <Text style={[globalStyles.primaryButtonText, { color: "#000" }]}>
          🏆 Voir mes succès
        </Text>
      </TouchableOpacity>
      <PersonalInfoSection
        name={name} setName={setName}
        height={height} setHeight={setHeight}
        age={age} setAge={setAge}
        gender={gender} setGender={setGender}
        ethnicity={ethnicity} setEthnicity={setEthnicity}
      />

      <GoalsSection
        activityLevel={activityLevel} setActivityLevel={setActivityLevel}
        weightGoal={weightGoal} setWeightGoal={setWeightGoal}
        weightGoalRate={weightGoalRate} setWeightGoalRate={setWeightGoalRate}
        latestWeight={latestWeight}
      />

      <DietStyleSection
        dietStyle={dietStyle} setDietStyle={setDietStyle}
      />

      <MealTimesSection
        mealTimes={mealTimes} setMealTimes={setMealTimes}
        waterGoal={waterGoal} setWaterGoal={setWaterGoal}
      />

      <TouchableOpacity
        style={[globalStyles.primaryButton, { backgroundColor: "#2196F3" }]}
        onPress={() => navigation.navigate("Rappels")}
      >
        <Text style={globalStyles.primaryButtonText}>💧 Rappels d'eau</Text>
      </TouchableOpacity>

      <TouchableOpacity style={globalStyles.primaryButton} onPress={save}>
        <Text style={globalStyles.primaryButtonText}>Enregistrer et recalculer mes objectifs</Text>
      </TouchableOpacity>

      <TouchableOpacity style={globalStyles.primaryButton} onPress={() => navigation.navigate("Poids")}>
        <Text style={globalStyles.primaryButtonText}>Mon poids</Text>
      </TouchableOpacity>

      <TouchableOpacity style={globalStyles.primaryButton} onPress={() => navigation.navigate("Mesures")}>
        <Text style={globalStyles.primaryButtonText}>Mes mesures corporelles</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}