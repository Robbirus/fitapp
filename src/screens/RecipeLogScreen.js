import { useState, useEffect, useContext } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useDatabase } from "../db/DatabaseContext";
import {
  loadRecipeWithIngredients,
  addDiaryEntry,
  loadProfileSettings,
  notifyUnlockedAchievements,
} from "../db/Queries";
import { getTodayISO } from "../utils/DateHelpers";
import { globalStyles, MACRO_COLORS } from "../styles/GlobalStyles";
import { journalStyles } from "../styles/LogStyle";
import {
  DEFAULT_MEAL_TIMES,
  MEAL_PERIOD,
  guessMealFromTimes,
} from "../utils/MealHelpers";
import { computeWeightedScore, getScoreBand } from "../utils/FoodScore";
import ScoreBadge from "../components/ScoreBadge";
import { AchievementContext } from "../contexts/AchievementContext";

export default function RecipeLogScreen({ navigation, route }) {
  const db = useDatabase();
  const recipeId = route.params?.recipeId;
  const [loading, setLoading] = useState(true);
  const { showAchievement } = useContext(AchievementContext);
  const [recipeName, setRecipeName] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState(() =>
    guessMealFromTimes(DEFAULT_MEAL_TIMES),
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (recipeName) navigation.setOptions({ title: recipeName });
  }, [navigation, recipeName]);

  useEffect(() => {
    const load = async () => {
      if (!db || !recipeId) return;
      try {
        const [recipe, profile] = await Promise.all([
          loadRecipeWithIngredients(db, recipeId),
          loadProfileSettings(db),
        ]);
        if (!recipe) {
          Alert.alert("Introuvable", "Cette recette n'existe plus.");
          navigation.goBack();
          return;
        }
        setRecipeName(recipe.name);
        setIngredients(
          recipe.ingredients.map((ing) => ({
            name: ing.name,
            calories100g: ing.calories_100g,
            protein100g: ing.protein_100g,
            carbs100g: ing.carbs_100g,
            fat100g: ing.fat_100g,
            fiber100g: ing.fiber_100g,
            quantityG: ing.quantity_g.toString(),
            score: ing.score,
          })),
        );
        if (profile?.meal_times) {
          try {
            setSelectedMeal(
              guessMealFromTimes(JSON.parse(profile.meal_times)),
            );
          } catch (e) {
            // JSON invalide -> on garde le fallback par défaut déjà en place
          }
        }
      } catch (error) {
        console.log("ERROR loading recipe:", error.message);
        Alert.alert("Erreur", "Impossible de charger cette recette.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [db, recipeId]);

  const updateQuantity = (index, value) => {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === index ? { ...ing, quantityG: value } : ing)),
    );
  };

  const totals = ingredients.reduce(
    (acc, ing) => {
      const qty = parseFloat(ing.quantityG) || 0;
      acc.weight += qty;
      acc.calories += (ing.calories100g * qty) / 100;
      acc.protein += (ing.protein100g * qty) / 100;
      acc.carbs += (ing.carbs100g * qty) / 100;
      acc.fat += (ing.fat100g * qty) / 100;
      acc.fiber += (ing.fiber100g * qty) / 100;
      return acc;
    },
    { weight: 0, calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  );

  // Recomputed from the quantities as currently edited on screen (not the recipe's
  // stored template score), since the user may adjust portions before logging.
  const dishScore = computeWeightedScore(
    ingredients.map((ing) => ({ score: ing.score, quantityG: parseFloat(ing.quantityG) || 0 })),
  );
  const dishScoreBand = dishScore !== null ? getScoreBand(dishScore) : null;

  const addToJournal = async () => {
    const invalid = ingredients.some(
      (ing) =>
        isNaN(parseFloat(ing.quantityG)) || parseFloat(ing.quantityG) < 0,
    );
    if (invalid) {
      Alert.alert(
        "Valeur invalide",
        "Chaque quantité doit être un nombre positif ou nul.",
      );
      return;
    }
    if (totals.weight <= 0) {
      Alert.alert(
        "Recette vide",
        "Le poids total de la recette doit être supérieur à 0.",
      );
      return;
    }

    setSaving(true);
    try {
      // Une seule ligne de journal, ramenée à des valeurs pour 100g à partir du
      // total réellement consommé -> reste compatible avec le modèle diary_entries
      // existant (addDiaryEntry, LogScreen, dupliquer/éditer une entrée...).
      const result = await addDiaryEntry(
        db,
        {
          name: recipeName,
          calories100g: (totals.calories / totals.weight) * 100,
          protein100g: (totals.protein / totals.weight) * 100,
          carbs100g: (totals.carbs / totals.weight) * 100,
          fat100g: (totals.fat / totals.weight) * 100,
          fiber100g: (totals.fiber / totals.weight) * 100,
          quantityG: totals.weight,
          score: dishScore,
          // "recipe": composite score of a home-made dish -- individual ingredients may
          // have their own nutriscore/organic/origin, but those don't reduce to a single
          // value for a mixed dish, so we only keep the aggregated numeric score.
          scoreType: dishScore !== null ? "recipe" : null,
          nutriscoreGrade: null,
          isOrganic: null,
          originCategory: null,
        },
        getTodayISO(),
        selectedMeal,
      );
      const unlocked = notifyUnlockedAchievements(result, showAchievement);
      if (unlocked.length === 0) {
        Alert.alert("Ajouté !", `${recipeName} a été ajouté au journal.`);
      }
      navigation.goBack();
    } catch (error) {
      console.log("ERROR adding recipe to journal:", error.message);
      Alert.alert("Erreur", "Impossible d'ajouter cette recette au journal.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={globalStyles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={globalStyles.scrollContainer}>
            {dishScore !== null && (
              <View style={journalStyles.scoreBadgeWrapper}>
                <ScoreBadge 
                  scoreResult={{
                    score: dishScore,
                    scoreType: "recipe",
                  }}
                  macros={{
                    calories100g: totals.weight > 0 ? (totals.calories / totals.weight) * 100 : 0,
                    protein100g: totals.weight > 0 ? (totals.protein / totals.weight) * 100 : 0,
                    fiber100g: totals.weight > 0 ? (totals.fiber / totals.weight) * 100 : 0,
                    fat100g: totals.weight > 0 ? (totals.fat / totals.weight) * 100 : 0,
                  }}
                />
              </View>
            )}

      <Text style={globalStyles.label}>Repas :</Text>
      <View style={globalStyles.optionsRow}>
        {MEAL_PERIOD.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[
              globalStyles.option,
              selectedMeal === opt.value && globalStyles.optionSelected,
            ]}
            onPress={() => setSelectedMeal(opt.value)}
          >
            <Text
              style={
                selectedMeal === opt.value
                  ? globalStyles.optionTextSelected
                  : globalStyles.optionText
              }
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[globalStyles.label, journalStyles.labelSpaced]}>
        Ingrédients (ajuste les quantités si besoin) :
      </Text>
      {ingredients.map((ing, index) => (
        <View key={index} style={[globalStyles.details, journalStyles.ingredientCardSpacing]}>
          <Text style={journalStyles.ingredientName}>{ing.name}</Text>
          <Text style={journalStyles.ingredientCalories}>
            {Math.round(ing.calories100g)} kcal/100g
          </Text>
          <View style={journalStyles.quantityRow}>
            <Text>Quantité (g) :</Text>
            <TextInput
              style={[globalStyles.input, journalStyles.quantityInput]}
              value={ing.quantityG}
              onChangeText={(value) => updateQuantity(index, value)}
              keyboardType="numeric"
            />
          </View>
        </View>
      ))}

      <View style={[globalStyles.infoBanner, journalStyles.totalsBanner]}>
        <Text style={globalStyles.infoText}>
          Total : {Math.round(totals.weight)} g ·{" "}
          {Math.round(totals.calories)} kcal
        </Text>
        <View style={journalStyles.totalsMacroRow}>
          <Text style={[journalStyles.totalsMacroText, { color: MACRO_COLORS.protein }]}>
            Protéines {Math.round(totals.protein)} g
          </Text>
          <Text style={[journalStyles.totalsMacroText, { color: MACRO_COLORS.carbs }]}>
            Glucides {Math.round(totals.carbs)} g
          </Text>
          <Text style={[journalStyles.totalsMacroText, { color: MACRO_COLORS.fat }]}>
            Lipides {Math.round(totals.fat)} g
          </Text>
          <Text style={[journalStyles.totalsMacroText, { color: MACRO_COLORS.fiber }]}>
            Fibres {Math.round(totals.fiber)} g
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          globalStyles.primaryButton,
          { backgroundColor: "#4CAF50", marginTop: 10 },
        ]}
        activeOpacity={0.6}
        onPress={addToJournal}
        disabled={saving}
      >
        <Text style={globalStyles.primaryButtonText}>
          {saving ? "Ajout..." : "Ajouter au journal"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}