import { useState } from "react";
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
import { addDiaryEntry, loadRecentFoods } from "../db/Queries";
import { getTodayISO } from "../utils/DateHelpers";
import { globalStyles } from "../styles/GlobalStyles";

const guessMealFromCurrentTime = () => {
  const hour = new Date().getHours();
  if (hour < 11) {
    return "Petit Dejeuner";
  }
  if (hour < 15) {
    return "Dejeuner";
  }
  if (hour < 18) {
    return "Snack";
  }
  if (hour < 21) {
    return "Diner";
  }

  return "Snack";
};

export default function ScannerScreen({ navigation }) {
  const db = useDatabase();
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
  const [selectedMeal, setSelectedMeal] = useState(guessMealFromCurrentTime());

  const MEAL_PERIOD = [
    { value: "Petit Dejeuner", label: "Petit Dejeuner" },
    { value: "Dejeuner", label: "Dejeuner" },
    { value: "Snack", label: "Snack" },
    { value: "Diner", label: "Diner" },
  ];

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
        <Text style={globalStyles.message}>
          L'accès à la caméra est nécessaire pour scanner un produit.
        </Text>
        <Button title="Autoriser la caméra" onPress={requestPermission} />
      </View>
    );
  }

  const selectSearchResult = (product) => {
    const n = product.nutriments || {};
    setName(product.product_name || "Produit inconnu");
    setCalories100g(Math.round(n["energy-kcal_100g"] || 0).toString());
    setProtein100g((n["proteins_100g"] || 0).toString());
    setCarbs100g((n["carbohydrates_100g"] || 0).toString());
    setFat100g((n["fat_100g"] || 0).toString());

    const fiberVal = n["fiber_100g"] ?? n["fiber"] ?? n["fiber_value"];
    setFiber100g(
      fiberVal !== undefined && fiberVal !== null ? fiberVal.toString() : "0",
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
        setCalories100g(Math.round(n["energy-kcal_100g"] || 0).toString());
        setProtein100g((n["proteins_100g"] || 0).toString());
        setCarbs100g((n["carbohydrates_100g"] || 0).toString());
        setFat100g((n["fat_100g"] || 0).toString());

        const fiberVal = n["fiber_100g"] ?? n["fiber"] ?? n["fiber_value"];

        if (fiberVal !== undefined && fiberVal !== null) {
          setFiber100g(fiberVal.toString());
        } else {
          console.log(
            "Fibers not included in this product’s Open Food Facts sheet.",
          );
          setFiber100g("0");
        }
        setFound(true);
      }
    } catch (error) {
      Alert.alert("Erreur réseau", "Impossible de contacter Open Food Facts.");
      setScanning(true);
    } finally {
      setLoading(false);
    }
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

    try {
      await addDiaryEntry(
        db,
        {
          name: name.trim(),
          calories100g: parsedCalories,
          protein100g: parseFloat(protein100g) || 0,
          carbs100g: parseFloat(carbs100g) || 0,
          fat100g: parseFloat(fat100g) || 0,
          fiber100g: parseFloat(fiber100g) || 0,
          quantityG: parsedQuantity,
        },
        today,
        selectedMeal,
      );
      Alert.alert("Ajouté !", `${name} a été ajouté au journal.`);
      resetScan();
      navigation.goBack();
    } catch (error) {
      console.log("ERROR insertion:", error.message);
      Alert.alert("Erreur", "Impossible d'ajouter cet aliment au journal.");
    }
  };

  const resetScan = () => {
    setFound(false);
    setName("");
    setCalories100g("");
    setProtein100g("");
    setCarbs100g("");
    setFat100g("");
    setFiber100g("");
    setSelectedMeal(guessMealFromCurrentTime());
    setQuantity("");
    setShowMacros(false);
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
      <View style={{ flex: 1, padding: 20 }}>
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
          onPress={() => setRecentMode(false)}
        >
          <Text style={globalStyles.primaryButtonText}>Annuler</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (searchMode) {
    return (
      <View style={{ flex: 1, padding: 20 }}>
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
    return (
      <ScrollView>
        <View style={globalStyles.center}>
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
            <View style={globalStyles.macrosBox}>
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

          <Text style={globalStyles.label}>Quantité consommée (g) :</Text>
          <TextInput
            style={globalStyles.input}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            placeholder="ex: 150"
          />

          <Button title="Ajouter au journal" onPress={addToJournal} />
          <View style={{ height: 10 }} />
          <Button
            title="Annuler / Scanner un autre produit"
            onPress={resetScan}
          />
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8"] }}
        onBarcodeScanned={handleScan}
      />
      {loading && (
        <View style={globalStyles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
      <View
        style={{
          position: "absolute",
          bottom: 30,
          left: 0,
          right: 0,
          alignItems: "center",
        }}
      >
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
