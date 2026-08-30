import { useState, useCallback, useMemo } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  Text,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useDatabase } from "../db/DatabaseContext";
import {
  loadActivities,
  addActivityEntry,
  deleteActivityEntry,
  updateActivityEntry,
} from "../db/Queries";
import { getTodayISO } from "../utils/DateHelpers";
import { globalStyles } from "../styles/GlobalStyles";

export default function ActivityScreen() {
  const db = useDatabase();
  const [name, setNames] = useState("");
  const [duration, setDuration] = useState("");
  const [caloriesBurned, setCaloriesBurned] = useState("");
  const [activities, setActivities] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editNameValue, setEditNameValue] = useState("");
  const [editDurationValue, setEditDurationValue] = useState("");
  const [editCaloriesValue, setEditCaloriesValue] = useState("");

  const today = getTodayISO();

  useFocusEffect(
    useCallback(() => {
      fetchActivities();
    }, []),
  );

  const fetchActivities = async () => {
    const rows = await loadActivities(db, today);
    setActivities(rows);
  };

  const add = async () => {
    if (name === "" || duration === "") return;

    const parsedDuration = parseFloat(duration);
    if (isNaN(parsedDuration) || parsedDuration <= 0) {
      Alert.alert(
        "Valeur invalide",
        "La durée doit être un nombre supérieur à 0.",
      );
      return;
    }

    const parsedCalories = parseFloat(caloriesBurned);
    if (caloriesBurned !== "" && (isNaN(parsedCalories) || parsedCalories < 0)) {
      Alert.alert(
        "Valeur invalide",
        "Les calories doivent être un nombre positif.",
      );
      return;
    }

    try {
      await addActivityEntry(
        db,
        name,
        parsedDuration,
        parsedCalories || 0,
        today,
      );
      setNames("");
      setDuration("");
      setCaloriesBurned("");
      fetchActivities();
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'activité :", error);
      Alert.alert("Erreur", "Impossible d'enregistrer cette activité.");
    }
  };

  const totalBurned = activities.reduce(
    (somme, item) => somme + item.calories_burned,
    0,
  );

  const totalDuration = activities.reduce(
    (somme, item) => somme + item.duration,
    0,
  );

  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      setEditingId(null); // reset edit mode
      setEditNameValue(""); // reset value
      setEditDurationValue(""); // reset value
      setEditCaloriesValue(""); // reset value
    } else {
      setExpandedId(id);
    }
  };

  const saveEdit = async () => {
    const item = activities.find((f) => f.id === editingId);
    if (!item) return;

    if (editNameValue.trim() === "") {
      Alert.alert("Champ manquant", "Le nom de l'activité est requis.");
      return;
    }

    const parsedDuration = parseFloat(editDurationValue);
    if (isNaN(parsedDuration) || parsedDuration <= 0) {
      Alert.alert(
        "Valeur invalide",
        "La durée doit être un nombre supérieur à 0.",
      );
      return;
    }

    const parsedCalories = parseFloat(editCaloriesValue);
    if (isNaN(parsedCalories) || parsedCalories < 0) {
      Alert.alert(
        "Valeur invalide",
        "Les calories doivent être un nombre positif.",
      );
      return;
    }

    try {
      await updateActivityEntry(
        db,
        editingId,
        editNameValue,
        parsedDuration,
        parsedCalories,
        item.date,
      );
    } catch (error) {
      console.log(error);
      Alert.alert("Erreur", "Impossible de modifier cette activité.");
    }
    setEditingId(null);
    fetchActivities();
  };

  const confirmDelete = (id) => {
    Alert.alert(
      "Confirmer la suppression",
      "Veux-tu vraiment supprimer cette activité ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            await deleteActivityEntry(db, id);
            fetchActivities();
          },
        },
      ],
    );
  };

  const generateHeader = useMemo(() => {
    return (
      <>
        <Text style={globalStyles.subTitle}>Activité du {today}</Text>

        <View style={[globalStyles.card, { marginBottom: 16 }]}>
          <Text style={globalStyles.sectionTitle}>Ajouter une activité</Text>

          <Text style={globalStyles.label}>Type d'activité :</Text>
          <TextInput
            style={globalStyles.input}
            value={name}
            onChangeText={setNames}
            placeholder="ex: course"
          />

          <Text style={globalStyles.label}>Durée (minutes) :</Text>
          <TextInput
            style={globalStyles.input}
            value={duration}
            onChangeText={setDuration}
            placeholder="ex: 30"
            keyboardType="numeric"
          />

          <Text style={globalStyles.label}>Calories brûlées (optionnel) :</Text>
          <TextInput
            style={globalStyles.input}
            value={caloriesBurned}
            onChangeText={setCaloriesBurned}
            placeholder="ex: 250"
            keyboardType="numeric"
          />

          <TouchableOpacity
            style={globalStyles.primaryButton}
            activeOpacity={0.6}
            onPress={add}
          >
            <Text style={globalStyles.primaryButtonText}>Ajouter</Text>
          </TouchableOpacity>
        </View>

        <View style={globalStyles.gridContainer}>
          <View style={globalStyles.miniCard}>
            <Text style={globalStyles.miniCardTitle}>Total brûlé</Text>
            <Text style={globalStyles.miniCardValue}>
              {totalBurned} <Text style={globalStyles.miniCardUnit}>kcal</Text>
            </Text>
          </View>
          <View style={globalStyles.miniCard}>
            <Text style={globalStyles.miniCardTitle}>Total activité</Text>
            <Text style={globalStyles.miniCardValue}>
              {totalDuration} <Text style={globalStyles.miniCardUnit}>min</Text>
            </Text>
          </View>
        </View>

        {activities.length > 0 && (
          <Text style={[globalStyles.sectionTitle, { marginTop: 16 }]}>
            Activités du jour
          </Text>
        )}
      </>
    );
  }, [name, duration, caloriesBurned, totalBurned, totalDuration, activities]);

  return (
    <FlatList
      contentContainerStyle={globalStyles.scrollContainer}
      data={activities}
      ListHeaderComponent={generateHeader}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => {
        const isExpanded = item.id === expandedId;

        return (
          <TouchableOpacity onPress={() => toggleExpand(item.id)}>
            <View style={globalStyles.ligne}>
              <Text>{item.name}</Text>
              <Text>{Math.round(item.calories_burned)} kcal</Text>
            </View>

            {isExpanded &&
              (editingId === item.id ? ( // edit mode
                <View style={globalStyles.details}>
                  <Text>Nom de l'activité :</Text>
                  <TextInput
                    style={globalStyles.input}
                    value={editNameValue}
                    onChangeText={setEditNameValue}
                    placeholder="Course"
                  />
                  <Text>Durée de l'activité (minutes) :</Text>
                  <TextInput
                    style={globalStyles.input}
                    value={editDurationValue}
                    keyboardType="numeric"
                    onChangeText={setEditDurationValue}
                    placeholder="min"
                  />
                  <Text>Calories brûlées (Kcal) :</Text>
                  <TextInput
                    style={globalStyles.input}
                    value={editCaloriesValue}
                    keyboardType="numeric"
                    onChangeText={setEditCaloriesValue}
                    placeholder="Kcal"
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
                  <Text>Durée : {item.duration} min</Text>
                  <TouchableOpacity
                    style={[
                      globalStyles.primaryButton,
                      { backgroundColor: "#4CAF50" },
                    ]}
                    onPress={() => {
                      setEditingId(item.id);
                      setEditNameValue(item.name.toString());
                      setEditDurationValue(item.duration.toString());
                      setEditCaloriesValue(item.calories_burned.toString());
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
  );
}