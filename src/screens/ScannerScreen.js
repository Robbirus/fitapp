import { useState, useEffect, useContext } from "react";
import {
  Text,
  View,
  Button,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useDatabase } from "../db/DatabaseContext";
import { addDiaryEntry, loadRecentFoods, loadProfileSettings, notifyUnlockedAchievements } from "../db/Queries";
import { getTodayISO } from "../utils/DateHelpers";
import { globalStyles } from "../styles/GlobalStyles";
import { journalStyles } from "../styles/LogStyle";
import {
  DEFAULT_MEAL_TIMES,
  MEAL_PERIOD,
  guessMealFromTimes,
} from "../utils/MealHelpers";
import {
  computeScoreFromOFF,
  computeScoreFromMacros,
  getScoreBand,
} from "../utils/FoodScore";
import ScoreBadge from "../components/ScoreBadge";
import { AchievementContext } from "../contexts/AchievementContext";

export default function ScannerScreen({ navigation, route }) {
  const db = useDatabase();
  // Quand on arrive ici depuis "+ un ingrédient" dans RecipeBuilderScreen, on ne
  // touche pas au journal : on renvoie le produit scanné à l'écran de recette.
  const recipeMode = route.params?.mode === "recipe";
  const { showAchievement } = useContext(AchievementContext);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const [loading, setLoading] = useState(false);
  const [recentMode, setRecentMode] = useState(false);
  const [recentFoods, setRecentFoods] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [found, setFound] = useState(false);
  const [name, setName] = useState("");
  const [calories100g, setCalories100g] = useState("");
  const [protein100g, setProtein100g] = useState("");
  const [carbs100g, setCarbs100g] = useState("");
  const [fat100g, setFat100g] = useState("");
  const [fiber100g, setFiber100g] = useState("");
  const [quantity, setQuantity] = useState("");
  const [showMacros, setShowMacros] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [mealTimes, setMealTimes] = useState(DEFAULT_MEAL_TIMES);
  const [selectedMeal, setSelectedMeal] = useState(() =>
    guessMealFromTimes(DEFAULT_MEAL_TIMES),
  );
  // Finished score object ({ score, scoreType, nutriscoreGrade, isOrganic, originCategory })
  // for OFF-sourced foods. Left null for manual entry, in which case the score is
  // recomputed live from the current macro fields (see getCurrentScore below).
  const [foodScore, setFoodScore] = useState(null);

  useEffect(() => {
    const loadMealTimes = async () => {
      if (!db) return;
      try {
        const profile = await loadProfileSettings(db);
        if (profile?.meal_times) {
          const parsed = JSON.parse(profile.meal_times);
          setMealTimes(parsed);
          setSelectedMeal(guessMealFromTimes(parsed));
        }
      } catch (error) {
        console.log("ERROR loading meal times from profile:", error.message);
      }
    };
    loadMealTimes();
  }, [db]);

  if (!permission) {
    return (
      <View style={globalStyles.center}>
        <Text>Chargement des permissions...</Text>
      </View>
    );
  }
  if (!permission.granted) {
    return (
      <View style={globalStyles.center}>
        <Text style={journalStyles.message}>
          L'accès à la caméra est nécessaire pour scanner un produit.
        </Text>
        <Button title="Autoriser la caméra" onPress={requestPermission} />
      </View>
    );
  }

  const selectSearchResult = (product) => {
    const n = product.nutriments || {};
    setName(product.product_name || "Produit inconnu");
    const cal = Math.round(n["energy-kcal_100g"] || 0);
    const protein = n["proteins_100g"] || 0;
    const fat = n["fat_100g"] || 0;
    setCalories100g(cal.toString());
    setProtein100g(protein.toString());
    setCarbs100g((n["carbohydrates_100g"] || 0).toString());
    setFat100g(fat.toString());

    const fiberVal = n["fiber_100g"] ?? n["fiber"] ?? n["fiber_value"];
    const fiber = fiberVal !== undefined && fiberVal !== null ? parseFloat(fiberVal) : 0;
    setFiber100g(fiber.toString());

    // Full OFF product data lets us compute a real score (nutrition + additives + bio + origin);
    // fall back to the macros-only estimate if this product has no nutriscore_grade.
    setFoodScore(
      computeScoreFromOFF(product) ??
        computeScoreFromMacros({ calories100g: cal, protein100g: protein, fiber100g: fiber, fat100g: fat }),
    );

    setSearchMode(false);
    setFound(true);
  };

  const openRecentFoods = async () => {
    setRecentMode(true);
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
    setName(item.name);
    setCalories100g(item.calories_100g.toString());
    setProtein100g(item.protein_100g.toString());
    setCarbs100g(item.carbs_100g.toString());
    setFat100g(item.fat_100g.toString());
    setFiber100g((item.fiber_100g || 0).toString());

    // Reuse the score already computed when this food was first logged, if available.
    // Older entries logged before the scoring feature existed won't have one -> estimate on the fly.
    if (item.score !== null && item.score !== undefined) {
      setFoodScore({
        score: item.score,
        scoreType: item.score_type,
        nutriscoreGrade: item.nutriscore_grade,
        isOrganic: item.is_organic === 1,
        originCategory: item.origin_category,
      });
    } else {
      setFoodScore(
        computeScoreFromMacros({
          calories100g: item.calories_100g,
          protein100g: item.protein_100g,
          fiber100g: item.fiber_100g || 0,
          fat100g: item.fat_100g,
        }),
      );
    }

    setRecentMode(false);
    setFound(true);
  };

  const openManualEntry = () => {
    setName("");
    setCalories100g("");
    setProtein100g("");
    setCarbs100g("");
    setFat100g("");
    setFiber100g("");
    setQuantity("");
    setShowMacros(true); // displays the macros directly, useful for manual entry
    setFoodScore(null); // no OFF data -> score is derived live from the macro fields
    setFound(true);
  };

  const handleScan = async ({ data: barcode }) => {
    if (!scanning) return;
    setScanning(false);
    setLoading(true);

    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
      );
      const json = await response.json();

      if (json.status !== 1) {
        Alert.alert(
          "Produit non trouvé",
          "Ce code-barres n'est pas dans la base Open Food Facts.",
          [
            {
              text: "Réessayer",
              onPress: () => setScanning(true), // <- only when the user presses
            },
            {
              text: "Saisir manuellement",
              onPress: () => openManualEntry(), // <- opens the empty form
            },
          ],
        );
      } else {
        const p = json.product;
        const n = p.nutriments || {};

        setName(p.product_name || "Produit inconnu");
        const cal = Math.round(n["energy-kcal_100g"] || 0);
        const protein = n["proteins_100g"] || 0;
        const fat = n["fat_100g"] || 0;
        setCalories100g(cal.toString());
        setProtein100g(protein.toString());
        setCarbs100g((n["carbohydrates_100g"] || 0).toString());
        setFat100g(fat.toString());

        const fiberVal = n["fiber_100g"] ?? n["fiber"] ?? n["fiber_value"];
        let fiber = 0;

        if (fiberVal !== undefined && fiberVal !== null) {
          fiber = parseFloat(fiberVal);
          setFiber100g(fiber.toString());
        } else {
          console.log(
            "Fibers not included in this product’s Open Food Facts sheet.",
          );
          setFiber100g("0");
        }

        setFoodScore(
          computeScoreFromOFF(p) ??
            computeScoreFromMacros({ calories100g: cal, protein100g: protein, fiber100g: fiber, fat100g: fat }),
        );
        setFound(true);
      }
    } catch (error) {
      Alert.alert("Erreur réseau", "Impossible de contacter Open Food Facts.");
      setScanning(true);
    } finally {
      setLoading(false);
    }
  };

  // Returns the score to display/save right now: the OFF-computed score if we have
  // one, otherwise a live estimate from whatever is currently typed in the macro fields
  // (covers manual entry, and keeps updating as the user edits those fields).
  const getCurrentScore = () => {
    if (foodScore) return foodScore;
    return computeScoreFromMacros({
      calories100g: parseFloat(calories100g) || 0,
      protein100g: parseFloat(protein100g) || 0,
      fiber100g: parseFloat(fiber100g) || 0,
      fat100g: parseFloat(fat100g) || 0,
    });
  };

  const addToJournal = async () => {
    if (name.trim() === "") {
      Alert.alert("Champ manquant", "Le nom du produit est requis.");
      return;
    }

    const parsedCalories = parseFloat(calories100g);
    const parsedQuantity = parseFloat(quantity);

    if (isNaN(parsedCalories) || parsedCalories < 0) {
      Alert.alert(
        "Valeur invalide",
        "Les calories doivent être un nombre positif.",
      );
      return;
    }
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      Alert.alert(
        "Valeur invalide",
        "La quantité doit être un nombre supérieur à 0.",
      );
      return;
    }

    const today = getTodayISO();
    const scoreResult = getCurrentScore();

    try {
      const result = await addDiaryEntry(
        db,
        {
          name: name.trim(),
          calories100g: parsedCalories,
          protein100g: parseFloat(protein100g) || 0,
          carbs100g: parseFloat(carbs100g) || 0,
          fat100g: parseFloat(fat100g) || 0,
          fiber100g: parseFloat(fiber100g) || 0,
          quantityG: parsedQuantity,
          score: scoreResult.score,
          scoreType: scoreResult.scoreType,
          nutriscoreGrade: scoreResult.nutriscoreGrade,
          isOrganic: scoreResult.isOrganic,
          originCategory: scoreResult.originCategory,
        },
        today,
        selectedMeal,
      );
      // BUG FIX: le résultat (et donc les succès potentiellement débloqués comme
      // "photosynthese" ou "premier_classe") était auparavant ignoré ici.
      const unlocked = notifyUnlockedAchievements(result, showAchievement);
      if (unlocked.length === 0) {
        Alert.alert("Ajouté !", `${name} a été ajouté au journal.`);
      }
      resetScan();
      navigation.goBack();
    } catch (error) {
      console.log("ERROR insertion:", error.message);
      Alert.alert("Erreur", "Impossible d'ajouter cet aliment au journal.");
    }
  };

  const addToRecipe = () => {
    if (name.trim() === "") {
      Alert.alert("Champ manquant", "Le nom du produit est requis.");
      return;
    }

    const parsedCalories = parseFloat(calories100g);
    const parsedQuantity = parseFloat(quantity);

    if (isNaN(parsedCalories) || parsedCalories < 0) {
      Alert.alert(
        "Valeur invalide",
        "Les calories doivent être un nombre positif.",
      );
      return;
    }
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      Alert.alert(
        "Valeur invalide",
        "La quantité doit être un nombre supérieur à 0.",
      );
      return;
    }

    const scoreResult = getCurrentScore();

    navigation.navigate("RecipeBuilder", {
      newIngredientFromScanner: {
        name: name.trim(),
        calories100g: parsedCalories,
        protein100g: parseFloat(protein100g) || 0,
        carbs100g: parseFloat(carbs100g) || 0,
        fat100g: parseFloat(fat100g) || 0,
        fiber100g: parseFloat(fiber100g) || 0,
        quantityG: quantity,
        score: scoreResult.score,
        scoreType: scoreResult.scoreType,
        nutriscoreGrade: scoreResult.nutriscoreGrade,
        isOrganic: scoreResult.isOrganic,
        originCategory: scoreResult.originCategory,
      },
    });
  };

  const resetScan = () => {
    setFound(false);
    setName("");
    setCalories100g("");
    setProtein100g("");
    setCarbs100g("");
    setFat100g("");
    setFiber100g("");
    setSelectedMeal(guessMealFromTimes(mealTimes));
    setQuantity("");
    setShowMacros(false);
    setFoodScore(null);
    setScanning(true);
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
      setSearchResults(json.hits || []); // <- la ligne qui manquait
    } catch (error) {
      console.log("SEARCH ERROR:", error.message);
      Alert.alert("Erreur réseau", "Impossible de contacter Open Food Facts.");
    } finally {
      setSearching(false);
    }
  };

  if (recentMode) {
    return (
      <View style={journalStyles.pickerPanel}>
        <Text style={globalStyles.label}>Aliments récents :</Text>

        {loadingRecent && (
          <ActivityIndicator size="large" style={journalStyles.pickerLoadingIndicator} />
        )}

        <ScrollView style={journalStyles.pickerResultsList}>
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
            <Text style={journalStyles.pickerEmptyText}>
              Aucun aliment loggé pour l'instant.
            </Text>
          )}
        </ScrollView>

        <TouchableOpacity
          style={[globalStyles.primaryButton, journalStyles.cancelButton]}
          activeOpacity={0.6}
          onPress={() => setRecentMode(false)}
        >
          <Text style={globalStyles.primaryButtonText}>Annuler</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (searchMode) {
    return (
      <View style={journalStyles.pickerPanel}>
        <Text style={globalStyles.label}>Rechercher un produit :</Text>
        <TextInput
          style={globalStyles.input}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="ex: yaourt nature"
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
          <ActivityIndicator size="large" style={journalStyles.pickerLoadingIndicator} />
        )}

        <ScrollView style={journalStyles.pickerResultsList}>
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
            <Text style={journalStyles.pickerEmptyText}>
              Aucun résultat, essaie une recherche différente.
            </Text>
          )}
        </ScrollView>

        <TouchableOpacity
          style={[globalStyles.primaryButton, journalStyles.cancelButton]}
          activeOpacity={0.6}
          onPress={() => {
            setSearchMode(false);
            setSearchQuery("");
            setSearchResults([]);
          }}
        >
          <Text style={globalStyles.primaryButtonText}>Annuler</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (found) {
    const currentScore = getCurrentScore();
    const scoreBand = getScoreBand(currentScore.score);

    return (
      <ScrollView>
        <View style={globalStyles.center}>
          <ScoreBadge 
            scoreResult={currentScore}
            macros={{
              calories100g: parseFloat(calories100g) || 0,
              protein100g: parseFloat(protein100g) || 0,
              fiber100g: parseFloat(fiber100g) || 0,
              fat100g: parseFloat(fat100g) || 0,
            }}
          />
          {!recipeMode && (
            <>
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
            </>
          )}
          <Text style={globalStyles.label}>Nom du produit :</Text>
          <TextInput
            style={globalStyles.input}
            value={name}
            onChangeText={setName}
          />

          <Text style={globalStyles.label}>Calories / 100g :</Text>
          <TextInput
            style={globalStyles.input}
            value={calories100g}
            onChangeText={setCalories100g}
            keyboardType="numeric"
          />

          <Button
            title={showMacros ? "Masquer les macros" : "Voir les macros (100g)"}
            onPress={() => setShowMacros(!showMacros)}
          />

          {showMacros && (
            <View style={journalStyles.macrosBox}>
              <Text style={globalStyles.label}>Protéines (g) :</Text>
              <TextInput
                style={globalStyles.input}
                value={protein100g}
                onChangeText={setProtein100g}
                keyboardType="numeric"
              />
              <Text style={globalStyles.label}>Glucides (g) :</Text>
              <TextInput
                style={globalStyles.input}
                value={carbs100g}
                onChangeText={setCarbs100g}
                keyboardType="numeric"
              />
              <Text style={globalStyles.label}>Lipides (g) :</Text>
              <TextInput
                style={globalStyles.input}
                value={fat100g}
                onChangeText={setFat100g}
                keyboardType="numeric"
              />
              <Text style={globalStyles.label}>Fibres (g) :</Text>
              <TextInput
                style={globalStyles.input}
                value={fiber100g}
                onChangeText={setFiber100g}
                keyboardType="numeric"
              />
            </View>
          )}

          <Text style={globalStyles.label}>
            {recipeMode ? "Quantité dans la recette (g) :" : "Quantité consommée (g) :"}
          </Text>
          <TextInput
            style={globalStyles.input}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            placeholder="ex: 150"
          />

          <Button
            title={recipeMode ? "Ajouter à la recette" : "Ajouter au journal"}
            onPress={recipeMode ? addToRecipe : addToJournal}
          />
          <View style={journalStyles.buttonSpacer} />
          <Button
            title="Annuler / Scanner un autre produit"
            onPress={resetScan}
          />
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={journalStyles.fullFlex}>
      <CameraView
        style={journalStyles.fullFlex}
        barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8"] }}
        onBarcodeScanned={handleScan}
      />
      {loading && (
        <View style={journalStyles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
      <View style={journalStyles.scannerActionsOverlay}>
        <TouchableOpacity
          style={globalStyles.primaryButton}
          activeOpacity={0.6}
          onPress={() => setSearchMode(true)}
        >
          <Text style={globalStyles.primaryButtonText}>Rechercher par nom</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={globalStyles.primaryButton}
          activeOpacity={0.6}
          onPress={openRecentFoods}
        >
          <Text style={globalStyles.primaryButtonText}>Aliments récents</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}