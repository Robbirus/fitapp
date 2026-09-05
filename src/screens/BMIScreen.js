import { useDatabase } from "../db/DatabaseContext";
import { loadLatestWeight, loadProfileSettings } from "../db/Queries";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Text, View, ScrollView, TouchableOpacity } from "react-native";
import { globalStyles } from "../styles/GlobalStyles";
import { bodyCompositionStyles } from "../styles/BodyCompositionStyle";
import {
  calculateBMI,
  obtainBMICategory,
  getBMIZones,
  getCategoryColors,
  getBMIRecommendation,
} from "../utils/BodyCompositionCalculator";
import { getDaysSince } from "../utils/DateHelpers";
import CircleGauge from "../components/CircleGauge";

export default function BMIScreen({ navigation }) {
  const db = useDatabase();
  const [mass, setMass] = useState([]);
  const [measurementDate, setMeasurementDate] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadBMIParameters();
    }, []),
  );

  const loadBMIParameters = async () => {
    const latestWeight = await loadLatestWeight(db);
    const profileSettings = await loadProfileSettings(db);
    setMass([latestWeight?.value, profileSettings]);
    setMeasurementDate(latestWeight?.date);
  };

  const bmi = calculateBMI(mass[0], mass[1]?.height);

  if (bmi === null) {
    return (
      <View style={globalStyles.container}>
        <Text>
          Ajoute au moins une entrée de poids et les paramètres du profile pour
          voir ton IMC.
        </Text>
      </View>
    );
  }


  const daysOld = measurementDate ? getDaysSince(measurementDate) : null;
  if (daysOld !== null && daysOld > 7) {
    return (
      <View style={globalStyles.container}>
        <Text>
          Ton dernier poids date de {daysOld} jours. Pèse-toi pour voir tes
          résultats.
        </Text>
      </View>
    );
  }

  const isStale = daysOld !== null && daysOld > 3;

  const category = obtainBMICategory(bmi);
  const colors = getCategoryColors(category);
  const zonesData = getBMIZones();

  return (
    <ScrollView contentContainerStyle={globalStyles.scrollContainer}>
      {isStale && (
        <View style={bodyCompositionStyles.warningBanner}>
          <Text style={bodyCompositionStyles.warningText}>
            ⚠️ Ton dernier poids date de {daysOld} jours. Les résultats
            ci-dessous sont basés sur une valeur non à jour. Pèse-toi pour plus
            de précision.
          </Text>
        </View>
      )}

      <Text style={globalStyles.subTitle}>Indice de Masse Corporelle (IMC)</Text>
      <View style={globalStyles.card}>
        <Text style={bodyCompositionStyles.mainTitle}>VOTRE IMC</Text>
        <Text style={bodyCompositionStyles.heroValue}>{bmi.toFixed(1)}</Text>
        <View style={[bodyCompositionStyles.pillBadge, { backgroundColor: colors.bg }]}>
          <Text style={[bodyCompositionStyles.pillBadgeText, { color: colors.text }]}>
            {category}
          </Text>
        </View>
      </View>

      <View style={globalStyles.gridContainer}>
        <View style={globalStyles.miniCard}>
          <Text style={globalStyles.miniCardTitle}>Poids</Text>
          <Text style={globalStyles.miniCardValue}>
            {mass[0]} <Text style={globalStyles.miniCardUnit}>kg</Text>
          </Text>
        </View>

        <View style={globalStyles.miniCard}>
          <Text style={globalStyles.miniCardTitle}>Taille</Text>
          <Text style={globalStyles.miniCardValue}>
            {mass[1]?.height} <Text style={globalStyles.miniCardUnit}>cm</Text>
          </Text>
        </View>
      </View>

      <CircleGauge
        value={bmi}
        min={zonesData.min}
        max={zonesData.max}
        zones={zonesData.zones}
      />

      <Text style={globalStyles.sectionTitle}>Plages de référence OMS</Text>
      <Text style={globalStyles.sectionSubtitle}>
        Classification internationale de l'IMC
      </Text>

      <View
        style={[
          bodyCompositionStyles.scaleRow,
          category === "Insuffisance pondérale" && bodyCompositionStyles.activeScaleRow,
        ]}
      >
        <Text style={bodyCompositionStyles.scaleLabel}>Insuffisance</Text>
        <Text style={bodyCompositionStyles.scaleValue}>{"<"} 18.5</Text>
      </View>
      <View
        style={[
          bodyCompositionStyles.scaleRow,
          category === "Poids normal" && bodyCompositionStyles.activeScaleRow,
        ]}
      >
        <Text style={bodyCompositionStyles.scaleLabel}>Normal</Text>
        <Text style={bodyCompositionStyles.scaleValue}>18.5 - 24.9</Text>
      </View>
      <View
        style={[
          bodyCompositionStyles.scaleRow,
          category === "Surpoids" && bodyCompositionStyles.activeScaleRow,
        ]}
      >
        <Text style={bodyCompositionStyles.scaleLabel}>Surpoids</Text>
        <Text style={bodyCompositionStyles.scaleValue}>25 - 29.9</Text>
      </View>
      <View
        style={[
          bodyCompositionStyles.scaleRow,
          category === "Obésité" && bodyCompositionStyles.activeScaleRow,
        ]}
      >
        <Text style={bodyCompositionStyles.scaleLabel}>Obésité</Text>
        <Text style={bodyCompositionStyles.scaleValue}>{">="} 30</Text>
      </View>

      <Text style={globalStyles.sectionTitle}>Recommandation</Text>
      <View style={[bodyCompositionStyles.riskAlertBox, { backgroundColor: colors.bg }]}>
        <View style={bodyCompositionStyles.riskAlertTextWrapper}>
          <Text
            style={[bodyCompositionStyles.riskAlertDescription, { color: colors.text }]}
          >
            {getBMIRecommendation(category)}
          </Text>
        </View>
      </View>

      <View style={globalStyles.infoBanner}>
        <Text style={globalStyles.infoText}>
          L'IMC est un indicateur global basé uniquement sur le poids et la
          taille : il ne distingue pas la masse grasse de la masse musculaire.
          Il ne remplace pas un avis médical.
        </Text>
      </View>

      <TouchableOpacity
        style={globalStyles.primaryButton}
        activeOpacity={0.6}
        onPress={() => navigation.navigate("Votre Profile")}
      >
        <Text style={globalStyles.primaryButtonText}>
          Modifier les paramètres du profile
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}