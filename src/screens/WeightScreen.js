import { useState, useCallback, useMemo } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useDatabase } from "../db/DatabaseContext";
import {
  loadWeightHistorySince,
  addWeightEntry,
  loadProfileSettings,
  deleteWeightEntry,
  updateWeightEntry,
} from "../db/Queries";
import { Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { getTodayISO, getDateNDaysAgoISO } from "../utils/DateHelpers";
import {
  Text,
  View,
  TextInput,
  Button,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  calculateWeightGoal,
  calculateProjectedWeight,
} from "../utils/NutritionCalculator";
import { globalStyles } from "../styles/GlobalStyles";

const screenWidth = Dimensions.get("window").width;

const PERIOD_OPTIONS = [
  { value: "week", label: "Semaine" },
  { value: "month", label: "Mois" },
  { value: "year", label: "Année" },
];

export default function WeightScreen({ navigation }) {
  const db = useDatabase();
  const [weight, setWeight] = useState("");
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [period, setPeriod] = useState("week"); // default period
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadHistory(period);
      loadProfileSettings(db).then(setProfile);
    }, [period]),
  );

  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      setEditingId(null); // reset edit mode
      setEditValue(""); // reset value
    } else {
      setExpandedId(id);
    }
  };

  const selectPeriod = (newPeriod) => {
    setPeriod(newPeriod); // updates the button display (chip selected)
    loadHistory(newPeriod); // reload with the value we have just chosen, explicitly
  };

  const loadHistory = async (selectedPeriod) => {
    const days =
      selectedPeriod === "week" ? 7 : selectedPeriod === "month" ? 30 : 365;
    const sinceDate = getDateNDaysAgoISO(days);
    const rows = await loadWeightHistorySince(db, sinceDate);
    setHistory(rows);
  };

  const saveWeight = async () => {
    if (weight === "") return;
    const today = getTodayISO();
    try {
      await addWeightEntry(db, parseFloat(weight), today);
      setWeight("");
      loadHistory(period); // reload the history after adding a new entry
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'entrée de poids :", error);
    }
  };

  const saveEdit = async () => {
    const item = history.find((f) => f.id === editingId);
    if (!item) return;
    try {
      await updateWeightEntry(db, editingId, parseFloat(editValue), item.date);
    } catch (error) {
      console.log(error);
    }
    setEditingId(null);
    loadHistory(period);
  };

  const maxPoints = period === "week" ? 7 : period === "month" ? 30 : 52;
  const recentHistory = history.slice(-maxPoints);
  const goalLine = profile
    ? recentHistory.map((item) =>
        calculateProjectedWeight({
          goalStartDate: profile.goal_start_date,
          goalStartWeight: profile.goal_start_weight,
          weightGoal: profile.weight_goal,
          weightGoalRate: profile.weight_goal_rate,
          targetDate: item.date,
        }),
      )
    : [];

  const showEvery = period === "week" ? 1 : period === "month" ? 5 : 8;
  const labels = recentHistory.map((item, index) =>
    index % showEvery === 0 ? item.date : "",
  );

  const chartData = {
    labels,
    datasets: [
      {
        data: recentHistory.map((item) => item.value),
        color: () => `rgba(76, 175, 80, 1)`,
      },
      ...(profile?.goal_start_date
        ? [{ data: goalLine, color: () => `rgba(255, 99, 132, 1)` }]
        : []),
    ],
  };

  const confirmDelete = (id) => {
    Alert.alert(
      "Confirmer la suppression",
      "Veux-tu vraiment supprimer ce poids ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            await deleteWeightEntry(db, id);
            loadHistory(period);
          },
        },
      ],
    );
  };

  const generateHeader = useMemo(() => {
    return (
      <>
        <Text style={globalStyles.label}>Ton poids aujourd'hui (kg) :</Text>
        <TextInput
          style={globalStyles.input}
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
          placeholder="ex: 75.5"
        />

        <TouchableOpacity
          style={globalStyles.primaryButton}
          activeOpacity={0.6}
          onPress={saveWeight}
        >
          <Text style={globalStyles.primaryButtonText}>Enregistrer</Text>
        </TouchableOpacity>

        {history.length === 0 ? (
          <Text>
            Ajoute au moins une entrée de poids pour voir ton graphique.
          </Text>
        ) : (
          <>
            <View style={globalStyles.optionsRow}>
              {PERIOD_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    globalStyles.option,
                    period === opt.value && globalStyles.optionSelected,
                  ]}
                  onPress={() => selectPeriod(opt.value)}
                >
                  <Text
                    style={
                      period === opt.value
                        ? globalStyles.optionTextSelected
                        : globalStyles.optionText
                    }
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={true}
              style={{ height: 240 }}
            >
              <LineChart
                data={chartData}
                width={Math.max(screenWidth - 40, recentHistory.length * 40)} // dynamic width based on number of points
                height={220}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#ffffff",
                  backgroundGradientTo: "#ffffff",
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                bezier
              />
            </ScrollView>
            <View style={globalStyles.legendRow}>
              <View
                style={[
                  globalStyles.legendDot,
                  { backgroundColor: "rgba(76, 175, 80, 1)" },
                ]}
              />
              <Text>Poids réel</Text>
              {profile?.goal_start_date && (
                <>
                  <View
                    style={[
                      globalStyles.legendDot,
                      { backgroundColor: "rgba(255, 99, 132, 1)" },
                    ]}
                  />
                  <Text>Objectif</Text>
                </>
              )}
            </View>
          </>
        )}
      </>
    );
  }, [weight, history, period, profile, chartData]);

  return (
    <>
      <FlatList
        contentContainerStyle={globalStyles.scrollContainer}
        data={history}
        ListHeaderComponent={generateHeader}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const isExpanded = item.id === expandedId;
          return (
            <TouchableOpacity onPress={() => toggleExpand(item.id)}>
              <View style={globalStyles.ligne}>
                <Text>{item.date}</Text>
                <Text>{item.value} Kg</Text>
              </View>

              {isExpanded &&
                (editingId === item.id ? ( // edit mode
                  <View style={globalStyles.details}>
                    <Text>Poids (Kg) :</Text>
                    <TextInput
                      value={editValue}
                      keyboardType="numeric"
                      onChangeText={setEditValue}
                      placeholder="Mass"
                    />

                    <TouchableOpacity
                      style={globalStyles.primaryButton}
                      activeOpacity={0.6}
                      onPress={saveEdit}
                    >
                      <Text style={globalStyles.primaryButtonText}>
                        Enregistrer
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={globalStyles.details}>
                    <TouchableOpacity
                      style={[
                        globalStyles.primaryButton,
                        { backgroundColor: "#4CAF50" },
                      ]}
                      onPress={() => {
                        setEditingId(item.id);
                        setEditValue(item.value.toString());
                      }}
                    >
                      <Text style={globalStyles.primaryButtonText}>
                        Modifier
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        globalStyles.primaryButton,
                        { backgroundColor: "#e53935" },
                      ]}
                      onPress={() => confirmDelete(item.id)}
                    >
                      <Text style={globalStyles.primaryButtonText}>
                        Supprimer
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity
        style={globalStyles.primaryButton}
        activeOpacity={0.6}
        onPress={() => navigation.navigate("IMC")}
      >
        <Text style={globalStyles.primaryButtonText}>Voir IMC</Text>
      </TouchableOpacity>
    </>
  );
}
