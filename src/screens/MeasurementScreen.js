import { globalStyles } from "../styles/GlobalStyles";
import {
  Text,
  View,
  TextInput,
  Button,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useState, useCallback, useMemo } from "react";
import { getTodayISO, getDateNDaysAgoISO } from "../utils/DateHelpers";
import { useFocusEffect } from "@react-navigation/native";
import { useDatabase } from "../db/DatabaseContext";
import {
  loadLatestBodyMeasurement,
  loadBodyMeasurementHistorySince,
  addBodyMeasurementEntry,
  updateBodyMeasurementEntry,
  deleteBodyMeasurementEntry,
} from "../db/Queries";

export default function MeasurementScreen({ navigation }) {
  const db = useDatabase();
  const [waist, setWaist] = useState("");
  const [hip, setHip] = useState("");
  const [neck, setNeck] = useState("");
  const [history, setHistory] = useState([]);
  const [period, setPeriod] = useState("week"); // default period
  const screenWidth = Dimensions.get("window").width;
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editNeckValue, setEditNeckValue] = useState("");
  const [editWaistValue, setEditWaistValue] = useState("");
  const [editHipValue, setEditHipValue] = useState("");

  const PERIOD_OPTIONS = [
    { value: "week", label: "Semaine" },
    { value: "month", label: "Mois" },
    { value: "year", label: "Année" },
  ];

  const selectPeriod = (newPeriod) => {
    setPeriod(newPeriod); // updates the button display (chip selected)
    loadHistory(newPeriod); // reload with the value we have just chosen, explicitly
  };

  useFocusEffect(
    useCallback(() => {
      loadLatestMeasurement();
    }, []),
  );

  const loadLatestMeasurement = async () => {
    const latestMeasurement = await loadLatestBodyMeasurement(db);
    const sinceDate = getDateNDaysAgoISO(30); // last 30 days
    const measurementhistory = await loadBodyMeasurementHistorySince(
      db,
      sinceDate,
    );
    setWaist(latestMeasurement?.waist?.toString() || "");
    setHip(latestMeasurement?.hip?.toString() || "");
    setNeck(latestMeasurement?.neck?.toString() || "");
    setHistory(measurementhistory);
  };

  const loadHistory = async (selectedPeriod) => {
    const days =
      selectedPeriod === "week" ? 7 : selectedPeriod === "month" ? 30 : 365;
    const sinceDate = getDateNDaysAgoISO(days);
    const rows = await loadBodyMeasurementHistorySince(db, sinceDate);
    setHistory(rows);
  };

  const saveEdit = async () => {
    const item = history.find((f) => f.id === editingId);
    if (!item) return;
    try {
      await updateBodyMeasurementEntry(
        db,
        editingId,
        parseFloat(editNeckValue),
        parseFloat(editWaistValue),
        parseFloat(editHipValue),
        item.date,
      );
    } catch (error) {
      console.log(error);
    }
    setEditingId(null);
    loadLatestMeasurement();
  };

  const saveMeasurement = async () => {
    const today = getTodayISO();
    try {
      await addBodyMeasurementEntry(
        db,
        parseFloat(neck),
        parseFloat(waist),
        parseFloat(hip),
        today,
      );

      console.log("Measurement saved successfully.");
      loadLatestMeasurement();
    } catch (error) {
      console.error("Error saving measurement:", error);
    }
  };

  const maxPoints = period === "week" ? 7 : period === "month" ? 30 : 52;
  const recentHistory = history.slice(-maxPoints);

  const showEvery = period === "week" ? 1 : period === "month" ? 5 : 8;

  const labels = recentHistory.map((item, index) =>
    index % showEvery === 0 ? item.date : "",
  );

  const chartData = {
    labels,
    datasets: [
      {
        data: recentHistory.map((item) => item.waist),
        color: () => `rgba(173, 216, 230, 1)`,
      },
      {
        data: recentHistory.map((item) => item.hip),
        color: () => `rgba(76, 180, 80, 1)`,
      },
      {
        data: recentHistory.map((item) => item.neck),
        color: () => `rgba(0, 0, 128, 1)`,
      },
    ],
  };

  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      setEditingId(null); // reset edit mode
      setEditNeckValue(""); // reset value
      setEditWaistValue(""); // reset value
      setEditHipValue(""); // reset value
    } else {
      setExpandedId(id);
    }
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
            await deleteBodyMeasurementEntry(db, id);
            loadLatestMeasurement();
          },
        },
      ],
    );
  };

  const generateHeader = useMemo(() => {
    return (
      <>
        <Text style={globalStyles.label}>Tour de cou (cm) :</Text>
        <TextInput
          style={globalStyles.input}
          keyboardType="numeric"
          value={neck}
          onChangeText={setNeck}
        />
        <Text style={globalStyles.label}>Tour de taille (cm) :</Text>
        <TextInput
          style={globalStyles.input}
          keyboardType="numeric"
          value={waist}
          onChangeText={setWaist}
        />
        <Text style={globalStyles.label}>Tour de hanches (cm) :</Text>
        <TextInput
          style={globalStyles.input}
          keyboardType="numeric"
          value={hip}
          onChangeText={setHip}
        />
        <TouchableOpacity
          style={globalStyles.primaryButton}
          activeOpacity={0.6}
          onPress={saveMeasurement}
        >
          <Text style={globalStyles.primaryButtonText}>Enregistrer</Text>
        </TouchableOpacity>

        {history.length === 0 ? (
          <Text>
            Ajoute au moins une entrée de mesures corporelles pour voir ton
            graphique.
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
                  { backgroundColor: "rgba(0, 0, 128, 1)" },
                ]}
              />
              <Text>Tour de cou</Text>
            </View>
            <View style={globalStyles.legendRow}>
              <View
                style={[
                  globalStyles.legendDot,
                  { backgroundColor: "rgba(76, 180, 80, 1)" },
                ]}
              />
              <Text>Tour de taille</Text>
            </View>
            <View style={globalStyles.legendRow}>
              <View
                style={[
                  globalStyles.legendDot,
                  { backgroundColor: "rgba(173, 216, 230, 1)" },
                ]}
              />
              <Text>Tour de hanches</Text>
            </View>
          </>
        )}
      </>
    );
  }, [neck, waist, hip, history, period, chartData, screenWidth]);

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
                <Text>Mesure du {item.date}</Text>
              </View>

              {isExpanded &&
                (editingId === item.id ? ( // edit mode
                  <View style={globalStyles.details}>
                    <Text>Tour de cou (cm) :</Text>
                    <TextInput
                      value={editNeckValue}
                      keyboardType="numeric"
                      onChangeText={setEditNeckValue}
                      placeholder="cm"
                    />
                    <Text>Tour de taille (cm) :</Text>
                    <TextInput
                      value={editWaistValue}
                      keyboardType="numeric"
                      onChangeText={setEditWaistValue}
                      placeholder="cm"
                    />
                    <Text>Tour de hanche (cm) :</Text>
                    <TextInput
                      value={editHipValue}
                      keyboardType="numeric"
                      onChangeText={setEditHipValue}
                      placeholder="cm"
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
                    <Text>Tour de cou : {item.neck} cm</Text>
                    <Text>Tour de taille : {item.waist} cm</Text>
                    <Text>Tour de hanches : {item.hip} cm</Text>
                    <TouchableOpacity
                      style={[
                        globalStyles.primaryButton,
                        { backgroundColor: "#4CAF50" },
                      ]}
                      onPress={() => {
                        setEditingId(item.id);
                        setEditNeckValue(item.neck.toString());
                        setEditWaistValue(item.waist.toString());
                        setEditHipValue(item.hip.toString());
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
        onPress={() => navigation.navigate("Ratio Taille")}
      >
        <Text style={globalStyles.primaryButtonText}>
          Voir Ratio Taille-Hanche
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={globalStyles.primaryButton}
        activeOpacity={0.6}
        onPress={() => navigation.navigate("Composition Corporelle")}
      >
        <Text style={globalStyles.primaryButtonText}>
          Voir Composition Corporelle
        </Text>
      </TouchableOpacity>
    </>
  );
}
