import { useState, useEffect } from "react";
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
  createRecipe,
  updateRecipe,
  loadRecipeWithIngredients,
  loadRecentFoods,
} from "../db/Queries";
import { globalStyles } from "../styles/GlobalStyles";
import {
  computeScoreFromOFF,
  computeScoreFromMacros,
  computeWeightedScore,
  getScoreBand,
} from "../utils/FoodScore";
import ScoreBadge from "../components/ScoreBadge";

export default function RecipeBuilderScreen({ navigation, route }) {
  const db = useDatabase();
  const recipeId = route.params?.recipeId ?? null;
  const isEditing = recipeId !== null;

  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  // pickerMode : null | 'search' | 'recent' | 'manual'
  const [pickerMode, setPickerMode] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [recentFoods, setRecentFoods] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  const [mName, setMName] = useState("");
  const [mCalories, setMCalories] = useState("");
  const [mProtein, setMProtein] = useState("");
  const [mCarbs, setMCarbs] = useState("");
  const [mFat, setMFat] = useState("");
  const [mFiber, setMFiber] = useState("");
  const [mQuantity, setMQuantity] = useState("100");

  useEffect(() => {
    const load = async () => {
      if (!db || !isEditing) return;
      try {
        const recipe = await loadRecipeWithIngredients(db, recipeId);
        if (recipe) {
          setName(recipe.name);
          setIngredients(
            recipe.ingredients.map((ing) => ({
              name: ing.name,
              calories100g: ing.calories_100g,
              protein100g: ing.protein_100g,
              carbs100g: ing.carbs_100g,
              fat100g: ing.fat_100g,
              fiber100g: ing.fiber_100g,
              quantityG: ing.quantity_g.toString(),
              // Score fields carried over as-is so editing quantities doesn't require
              // re-fetching OFF data for ingredients that already have a score.
              score: ing.score,
              scoreType: ing.score_type,
              nutriscoreGrade: ing.nutriscore_grade,
              isOrganic: ing.is_organic === 1,
              originCategory: ing.origin_category,
            })),
          );
        }
      } catch (error) {
        console.log("ERROR loading recipe:", error.message);
        Alert.alert("Erreur", "Impossible de charger cette recette.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [db, isEditing, recipeId]);

  const addIngredient = (ing) => {
    setIngredients((prev) => [...prev, ing]);
    setPickerMode(null);
    setSearchQuery("");
    setSearchResults([]);
  };

  const removeIngredient = (index) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const updateIngredientQuantity = (index, value) => {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === index ? { ...ing, quantityG: value } : ing)),
    );
  };

  const openManualForm = () => {
    setMName("");
    setMCalories("");
    setMProtein("");
    setMCarbs("");
    setMFat("");
    setMFiber("");
    setMQuantity("100");
    setPickerMode("manual");
  };

  const confirmManualIngredient = () => {
    const calories = parseFloat(mCalories);
    const quantity = parseFloat(mQuantity);
    if (mName.trim() === "") {
      Alert.alert("Champ manquant", "Le nom de l'ingrédient est requis.");
      return;
    }
    if (isNaN(calories) || calories < 0) {
      Alert.alert(
        "Valeur invalide",
        "Les calories doivent être un nombre positif.",
      );
      return;
    }
    if (isNaN(quantity) || quantity <= 0) {
      Alert.alert(
        "Valeur invalide",
        "La quantité doit être un nombre supérieur à 0.",
      );
      return;
    }
    const protein = parseFloat(mProtein) || 0;
    const fiber = parseFloat(mFiber) || 0;
    const fat = parseFloat(mFat) || 0;
    const scoreResult = computeScoreFromMacros({
      calories100g: calories,
      protein100g: protein,
      fiber100g: fiber,
      fat100g: fat,
    });

    addIngredient({
      name: mName.trim(),
      calories100g: calories,
      protein100g: protein,
      carbs100g: parseFloat(mCarbs) || 0,
      fat100g: fat,
      fiber100g: fiber,
      quantityG: quantity.toString(),
      score: scoreResult.score,
      scoreType: scoreResult.scoreType,
      nutriscoreGrade: scoreResult.nutriscoreGrade,
      isOrganic: scoreResult.isOrganic,
      originCategory: scoreResult.originCategory,
    });
  };

  const openRecentFoods = async () => {
    setPickerMode("recent");
    setLoadingRecent(true);
    try {
      const rows = await loadRecentFoods(db);
      setRecentFoods(rows);
    } catch (error) {
      console.log("ERROR loading recent foods:", error.message);
    } finally {
      setLoadingRecent(false);
    }
  };

  const selectRecentFood = (item) => {
    // Reuse the score already computed when this food was first logged, if available;
    // older entries logged before the scoring feature existed fall back to an estimate.
    const scoreResult =
      item.score !== null && item.score !== undefined
        ? {
            score: item.score,
            scoreType: item.score_type,
            nutriscoreGrade: item.nutriscore_grade,
            isOrganic: item.is_organic === 1,
            originCategory: item.origin_category,
          }
        : computeScoreFromMacros({
            calories100g: item.calories_100g,
            protein100g: item.protein_100g,
            fiber100g: item.fiber_100g || 0,
            fat100g: item.fat_100g,
          });

    addIngredient({
      name: item.name,
      calories100g: item.calories_100g,
      protein100g: item.protein_100g,
      carbs100g: item.carbs_100g,
      fat100g: item.fat_100g,
      fiber100g: item.fiber_100g || 0,
      quantityG: "100",
      score: scoreResult.score,
      scoreType: scoreResult.scoreType,
      nutriscoreGrade: scoreResult.nutriscoreGrade,
      isOrganic: scoreResult.isOrganic,
      originCategory: scoreResult.originCategory,
    });
  };

  const handleSearch = async () => {
    if (searchQuery.trim() === "") return;
    setSearching(true);
    setSearchResults([]);
    try {
      const response = await fetch(
        `https://search.openfoodfacts.org/search?q=${encodeURIComponent(searchQuery)}&page_size=20`,
      );
      const json = await response.json();
      setSearchResults(json.hits || []);
    } catch (error) {
      console.log("SEARCH ERROR:", error.message);
      Alert.alert("Erreur réseau", "Impossible de contacter Open Food Facts.");
    } finally {
      setSearching(false);
    }
  };

  const selectSearchResult = (product) => {
    const n = product.nutriments || {};
    const fiberVal = n["fiber_100g"] ?? n["fiber"] ?? n["fiber_value"];
    const cal = Math.round(n["energy-kcal_100g"] || 0);
    const protein = n["proteins_100g"] || 0;
    const fat = n["fat_100g"] || 0;
    const fiber = fiberVal ?? 0;

    const scoreResult =
      computeScoreFromOFF(product) ??
      computeScoreFromMacros({ calories100g: cal, protein100g: protein, fiber100g: fiber, fat100g: fat });

    addIngredient({
      name: product.product_name || "Produit inconnu",
      calories100g: cal,
      protein100g: protein,
      carbs100g: n["carbohydrates_100g"] || 0,
      fat100g: fat,
      fiber100g: fiber,
      quantityG: "100",
      score: scoreResult.score,
      scoreType: scoreResult.scoreType,
      nutriscoreGrade: scoreResult.nutriscoreGrade,
      isOrganic: scoreResult.isOrganic,
      originCategory: scoreResult.originCategory,
    });
  };

  const totalWeight = ingredients.reduce(
    (sum, ing) => sum + (parseFloat(ing.quantityG) || 0),
    0,
  );
  const totalCalories = ingredients.reduce(
    (sum, ing) =>
      sum + (ing.calories100g * (parseFloat(ing.quantityG) || 0)) / 100,
    0,
  );
  const recipeScore = computeWeightedScore(
    ingredients.map((ing) => ({ score: ing.score, quantityG: parseFloat(ing.quantityG) || 0 })),
  );
  const recipeScoreBand = recipeScore !== null ? getScoreBand(recipeScore) : null;

  const saveRecipe = async () => {
    if (name.trim() === "") {
      Alert.alert("Champ manquant", "Le nom de la recette est requis.");
      return;
    }
    if (ingredients.length === 0) {
      Alert.alert("Recette vide", "Ajoute au moins un ingrédient.");
      return;
    }
    const invalid = ingredients.some(
      (ing) =>
        isNaN(parseFloat(ing.quantityG)) || parseFloat(ing.quantityG) <= 0,
    );
    if (invalid) {
      Alert.alert(
        "Quantité invalide",
        "Chaque ingrédient doit avoir une quantité supérieure à 0.",
      );
      return;
    }

    setSaving(true);
    try {
      const payload = ingredients.map((ing) => ({
        ...ing,
        quantityG: parseFloat(ing.quantityG),
      }));
      if (isEditing) {
        await updateRecipe(db, recipeId, name.trim(), payload);
      } else {
        await createRecipe(db, name.trim(), payload);
      }
      navigation.goBack();
    } catch (error) {
      console.log("ERROR saving recipe:", error.message);
      Alert.alert("Erreur", "Impossible d'enregistrer cette recette.");
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

  if (pickerMode === "search") {
    return (
      <View style={{ flex: 1, padding: 20, paddingTop: 60 }}>
        <Text style={globalStyles.label}>Rechercher un ingrédient :</Text>
        <TextInput
          style={globalStyles.input}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="ex: riz basmati"
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity
          style={globalStyles.primaryButton}
          activeOpacity={0.6}
          onPress={handleSearch}
        >
          <Text style={globalStyles.primaryButtonText}>Rechercher</Text>
        </TouchableOpacity>

        {searching && (
          <ActivityIndicator size="large" style={{ marginTop: 20 }} />
        )}

        <ScrollView style={{ marginTop: 10 }}>
          {searchResults.map((product, index) => (
            <TouchableOpacity
              key={product.code || index}
              style={globalStyles.ligne}
              onPress={() => selectSearchResult(product)}
            >
              <Text>{product.product_name || "Produit inconnu"}</Text>
              <Text>
                {Math.round(product.nutriments?.["energy-kcal_100g"] || 0)}{" "}
                kcal/100g
              </Text>
            </TouchableOpacity>
          ))}
          {!searching && searchResults.length === 0 && searchQuery !== "" && (
            <Text style={{ color: "#999", marginTop: 10 }}>
              Aucun résultat, essaie une recherche différente.
            </Text>
          )}
        </ScrollView>

        <TouchableOpacity
          style={[globalStyles.primaryButton, { backgroundColor: "#e53935" }]}
          activeOpacity={0.6}
          onPress={() => setPickerMode(null)}
        >
          <Text style={globalStyles.primaryButtonText}>Annuler</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (pickerMode === "recent") {
    return (
      <View style={{ flex: 1, padding: 20, paddingTop: 60 }}>
        <Text style={globalStyles.label}>Aliments récents :</Text>
        {loadingRecent && (
          <ActivityIndicator size="large" style={{ marginTop: 20 }} />
        )}
        <ScrollView style={{ marginTop: 10 }}>
          {recentFoods.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={globalStyles.ligne}
              onPress={() => selectRecentFood(item)}
            >
              <Text>{item.name}</Text>
              <Text>{Math.round(item.calories_100g)} kcal/100g</Text>
            </TouchableOpacity>
          ))}
          {!loadingRecent && recentFoods.length === 0 && (
            <Text style={{ color: "#999", marginTop: 10 }}>
              Aucun aliment loggé pour l'instant.
            </Text>
          )}
        </ScrollView>
        <TouchableOpacity
          style={[globalStyles.primaryButton, { backgroundColor: "#e53935" }]}
          activeOpacity={0.6}
          onPress={() => setPickerMode(null)}
        >
          <Text style={globalStyles.primaryButtonText}>Annuler</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (pickerMode === "manual") {
    return (
      <ScrollView contentContainerStyle={globalStyles.scrollContainer}>
        <Text style={globalStyles.label}>Nom de l'ingrédient :</Text>
        <TextInput
          style={globalStyles.input}
          value={mName}
          onChangeText={setMName}
        />

        <Text style={globalStyles.label}>Calories / 100g :</Text>
        <TextInput
          style={globalStyles.input}
          value={mCalories}
          onChangeText={setMCalories}
          keyboardType="numeric"
        />

        <Text style={globalStyles.label}>Protéines / 100g :</Text>
        <TextInput
          style={globalStyles.input}
          value={mProtein}
          onChangeText={setMProtein}
          keyboardType="numeric"
        />

        <Text style={globalStyles.label}>Glucides / 100g :</Text>
        <TextInput
          style={globalStyles.input}
          value={mCarbs}
          onChangeText={setMCarbs}
          keyboardType="numeric"
        />

        <Text style={globalStyles.label}>Lipides / 100g :</Text>
        <TextInput
          style={globalStyles.input}
          value={mFat}
          onChangeText={setMFat}
          keyboardType="numeric"
        />

        <Text style={globalStyles.label}>Fibres / 100g :</Text>
        <TextInput
          style={globalStyles.input}
          value={mFiber}
          onChangeText={setMFiber}
          keyboardType="numeric"
        />

        <Text style={globalStyles.label}>Quantité dans la recette (g) :</Text>
        <TextInput
          style={globalStyles.input}
          value={mQuantity}
          onChangeText={setMQuantity}
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={globalStyles.primaryButton}
          activeOpacity={0.6}
          onPress={confirmManualIngredient}
        >
          <Text style={globalStyles.primaryButtonText}>
            Ajouter l'ingrédient
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[globalStyles.primaryButton, { backgroundColor: "#e53935" }]}
          activeOpacity={0.6}
          onPress={() => setPickerMode(null)}
        >
          <Text style={globalStyles.primaryButtonText}>Annuler</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={globalStyles.scrollContainer}>
      <Text style={globalStyles.titre}>
        {isEditing ? "Modifier la recette" : "Nouvelle recette"}
      </Text>

      <Text style={globalStyles.label}>Nom de la recette :</Text>
      <TextInput
        style={globalStyles.input}
        value={name}
        onChangeText={setName}
        placeholder="ex: Poulet au curry"
      />

      <Text style={globalStyles.label}>Ingrédients :</Text>
      {ingredients.length === 0 && (
        <Text style={{ color: "#999", marginBottom: 10 }}>
          Aucun ingrédient ajouté pour l'instant.
        </Text>
      )}
      {ingredients.map((ing, index) => {
        const band = typeof ing.score === "number" ? getScoreBand(ing.score) : null;
        return (
        <View key={index} style={[globalStyles.details, { marginBottom: 8 }]}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontWeight: "bold" }}>{ing.name}</Text>
            {band && (
              <View style={{ backgroundColor: band.color, borderRadius: 6, paddingVertical: 2, paddingHorizontal: 8 }}>
                <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>
                  {Math.round(ing.score)}{ing.scoreType === "estimate" ? "*" : ""}
                </Text>
              </View>
            )}
          </View>
          <Text style={{ color: "#666", marginBottom: 6 }}>
            {Math.round(ing.calories100g)} kcal/100g
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Text>Quantité (g) :</Text>
            <TextInput
              style={[globalStyles.input, { flex: 1, marginBottom: 0 }]}
              value={ing.quantityG.toString()}
              onChangeText={(value) => updateIngredientQuantity(index, value)}
              keyboardType="numeric"
            />
          </View>
          <TouchableOpacity
            style={[
              globalStyles.primaryButton,
              { backgroundColor: "#e53935", marginTop: 8 },
            ]}
            onPress={() => removeIngredient(index)}
          >
            <Text style={globalStyles.primaryButtonText}>Retirer</Text>
          </TouchableOpacity>
        </View>
        );
      })}

      {ingredients.length > 0 && (
        <View style={[globalStyles.infoBanner, { marginTop: 4, alignItems: "center" }]}>
          <Text style={globalStyles.infoText}>
            Total recette : {Math.round(totalWeight)} g · {Math.round(totalCalories)} kcal
          </Text>
          
          {recipeScore !== null && (
            <View style={{ marginTop: 8 }}>
              <ScoreBadge 
                scoreResult={{
                  score: recipeScore,
                  scoreType: "recipe",
                }}
              />
            </View>
          )}
        </View>
      )}

      <Text style={[globalStyles.label, { marginTop: 20 }]}>
        Ajouter un ingrédient :
      </Text>
      <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
        <TouchableOpacity
          style={[globalStyles.primaryButton, { flex: 1 }]}
          onPress={() => setPickerMode("search")}
        >
          <Text style={globalStyles.primaryButtonText}>Rechercher</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[globalStyles.primaryButton, { flex: 1 }]}
          onPress={openRecentFoods}
        >
          <Text style={globalStyles.primaryButtonText}>Récents</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[globalStyles.primaryButton, { flex: 1 }]}
          onPress={openManualForm}
        >
          <Text style={globalStyles.primaryButtonText}>Manuel</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          globalStyles.primaryButton,
          { backgroundColor: "#4CAF50", marginTop: 20 },
        ]}
        activeOpacity={0.6}
        onPress={saveRecipe}
        disabled={saving}
      >
        <Text style={globalStyles.primaryButtonText}>
          {saving ? "Enregistrement..." : "Enregistrer la recette"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}