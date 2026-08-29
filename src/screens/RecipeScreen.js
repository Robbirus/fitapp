import { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useDatabase } from "../db/DatabaseContext";
import { loadRecipes, deleteRecipe } from "../db/Queries";
import { globalStyles } from "../styles/GlobalStyles";
import { getScoreBand } from "../utils/FoodScore";

export default function RecipesScreen({ navigation }) {
  const db = useDatabase();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [db]),
  );

  const loadAll = async () => {
    if (!db) return;
    setLoading(true);
    try {
      const rows = await loadRecipes(db);
      setRecipes(rows);
    } catch (error) {
      console.log("ERROR loading recipes:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (recipe) => {
    Alert.alert(
      "Supprimer la recette",
      `Supprimer "${recipe.name}" ? Cette action est irréversible.`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteRecipe(db, recipe.id);
              loadAll();
            } catch (error) {
              console.log("ERROR deleting recipe:", error.message);
              Alert.alert("Erreur", "Impossible de supprimer cette recette.");
            }
          },
        },
      ],
    );
  };

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.titre}>Mes recettes</Text>

      <TouchableOpacity
        style={globalStyles.primaryButton}
        activeOpacity={0.6}
        onPress={() => navigation.navigate("RecipeBuilder", {})}
      >
        <Text style={globalStyles.primaryButtonText}>+ Nouvelle recette</Text>
      </TouchableOpacity>

      <ScrollView style={{ marginTop: 10 }}>
        {recipes.map((recipe) => {
          const band =
            typeof recipe.score === "number" ? getScoreBand(recipe.score) : null;
          return (
          <View
            key={recipe.id}
            style={[globalStyles.card, { marginBottom: 12 }]}
          >
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("RecipeLog", { recipeId: recipe.id })
              }
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={globalStyles.sectionTitle}>{recipe.name}</Text>
                {band && (
                  <View style={{ backgroundColor: band.color, borderRadius: 6, paddingVertical: 2, paddingHorizontal: 8 }}>
                    <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>
                      {Math.round(recipe.score)}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={globalStyles.sectionSubtitle}>
                {recipe.ingredient_count} ingrédient
                {recipe.ingredient_count > 1 ? "s" : ""} ·{" "}
                {Math.round(recipe.total_calories)} kcal au total
              </Text>
            </TouchableOpacity>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
              <TouchableOpacity
                style={[
                  globalStyles.primaryButton,
                  { flex: 1, backgroundColor: "#4CAF50", marginVertical: 0 },
                ]}
                onPress={() =>
                  navigation.navigate("RecipeLog", { recipeId: recipe.id })
                }
              >
                <Text style={globalStyles.primaryButtonText}>
                  Ajouter au journal
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  globalStyles.primaryButton,
                  {
                    backgroundColor: "#999",
                    marginVertical: 0,
                    paddingHorizontal: 14,
                  },
                ]}
                onPress={() =>
                  navigation.navigate("RecipeBuilder", {
                    recipeId: recipe.id,
                  })
                }
              >
                <Text style={globalStyles.primaryButtonText}>Modifier</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  globalStyles.primaryButton,
                  {
                    backgroundColor: "#e53935",
                    marginVertical: 0,
                    paddingHorizontal: 14,
                  },
                ]}
                onPress={() => confirmDelete(recipe)}
              >
                <Text style={globalStyles.primaryButtonText}>Suppr.</Text>
              </TouchableOpacity>
            </View>
          </View>
          );
        })}
        {!loading && recipes.length === 0 && (
          <Text style={{ color: "#999", marginTop: 20, textAlign: "center" }}>
            Aucune recette pour l'instant. Crée ta première recette avec le
            bouton ci-dessus.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}