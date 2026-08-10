import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  Text,
  View,
  TextInput,
  Button,
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
    try {
      await addActivityEntry(
        db,
        name,
        parseFloat(duration),
        parseFloat(caloriesBurned) || 0,
        today,
      );
      setNames("");
      setDuration("");
      setCaloriesBurned("");
      fetchActivities();
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'activité :", error);
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
    try {
      await updateActivityEntry(
        db,
        editingId,
        editNameValue,
        parseFloat(editDurationValue),
        parseFloat(editCaloriesValue),
        item.date,
      );
    } catch (error) {
      console.log(error);
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

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.titre}>Activité du {today}</Text>

      <TextInput
        style={globalStyles.input}
        value={name}
        onChangeText={setNames}
        placeholder="Type d'activité (ex: course)"
      />
      <TextInput
        style={globalStyles.input}
        value={duration}
        onChangeText={setDuration}
        placeholder="Durée (minutes)"
        keyboardType="numeric"
      />
      <TextInput
        style={globalStyles.input}
        value={caloriesBurned}
        onChangeText={setCaloriesBurned}
        placeholder="Calories brûlées (optionnel)"
        keyboardType="numeric"
      />
      <Button title="Ajouter" onPress={add} />

      <Text style={globalStyles.total}>Total brûlé : {totalBurned} kcal</Text>
      <Text style={globalStyles.total}>
        Total activité : {totalDuration} min
      </Text>

      <FlatList
        style={globalStyles.liste}
        data={activities}
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
                      value={editNameValue}
                      onChangeText={setEditNameValue}
                      placeholder="Course"
                    />
                    <Text>Durée de l'activité (minutes) :</Text>
                    <TextInput
                      value={editDurationValue}
                      keyboardType="numeric"
                      onChangeText={setEditDurationValue}
                      placeholder="min"
                    />
                    <Text>Calories brulées (Kcal) :</Text>
                    <TextInput
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
    </View>
  );
}
