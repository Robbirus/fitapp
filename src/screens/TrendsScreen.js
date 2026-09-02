import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Text, View, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useDatabase } from "../db/DatabaseContext";
import {
  loadWeightHistorySince,
  loadCaloriesPerDay,
  loadMacrosPerDay,
  loadSettings,
} from "../db/Queries";
import { getDateNDaysAgoISO } from "../utils/DateHelpers";
import { globalStyles } from "../styles/GlobalStyles";

const screenWidth = Dimensions.get("window").width;

const PERIOD_OPTIONS = [
  { value: "week", label: "Semaine" },
  { value: "month", label: "Mois" },
  { value: "year", label: "Année" },
];

const chartConfig = {
  backgroundColor: "#ffffff",
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
};

export default function TrendsScreen() {
  const db = useDatabase();
  const [period, setPeriod] = useState("week");
  const [weightHistory, setWeightHistory] = useState([]);
  const [caloriesPerDay, setCaloriesPerDay] = useState([]);
  const [macrosPerDay, setMacrosPerDay] = useState([]);
  const [settings, setSettings] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadAll(period);
    }, [period]),
  );

  const loadAll = async (selectedPeriod) => {
    const days = selectedPeriod === "week" ? 7 : selectedPeriod === "month" ? 30 : 365;
    const sinceDate = getDateNDaysAgoISO(days);
    const [weights, calories, macros, s] = await Promise.all([
      loadWeightHistorySince(db, sinceDate),
      loadCaloriesPerDay(db, sinceDate),
      loadMacrosPerDay(db, sinceDate),
      loadSettings(db),
    ]);
    setWeightHistory(weights);
    setCaloriesPerDay(calories);
    setMacrosPerDay(macros);
    setSettings(s);
  };

  const selectPeriod = (newPeriod) => setPeriod(newPeriod);

  const maxPoints = period === "week" ? 7 : period === "month" ? 30 : 52;
  const showEvery = period === "week" ? 1 : period === "month" ? 5 : 8;

  const sample = (rows) => {
    if (rows.length <= maxPoints) return rows;
    return Array.from({ length: maxPoints }, (_, i) => {
      const idx = Math.round((i * (rows.length - 1)) / (maxPoints - 1));
      return rows[idx];
    });
  };

  const labelsFor = (rows) =>
    rows.map((item, index) => (index % showEvery === 0 ? item.date.slice(5) : ""));

  const recentWeights = sample(weightHistory);
  const recentCalories = sample(caloriesPerDay);
  const recentMacros = sample(macrosPerDay);

  return (
    <ScrollView contentContainerStyle={globalStyles.scrollContainer}>
      <Text style={globalStyles.titre}>Tendances</Text>

      <View style={[globalStyles.optionsRow, { marginBottom: 16 }]}>
        {PERIOD_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[globalStyles.option, period === opt.value && globalStyles.optionSelected]}
            onPress={() => selectPeriod(opt.value)}
          >
            <Text
              style={
                period === opt.value ? globalStyles.optionTextSelected : globalStyles.optionText
              }
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[globalStyles.card, { marginBottom: 16 }]}>
        <Text style={globalStyles.sectionTitle}>Évolution du poids</Text>
        {recentWeights.length === 0 ? (
          <Text style={globalStyles.sectionSubtitle}>
            Aucune entrée de poids sur cette période.
          </Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator style={{ marginTop: 12 }}>
            <LineChart
              data={{
                labels: labelsFor(recentWeights),
                datasets: [{ data: recentWeights.map((w) => w.value) }],
              }}
              width={Math.max(screenWidth - 40, recentWeights.length * 40)}
              height={200}
              chartConfig={chartConfig}
              bezier
            />
          </ScrollView>
        )}
      </View>

      <View style={[globalStyles.card, { marginBottom: 16 }]}>
        <Text style={globalStyles.sectionTitle}>Calories vs objectif</Text>
        {recentCalories.length === 0 ? (
          <Text style={globalStyles.sectionSubtitle}>
            Aucune entrée au journal sur cette période.
          </Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator style={{ marginTop: 12 }}>
            <LineChart
              data={{
                labels: labelsFor(recentCalories),
                datasets: [
                  { data: recentCalories.map((c) => Math.round(c.total_calories)), color: () => "#4CAF50" },
                  ...(settings
                    ? [{ data: recentCalories.map(() => settings.calorie_goal), color: () => "#FF5722" }]
                    : []),
                ],
              }}
              width={Math.max(screenWidth - 40, recentCalories.length * 40)}
              height={200}
              chartConfig={chartConfig}
              bezier
            />
          </ScrollView>
        )}
        <View style={globalStyles.legendRow}>
          <View style={[globalStyles.legendDot, { backgroundColor: "#4CAF50" }]} />
          <Text>Consommé</Text>
          <View style={[globalStyles.legendDot, { backgroundColor: "#FF5722" }]} />
          <Text>Objectif</Text>
        </View>
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.sectionTitle}>Macronutriments</Text>
        {recentMacros.length === 0 ? (
          <Text style={globalStyles.sectionSubtitle}>
            Aucune entrée au journal sur cette période.
          </Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator style={{ marginTop: 12 }}>
            <LineChart
              data={{
                labels: labelsFor(recentMacros),
                datasets: [
                  { data: recentMacros.map((m) => Math.round(m.protein || 0)), color: () => "#EF5350" },
                  { data: recentMacros.map((m) => Math.round(m.carbs || 0)), color: () => "#FFA726" },
                  { data: recentMacros.map((m) => Math.round(m.fat || 0)), color: () => "#42A5F5" },
                ],
              }}
              width={Math.max(screenWidth - 40, recentMacros.length * 40)}
              height={200}
              chartConfig={chartConfig}
              bezier
            />
          </ScrollView>
        )}
        <View style={globalStyles.legendRow}>
          <View style={[globalStyles.legendDot, { backgroundColor: "#EF5350" }]} />
          <Text>Protéines</Text>
          <View style={[globalStyles.legendDot, { backgroundColor: "#FFA726" }]} />
          <Text>Glucides</Text>
          <View style={[globalStyles.legendDot, { backgroundColor: "#42A5F5" }]} />
          <Text>Lipides</Text>
        </View>
      </View>
    </ScrollView>
  );
}