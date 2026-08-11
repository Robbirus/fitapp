import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  Text,
  View,
  TextInput,
  Button,
  ScrollView,
  Dimensions,
} from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { useDatabase } from "../db/DatabaseContext";
import {
  loadDiaryEntries,
  loadActivities,
  loadSettings,
  updateSettings,
  loadCaloriesPerDay,
} from "../db/Queries";
import { getTodayISO, getDateNDaysAgoISO } from "../utils/DateHelpers";
import { globalStyles } from "../styles/GlobalStyles";
import DonutRing from "../components/DonutRing";
import Bar from "../components/Bar";

export default function DashboardScreen() {
  const db = useDatabase();
  const [settings, setSettings] = useState(null);
  const [calConsumed, setConsumed] = useState(0);
  const [proteinConsumed, setProtein] = useState(0);
  const [carbsConsumed, setCarbs] = useState(0);
  const [fatConsumed, setFat] = useState(0);
  const [calBurned, setBurned] = useState(0);
  const [editing, setEditing] = useState(false);
  const [goalInput, setGoalInput] = useState("");
  const [proteinInput, setProteinInput] = useState("");
  const [carbsInput, setCarbsInput] = useState("");
  const [fatInput, setFatInput] = useState("");
  const [weekCalories, setWeekCalories] = useState([]);
  const screenWidth = Dimensions.get("window").width;

  const today = getTodayISO();

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const last7Days = Array.from({ length: 7 }, (_, i) =>
    getDateNDaysAgoISO(6 - i),
  );
const formatKcal = (value) => {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return `${value}`;
};

  const chartLabels = last7Days.map((date) => date.slice(5)); // "MM-DD"
const barData = last7Days.map((date) => {
  const found = weekCalories.find((d) => d.date === date);
  const value = found ? Math.round(found.total_calories) : 0;
  return {
    label: date.slice(5),
    value,
    topLabelComponent: () => (
      <Text style={{ fontSize: 10, color: "#555" }}>{formatKcal(value)}</Text>
    ),
  };
});
  const loadData = async () => {
    const s = await loadSettings(db);
    const since = getDateNDaysAgoISO(6); // 6 days back + today = 7 days
    const caloriesPerDay = await loadCaloriesPerDay(db, since);
    setWeekCalories(caloriesPerDay);
    setSettings(s);
    setGoalInput(s.calorie_goal.toString());
    setProteinInput(s.protein_goal.toString());
    setCarbsInput(s.carbs_goal.toString());
    setFatInput(s.fat_goal.toString());

    const foods = await loadDiaryEntries(db, today);
    const totalConsumed = foods.reduce(
      (somme, item) => somme + (item.calories_100g * item.quantity_g) / 100,
      0,
    );
    setConsumed(Math.round(totalConsumed));

    const totalProtein = foods.reduce(
      (somme, item) => somme + (item.protein_100g * item.quantity_g) / 100,
      0,
    );
    setProtein(Math.round(totalProtein));

    const totalCarbs = foods.reduce(
      (somme, item) => somme + (item.carbs_100g * item.quantity_g) / 100,
      0,
    );
    setCarbs(Math.round(totalCarbs));

    const totalFat = foods.reduce(
      (somme, item) => somme + (item.fat_100g * item.quantity_g) / 100,
      0,
    );
    setFat(Math.round(totalFat));

    const activities = await loadActivities(db, today);
    const totalBurned = activities.reduce(
      (somme, item) => somme + item.calories_burned,
      0,
    );
    setBurned(Math.round(totalBurned));
  };

  const saveGoal = async () => {
    if (goalInput === "") return;
    await updateSettings(db, {
      calorieGoal: parseFloat(goalInput),
      proteinGoal: parseFloat(proteinInput),
      carbsGoal: parseFloat(carbsInput),
      fatGoal: parseFloat(fatInput),
    });
    setEditing(false);
    loadData();
  };

  if (!settings) return null; // nothing to display until the settings are loaded

  const calRemaining = settings.calorie_goal - calConsumed + calBurned;
  const calProgress = Math.min(calConsumed / settings.calorie_goal, 1); // between 0 and 1, capped at 1

  const proteinRemaining = settings.protein_goal - proteinConsumed;
  const proteinProgress = Math.min(proteinConsumed / settings.protein_goal, 1); // between 0 and 1, capped at 1

  const carbsRemaining = settings.carbs_goal - carbsConsumed;
  const carbsProgress = Math.min(carbsConsumed / settings.carbs_goal, 1); // between 0 and 1, capped at 1

  const fatRemaining = settings.fat_goal - fatConsumed;
  const fatProgress = Math.min(fatConsumed / settings.fat_goal, 1); // between 0 and 1, capped at 1

  return (
    <ScrollView contentContainerStyle={globalStyles.scrollContainer}>
      <Text style={globalStyles.titre}>Aujourd'hui</Text>

      {editing ? (
        <View style={globalStyles.editBox}>
          <Text style={globalStyles.label}>Objectif calorique quotidien :</Text>
          <TextInput
            style={globalStyles.input}
            value={goalInput}
            onChangeText={setGoalInput}
            keyboardType="numeric"
          />
          <Text style={globalStyles.label}>
            Objectif de protéines quotidien :
          </Text>
          <TextInput
            style={globalStyles.input}
            value={proteinInput}
            onChangeText={setProteinInput}
            keyboardType="numeric"
          />
          <Text style={globalStyles.label}>
            Objectif de glucides quotidien :
          </Text>
          <TextInput
            style={globalStyles.input}
            value={carbsInput}
            onChangeText={setCarbsInput}
            keyboardType="numeric"
          />
          <Text style={globalStyles.label}>
            Objectif de lipides quotidien :
          </Text>
          <TextInput
            style={globalStyles.input}
            value={fatInput}
            onChangeText={setFatInput}
            keyboardType="numeric"
          />
          <Button title="Enregistrer" onPress={saveGoal} />
        </View>
      ) : (
        <View style={globalStyles.goalRow}>
          <Button title="Modifier" onPress={() => setEditing(true)} />
        </View>
      )}
      <View style={globalStyles.goalRow}>
        <Text style={globalStyles.goalText}>
          Objectif : {settings.calorie_goal} kcal
        </Text>
      </View>
      <View style={{ alignItems: "center", marginVertical: 20 }}>
        <DonutRing
          consumed={calConsumed}
          used={calBurned}
          goal={settings.calorie_goal}
          textValue="Kcal restantes"
        />
      </View>

      <View style={globalStyles.statsRow}>
        <View style={globalStyles.statBox}>
          <Text style={globalStyles.statValue}>{calConsumed}</Text>
          <Text style={globalStyles.statLabel}>Consommé</Text>
        </View>
        <View style={globalStyles.statBox}>
          <Text style={globalStyles.statValue}>{calBurned}</Text>
          <Text style={globalStyles.statLabel}>Brûlé</Text>
        </View>
        <View style={globalStyles.statBox}>
          <Text style={globalStyles.statValue}>{calRemaining}</Text>
          <Text style={globalStyles.statLabel}>Restant</Text>
        </View>
      </View>

      <View>
        <Bar
          label="Protéines"
          consumed={proteinConsumed}
          goal={settings.protein_goal}
          color="#EF5350"
          unit="g"
        />
        <Bar
          label="Glucides"
          consumed={carbsConsumed}
          goal={settings.carbs_goal}
          color="#FFA726"
          unit="g"
        />
        <Bar
          label="Lipides"
          consumed={fatConsumed}
          goal={settings.fat_goal}
          color="#42A5F5"
          unit="g"
        />
      </View>

      <View
        style={{
          marginTop: 30,
        }}
      >
        <BarChart
          data={barData}
          width={280}
          height={200}
          topLabelContainerStyle={{paddingBottom: 4}}
          barWidth={22}
          initialSpacing={10}
          spacing={18}
          barBorderRadius={4}
          frontColor="#4CAF50"
          // The goal line is added in 4 simple lines:
          showReferenceLine1
          maxValue={settings.calorie_goal * 1.1}
          referenceLine1Position={settings.calorie_goal}
          referenceLine1Config={{
            color: "#FF5722",
            dashWidth: 6,
            dashGap: 4,
            thickness: 2,
          }}
        />
      </View>
    </ScrollView>
  );
}
