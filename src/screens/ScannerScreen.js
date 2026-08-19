import { useState } from "react";
import {
  Text,
  View,
  Button,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useDatabase } from "../db/DatabaseContext";
import { addDiaryEntry } from "../db/Queries";
import { getTodayISO } from "../utils/DateHelpers";
import { globalStyles } from "../styles/GlobalStyles";

export default function ScannerScreen({ navigation }) {
  const db = useDatabase();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const [loading, setLoading] = useState(false);

  const [found, setFound] = useState(false);
  const [name, setName] = useState("");
  const [calories100g, setCalories100g] = useState("");
  const [protein100g, setProtein100g] = useState("");
  const [carbs100g, setCarbs100g] = useState("");
  const [fat100g, setFat100g] = useState("");
  const [quantity, setQuantity] = useState("");
  const [showMacros, setShowMacros] = useState(false);

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

  const openManualEntry = () => {
    setName("");
    setCalories100g("");
    setProtein100g("");
    setCarbs100g("");
    setFat100g("");
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
    if (name === "" || calories100g === "" || quantity === "") return;
    const today = getTodayISO();

    try {
      await addDiaryEntry(
        db,
        {
          name,
          calories100g: parseFloat(calories100g),
          protein100g: parseFloat(protein100g) || 0,
          carbs100g: parseFloat(carbs100g) || 0,
          fat100g: parseFloat(fat100g) || 0,
          quantityG: parseFloat(quantity),
        },
        today,
      );
      Alert.alert("Ajouté !", `${name} a été ajouté au journal.`);
      resetScan();
      navigation.goBack();
    } catch (error) {
      console.log("ERROR insertion:", error.message);
    }
  };

  const resetScan = () => {
    setFound(false);
    setName("");
    setCalories100g("");
    setProtein100g("");
    setCarbs100g("");
    setFat100g("");
    setQuantity("");
    setShowMacros(false);
    setScanning(true);
  };

  if (found) {
    return (
      <View style={globalStyles.center}>
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
    </View>
  );
}
