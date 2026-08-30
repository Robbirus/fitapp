import { useDatabase } from "../db/DatabaseContext";
import {
  loadDiaryEntries,
  deleteDiaryEntry,
  updateDiaryEntry,
  addDiaryEntry,
} from "../db/Queries";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  Text,
  View,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
} from "react-native";
import { getTodayISO, shiftDateISO } from "../utils/DateHelpers";
import { globalStyles } from "../styles/GlobalStyles";
import { useContext } from "react";
import { AchievementContext } from "../contexts/AchievementContext";

const MEAL_SECTIONS = [
  { key: "Petit Dejeuner", label: "Petit-déjeuner" },
  { key: "Dejeuner", label: "Déjeuner" },
  { key: "Snack", label: "Collations" },
  { key: "Diner", label: "Dîner" },
];

export default function JournalScreen({ navigation }) {
  const db = useDatabase();
  const [food, setFood] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editQuantity, setEditQuantity] = useState("");
  const [editProtein, setEditProtein] = useState("");
  const [editCarb, setEditCarb] = useState("");
  const [editFat, setEditFat] = useState("");
  const [editFiber, setEditFiber] = useState("");
  const [loading, setLoading] = useState("");
  const [selectedDate, setSelectedDate] = useState(getTodayISO());
  const today = getTodayISO();
  const { showAchievement } = useContext(AchievementContext);

  const goToPreviousDay = () => {
    setSelectedDate((current) => shiftDateISO(current, -1));
  };

  const goToNextDay = () => {
    if (selectedDate >= today) return;
    setSelectedDate((current) => shiftDateISO(current, 1));
  };

  useFocusEffect(
    useCallback(() => {
      loadFoods();
    }, [selectedDate]),
  );

  const loadFoods = async () => {
    const rows = await loadDiaryEntries(db, selectedDate);
    setFood(rows);
  };

  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      setEditingId(null); // reset edit mode
      setEditQuantity(""); // reset value
      setEditCarb("");
      setEditFat("");
      setEditProtein("");
      setEditFiber("");
    } else {
      setExpandedId(id);
    }
  };

  // Calculates the actual value consumed from the value for 100g
  const actual = (per100g, quantityG) => (per100g * quantityG) / 100;

  const groupByMeal = (items) => {
    const groups = {
      "Petit Dejeuner": [],
      Dejeuner: [],
      Diner: [],
      Snack: [],
    };
    items.forEach((item) => {
      if (groups[item.meal_type]) {
        groups[item.meal_type].push(item);
      }
    });
    return groups;
  };

  const total = food.reduce(
    (somme, item) => somme + actual(item.calories_100g, item.quantity_g),
    0,
  );

  const saveEdit = async () => {
    const item = food.find((f) => f.id === editingId);
    if (!item) return;

    const parsed = {
      protein100g: parseFloat(editProtein),
      carbs100g: parseFloat(editCarb),
      fat100g: parseFloat(editFat),
      fiber100g: parseFloat(editFiber),
      quantityG: parseFloat(editQuantity),
    };
    const invalid = Object.entries(parsed).some(
      ([key, value]) => isNaN(value) || (key === "quantityG" ? value <= 0 : value < 0),
    );
    if (invalid) {
      Alert.alert(
        "Valeur invalide",
        "Chaque champ doit être un nombre valide (quantité > 0, macros ≥ 0).",
      );
      return;
    }

    try {
      await updateDiaryEntry(db, editingId, {
        name: item.name,
        calories100g: item.calories_100g,
        ...parsed,
      });
    } catch (error) {
      console.log(error);
      Alert.alert("Erreur", "Impossible d'enregistrer les modifications.");
      return;
    }
    setEditingId(null);
    loadFoods();
  };

  const confirmDelete = (id) => {
    Alert.alert(
      "Confirmer la suppression",
      "Veux-tu vraiment supprimer cet aliment ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            await deleteDiaryEntry(db, id);
            loadFoods();
          },
        },
      ],
    );
  };

  const duplicateItem = async (item) => {
    try {
      const result = await addDiaryEntry(
        db,
        {
          name: item.name,
          calories100g: item.calories_100g,
          protein100g: item.protein_100g,
          carbs100g: item.carbs_100g,
          fat100g: item.fat_100g,
          fiber100g: item.fiber_100g || 0,
          quantityG: item.quantity_g,  
          score: item.score,
          scoreType: item.score_type,
          nutriscoreGrade: item.nutriscore_grade,
          isOrganic: item.is_organic === 1,
          originCategory: item.origin_category,
        },
        today,
        item.meal_type,
      );

      if (result && result.newlyUnlockedAchievements && result.newlyUnlockedAchievements.length > 0) {
        result.newlyUnlockedAchievements.forEach((achievement) => {
          showAchievement(achievement.title, achievement.description);
        });
      }

      if (selectedDate === today) {
        loadFoods();
      } else {
        Alert.alert("Ajouté", `${item.name} a été ajouté à aujourd'hui.`);
      }
    } catch (error) {
      console.log("ERROR duplicate:", error.message);
      Alert.alert("Erreur", "Impossible de dupliquer cet aliment.");
    }
  };

  const mealGroups = groupByMeal(food);
  const mealSubtotal = (items) =>
    items.reduce(
      (somme, item) => somme + actual(item.calories_100g, item.quantity_g),
      0,
    );

  const renderFoodItem = (item) => {
    const isExpanded = item.id === expandedId;
    const realCalories = actual(item.calories_100g, item.quantity_g);

    return (
      <TouchableOpacity key={item.id} onPress={() => toggleExpand(item.id)}>
        <View style={globalStyles.ligne}>
          <Text>{item.name}</Text>
          <Text>{Math.round(realCalories)} kcal</Text>
        </View>

        {isExpanded &&
          (editingId === item.id ? (
            <View style={globalStyles.details}>
              <Text>Quantité (g) :</Text>
              <TextInput
                value={editQuantity}
                keyboardType="numeric"
                onChangeText={setEditQuantity}
                placeholder="Quantité"
              />
              <Text>Protéines (/100g) : </Text>
              <TextInput
                value={editProtein}
                keyboardType="numeric"
                onChangeText={setEditProtein}
                placeholder="Protéine"
              />
              <Text>Glucides (/100g) : </Text>
              <TextInput
                value={editCarb}
                keyboardType="numeric"
                onChangeText={setEditCarb}
                placeholder="Glucides"
              />
              <Text>Lipides (/100g) : </Text>
              <TextInput
                value={editFat}
                keyboardType="numeric"
                onChangeText={setEditFat}
                placeholder="Lipides"
              />
              <Text>Fibres (/100g) : </Text>
              <TextInput
                value={editFiber}
                keyboardType="numeric"
                onChangeText={setEditFiber}
                placeholder="Fibres"
              />
              <TouchableOpacity
                style={globalStyles.primaryButton}
                activeOpacity={0.6}
                onPress={saveEdit}
              >
                <Text style={globalStyles.primaryButtonText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={globalStyles.details}>
              <Text>Quantité : {item.quantity_g} g</Text>
              <Text>
                Protéines :{" "}
                {actual(item.protein_100g, item.quantity_g).toFixed(2)} g
              </Text>
              <Text>
                Glucides : {actual(item.carbs_100g, item.quantity_g).toFixed(2)}{" "}
                g
              </Text>
              <Text>
                Lipides : {actual(item.fat_100g, item.quantity_g).toFixed(2)} g
              </Text>
              <Text>
                Fibres :{" "}
                {actual(item.fiber_100g || 0, item.quantity_g).toFixed(2)} g
              </Text>
              <TouchableOpacity
                style={[
                  globalStyles.primaryButton,
                  { backgroundColor: "#4CAF50" },
                ]}
                onPress={() => {
                  setEditingId(item.id);
                  setEditQuantity(item.quantity_g.toString());
                  setEditProtein(item.protein_100g.toString());
                  setEditCarb(item.carbs_100g.toString());
                  setEditFat(item.fat_100g.toString());
                  setEditFiber((item.fiber_100g ?? 0).toString());
                }}
              >
                <Text style={globalStyles.primaryButtonText}>Modifier</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  globalStyles.primaryButton,
                  { backgroundColor: "#0095ff" },
                ]}
                onPress={() => duplicateItem(item)}
              >
                <Text style={globalStyles.primaryButtonText}>Dupliquer</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  globalStyles.primaryButton,
                  { backgroundColor: "#e53935" },
                ]}
                onPress={() => confirmDelete(item.id)}
              >
                <Text style={globalStyles.primaryButtonText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          ))}
      </TouchableOpacity>
    );
  };

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.titre}>Journal du {selectedDate}</Text>
      <Text style={globalStyles.total}>Total : {Math.round(total)} kcal</Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
        }}
      >
        <TouchableOpacity onPress={goToPreviousDay} style={{ padding: 8 }}>
          <Text style={{ fontSize: 28 }}>◀</Text>
        </TouchableOpacity>

        <Text style={globalStyles.subTitle}>
          {selectedDate === today ? "Aujourd'hui" : selectedDate}
        </Text>

        <TouchableOpacity
          onPress={goToNextDay}
          disabled={selectedDate >= today}
          style={{ padding: 8 }}
        >
          <Text
            style={{
              fontSize: 28,
              color: selectedDate >= today ? "#ccc" : "#000",
            }}
          >
            ▶
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={globalStyles.liste}>
        {MEAL_SECTIONS.map((section) => {
          const items = mealGroups[section.key];
          return (
            <View key={section.key} style={{ marginBottom: 20 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text style={globalStyles.subTitle}>{section.label}</Text>
                <Text style={globalStyles.subTitle}>
                  {Math.round(mealSubtotal(items))} kcal
                </Text>
              </View>

              {items.length === 0 ? (
                <Text style={{ color: "#999" }}>Aucun aliment ajouté</Text>
              ) : (
                items.map((item) => renderFoodItem(item))
              )}
            </View>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        style={globalStyles.primaryButton}
        activeOpacity={0.6}
        onPress={() => navigation.navigate("Scanner")}
      >
        <Text style={globalStyles.primaryButtonText}>Scanner un produit</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[globalStyles.primaryButton, { backgroundColor: "#8E44AD" }]}
        activeOpacity={0.6}
        onPress={() => navigation.navigate("Recipes")}
      >
        <Text style={globalStyles.primaryButtonText}>Mes recettes</Text>
      </TouchableOpacity>
    </View>
  );
}