import { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useDatabase } from "../db/DatabaseContext";
import { loadRecipes, deleteRecipe } from "../db/Queries";
import { globalStyles } from "../styles/GlobalStyles";
import { getScoreBand } from "../utils/FoodScore";
import ScoreBadge from "../components/ScoreBadge";

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
            <View key={recipe.id} style={[globalStyles.card, { marginBottom: 12 }]}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("RecipeLog", { recipeId: recipe.id })
                }
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={globalStyles.sectionTitle}>{recipe.name}</Text>
                  {typeof recipe.score === "number" && (
                    <ScoreBadge 
                      scoreResult={{ 
                        score: recipe.score, 
                        scoreType: "recipe" 
                      }}
                      compact={true} 
                    />
                  )}
                </View>
                
                <Text style={globalStyles.sectionSubtitle}>
                  {recipe.ingredient_count} ingrédient
                  {recipe.ingredient_count > 1 ? "s" : ""} ·{" "}
                  {Math.round(recipe.total_calories)} kcal au total
                </Text>
                <View style={{ flexDirection: "row", gap: 14, marginTop: -8, marginBottom: 8 }}>
                  <Text style={{ fontSize: 12, color: "#EF5350" }}>
                    P {Math.round(recipe.total_protein)} g
                  </Text>
                  <Text style={{ fontSize: 12, color: "#FFA726" }}>
                    G {Math.round(recipe.total_carbs)} g
                  </Text>
                  <Text style={{ fontSize: 12, color: "#42A5F5" }}>
                    L {Math.round(recipe.total_fat)} g
                  </Text>
                  <Text style={{ fontSize: 12, color: "#8D6E63" }}>
                    Fibres {Math.round(recipe.total_fiber)} g
                  </Text>
                </View>
              </TouchableOpacity>
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