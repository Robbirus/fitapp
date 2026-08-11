import { useDatabase } from "../db/DatabaseContext";
import {
  loadDiaryEntries,
  deleteDiaryEntry,
  updateDiaryEntry,
} from "../db/Queries";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  Text,
  View,
  Button,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { getTodayISO } from "../utils/DateHelpers";
import { globalStyles } from "../styles/GlobalStyles";

export default function JournalScreen({ navigation }) {
  const db = useDatabase();
  const [food, setFood] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editQuantity, setEditQuantity] = useState("");
  const [editProtein, setEditProtein] = useState("");
  const [editCarb, setEditCarb] = useState("");
  const [editFat, setEditFat] = useState("");

  const today = getTodayISO();

  useFocusEffect(
    useCallback(() => {
      loadFoods();
    }, []),
  );

  const loadFoods = async () => {
    const rows = await loadDiaryEntries(db, today);
    setFood(rows);
  };

  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      setEditingId(null); // reset edit mode
      setEditQuantity(""); // reset value
      setEditCarb("");
      setEditFat("");
    } else {
      setExpandedId(id);
    }
  };

  // Calculates the actual value consumed from the value for 100g
  const actual = (per100g, quantityG) => (per100g * quantityG) / 100;

  const total = food.reduce(
    (somme, item) => somme + actual(item.calories_100g, item.quantity_g),
    0,
  );

  const saveEdit = async () => {
    const item = food.find((f) => f.id === editingId);
    if (!item) return;
    try {
      await updateDiaryEntry(db, editingId, {
        name: item.name,
        calories100g: item.calories_100g,
        protein100g: parseFloat(editProtein),
        carbs100g: parseFloat(editCarb),
        fat100g: parseFloat(editFat),
        quantityG: parseFloat(editQuantity),
      });
    } catch (error) {
      console.log(error);
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

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.titre}>Journal du {today}</Text>
      <Text style={globalStyles.total}>Total : {Math.round(total)} kcal</Text>

      <FlatList
        style={globalStyles.liste}
        data={food}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const isExpanded = item.id === expandedId;
          const realCalories = actual(item.calories_100g, item.quantity_g);

          return (
            <TouchableOpacity onPress={() => toggleExpand(item.id)}>
              <View style={globalStyles.ligne}>
                <Text>{item.name}</Text>
                <Text>{Math.round(realCalories)} kcal</Text>
              </View>

              {isExpanded &&
                (editingId === item.id ? (
                  // edit mode
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
                    <Text>Quantité : {item.quantity_g} g</Text>
                    <Text>
                      Protéines :{" "}
                      {Math.round(actual(item.protein_100g, item.quantity_g))} g
                    </Text>
                    <Text>
                      Glucides :{" "}
                      {Math.round(actual(item.carbs_100g, item.quantity_g))} g
                    </Text>
                    <Text>
                      Lipides :{" "}
                      {Math.round(actual(item.fat_100g, item.quantity_g))} g
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
        onPress={() => navigation.navigate("Scanner")}
      >
        <Text style={globalStyles.primaryButtonText}>Scanner un produit</Text>
      </TouchableOpacity>
    </View>
  );
}
