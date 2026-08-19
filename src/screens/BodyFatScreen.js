import { useDatabase } from "../db/DatabaseContext";
import {
  loadLatestWeight,
  loadProfileSettings,
  loadLatestBodyMeasurement,
  loadBodyMeasurementHistorySince,
  updateBodyMeasurementEntry,
  loadLatestWeightWithDate,
  deleteBodyMeasurementEntry,
} from "../db/Queries";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  Text,
  Alert,
  View,
  Button,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { globalStyles } from "../styles/GlobalStyles";
import {
  calculateBodyFatPercentage,
  calculateSMI,
  calculateSkeletalMuscleMass,
} from "../utils/BodyCompositionCalculator";
import { Dimensions } from "react-native";
import {
  calculateWaistHipRatio,
  obtainWHRCategory,
  getSMIThreshold,
  obtainBodyFatCategory,
  obtainSMICategory,
  obtainSarcopeniaRisk,
  getSMIAverage,
  getCategoryColors,
} from "../utils/BodyCompositionCalculator";
import Gauge from "../components/Gauge";
import {
  getTodayISO,
  getDateNDaysAgoISO,
  getDaysSince,
} from "../utils/DateHelpers";
import SegmentedDonut from "../components/SegmentedDonut";

const screenWidth = Dimensions.get("window").width;

const PERIOD_OPTIONS = [
  { value: "week", label: "Semaine" },
  { value: "month", label: "Mois" },
  { value: "year", label: "Année" },
];

export default function BodyFatScreen({ navigation }) {
  const db = useDatabase();
  const [history, setHistory] = useState([]);
  const [period, setPeriod] = useState("week"); // default period
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [waist, setWaist] = useState(null);
  const [hip, setHip] = useState(null);
  const [neck, setNeck] = useState(null);
  const [gender, setGender] = useState(null);
  const [height, setHeight] = useState(null);
  const [weight, setWeight] = useState(null);
  const [weightDate, setWeightDate] = useState(null);
  const [age, setAge] = useState(null);
  const [ethnicity, setEthnicity] = useState(null);

  const today = getTodayISO();

  useFocusEffect(
    useCallback(() => {
      loadHistory(period);
      loadBodyFatparameters();
    }, [period]),
  );

  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      setEditingId(null); // reset edit mode
      setEditNeck(""); // reset value
      setEditWaist(""); // reset value
      setEditHip(""); // reset value
    } else {
      setExpandedId(id);
    }
  };

  const confirmDelete = (id) => {
    Alert.alert(
      "Confirmer la suppression",
      "Veux-tu vraiment supprimer cette entrée ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            await deleteBodyMeasurementEntry(db, id);
            loadHistory(period);
            loadBodyFatparameters();
          },
        },
      ],
    );
  };

  const selectPeriod = (newPeriod) => {
    setPeriod(newPeriod); // updates the button display (chip selected)
    loadHistory(newPeriod); // reload with the value we have just chosen, explicitly
  };

  const loadHistory = async (selectedPeriod) => {
    const days =
      selectedPeriod === "week" ? 7 : selectedPeriod === "month" ? 30 : 365;
    const sinceDate = getDateNDaysAgoISO(days);
    const rows = await loadBodyMeasurementHistorySince(db, sinceDate);
    setHistory(rows);
  };

  const saveEdit = async () => {
    const item = history.find((f) => f.id === editingId);
    if (!item) return;
    try {
      await updateBodyMeasurementEntry(
        db,
        editingId,
        parseFloat(editNeck),
        parseFloat(editWaist),
        parseFloat(editHip),
        item.date,
      );
    } catch (error) {
      console.log(error);
    }
    setEditingId(null);
    loadHistory(period);
  };

  const loadBodyFatparameters = async () => {
    const latestMeasurement = await loadLatestBodyMeasurement(db);
    const latestProfile = await loadProfileSettings(db);
    const latestWeightWithDate = await loadLatestWeightWithDate(db);

    setWaist(latestMeasurement?.waist || null);
    setHip(latestMeasurement?.hip || null);
    setNeck(latestMeasurement?.neck || null);

    setGender(latestProfile?.gender || null);
    setHeight(latestProfile?.height || null);
    setEthnicity(latestProfile?.ethnicity || null);

    setAge(latestProfile?.age || null);

    setWeight(latestWeightWithDate?.value || null);
    setWeightDate(latestWeightWithDate?.date || null);
  };

  const computeBodyFatPercentage = () => {
    return calculateBodyFatPercentage({ gender, height, neck, waist, hip });
  };

  const computeBodyFatCategory = () => {
    const bodyFat = computeBodyFatPercentage();
    return obtainBodyFatCategory(bodyFat, gender);
  };

  const bodyFat = computeBodyFatPercentage();
  if (bodyFat === null) {
    return (
      <View style={globalStyles.container}>
        <Text>
          Ajoute tes mesures corporelles et ton profil pour voir ce résultat.
        </Text>
      </View>
    );
  }

  const daysOld = weightDate ? getDaysSince(weightDate) : null;
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

  console.log(daysOld);

  const smm = calculateSkeletalMuscleMass({
    weight,
    height,
    gender,
    age,
    ethnicity,
  });

  const smi = calculateSMI({ smm, height });

  const smiThreshold = gender ? getSMIThreshold(gender) : null;

  const musclePercent = smm && weight ? (smm / weight) * 100 : 0;

  const restPercent = Math.max(100 - bodyFat - musclePercent, 0);

  const donutSegments = [
    { value: bodyFat, color: "#EBA500" },
    { value: musclePercent, color: "#FF0000" },
    { value: restPercent, color: "#90D5FF" },
  ];

  const smiZones = smiThreshold
    ? [
        { label: "Faible", color: "#e53935", end: smiThreshold.lowThreshold },
        { label: "Normal", color: "#4CAF50", end: smiThreshold.highThreshold },
        { label: "Élevé", color: "#2196F3", end: smiThreshold.maximum },
      ]
    : null;

  const smiCategory = obtainSMICategory(smi, gender);
  const sarcopeniaRisk = obtainSarcopeniaRisk(smiCategory);
  const smiAverage = getSMIAverage(gender);
  const diff = smi - smiAverage;

  return (
    <ScrollView contentContainerStyle={globalStyles.scrollContainer}>
      {isStale && (
        <View style={globalStyles.warningBanner}>
          <Text style={globalStyles.warningText}>
            ⚠️ Ton dernier poids date de {daysOld} jours. Les résultats
            ci-dessous sont basés sur une valeur non à jour. Pèse-toi pour plus
            de précision.
          </Text>
        </View>
      )}
      <Text style={globalStyles.subTitle}>Graisse corporelle</Text>
      <Text style={globalStyles.label}>
        Pourcentage de graisse corporelle:{" "}
        {computeBodyFatPercentage().toFixed(2)}%
      </Text>
      <Text style={globalStyles.label}>
        Catégorie (basée sur le % de masse grasse): {computeBodyFatCategory()}
      </Text>

      {smi !== null && smiThreshold && (
        <>
          <Text style={globalStyles.subTitle}>
            Indice de Masse Musculaire Squelettique (SMI)
          </Text>
          <View style={globalStyles.card}>
            <Text style={globalStyles.mainTitle}>
              VOTRE MASSE MUSCULAIRE SQUELETTIQUE
            </Text>
            <Text style={globalStyles.heroValue}>{smm.toFixed(1)}</Text>
            <Text style={globalStyles.unitText}>kg</Text>
            <View
              style={[
                globalStyles.pillBadge,
                { backgroundColor: getCategoryColors(smiCategory).bg },
              ]}
            >
              <Text
                style={[
                  globalStyles.pillBadgeText,
                  { color: getCategoryColors(smiCategory).text },
                ]}
              >
                Classification SMI : {smiCategory}
              </Text>
            </View>
          </View>
          <View style={globalStyles.gridContainer}>
            <View style={globalStyles.miniCard}>
              <Text style={globalStyles.miniCardTitle}>
                Indice de Masse Musculaire
              </Text>
              <Text style={globalStyles.miniCardValue}>{smi.toFixed(2)}</Text>
              <Text style={globalStyles.miniCardUnit}>kg/m²</Text>
            </View>
            <View style={globalStyles.miniCard}>
              <Text style={globalStyles.miniCardTitle}>
                % du poids corporel
              </Text>
              <Text style={globalStyles.miniCardValue}>
                {musclePercent.toFixed(1)}%
              </Text>
              <Text style={globalStyles.miniCardTitle}>
                muscle squelettique
              </Text>
            </View>
            <View style={globalStyles.miniCard}>
              <Text style={globalStyles.miniCardTitle}>
                Risque de sarcopénie
              </Text>
              <Text
                style={[
                  globalStyles.miniCardValue,
                  {
                    color:
                      sarcopeniaRisk === "Risque élevé" ? "#e53935" : "#4CAF50",
                  },
                ]}
              >
                {sarcopeniaRisk}
              </Text>
            </View>
          </View>

          <Gauge
            value={smi}
            min={smiThreshold.minimum}
            max={smiThreshold.maximum}
            zones={smiZones}
          />
          <Text style={globalStyles.sectionTitle}>
            Comparaison à la moyenne
          </Text>
          <Text style={globalStyles.sectionSubtitle}>
            Comment ton SMI se situe par rapport au milieu de la plage normale (
            {gender === 1 ? "hommes" : "femmes"}, Janssen et al. 2004)
          </Text>

          <View style={globalStyles.comparisonRow}>
            <View style={globalStyles.comparisonBox}>
              <Text style={globalStyles.compLabel}>Ton SMI</Text>
              <Text style={globalStyles.compValue}>
                {smi.toFixed(2)}{" "}
                <Text style={globalStyles.compUnit}>kg/m²</Text>
              </Text>
            </View>

            <View style={globalStyles.comparisonBox}>
              <Text style={globalStyles.compLabel}>Moyenne de référence</Text>
              <Text style={globalStyles.compValue}>
                {smiAverage.toFixed(2)}{" "}
                <Text style={globalStyles.compUnit}>kg/m²</Text>
              </Text>
            </View>
          </View>
          <Text style={globalStyles.greenInsightText}>
            Ton SMI est {Math.abs(diff).toFixed(2)} kg/m²
            {diff >= 0 ? " au-dessus" : " en-dessous"} du milieu de la plage
            normale.
          </Text>
          <Text style={globalStyles.sectionTitle}>
            Évaluation du risque de faible masse musculaire
          </Text>
          <Text style={globalStyles.sectionSubtitle}>
            Basé sur les seuils SMI de recherches publiées sur la sarcopénie
          </Text>

          <View
            style={[
              globalStyles.riskAlertBox,
              { backgroundColor: getCategoryColors(sarcopeniaRisk).bg },
            ]}
          >
            <View
              style={[
                globalStyles.checkIcon,
                { backgroundColor: getCategoryColors(sarcopeniaRisk).bg },
              ]}
            >
              <Text style={{ color: getCategoryColors(sarcopeniaRisk).text }}>
                {sarcopeniaRisk === "Risque faible" ? "✓" : "!"}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={[
                  globalStyles.riskAlertTitle,
                  { color: getCategoryColors(sarcopeniaRisk).text },
                ]}
              >
                {sarcopeniaRisk}
              </Text>
              <Text
                style={[
                  globalStyles.riskAlertDescription,
                  { color: getCategoryColors(sarcopeniaRisk).text },
                ]}
              >
                {sarcopeniaRisk === "Risque faible"
                  ? "Ta masse musculaire squelettique est dans la plage normale ou au-dessus. Continue tes habitudes actuelles d'exercice et de nutrition."
                  : "Ta masse musculaire squelettique est en dessous du seuil normal. Envisage d'en parler à un professionnel de santé."}
              </Text>
            </View>
          </View>
          <Text style={globalStyles.footerNote}>
            Seuil bas SMI : {"<"} {smiThreshold.lowThreshold} kg/m² (basé sur
            Janssen et al., 2004)
          </Text>

          <Text style={globalStyles.sectionTitle}>
            Échelle de classification SMI
          </Text>
          <Text style={globalStyles.sectionSubtitle}>
            {gender === 1 ? "Pour les hommes" : "Pour les femmes"}
          </Text>

          <View
            style={[
              globalStyles.scaleRow,
              smiCategory === "Faible" && globalStyles.activeScaleRow,
            ]}
          >
            <Text style={globalStyles.scaleLabel}>Faible</Text>
            <Text style={globalStyles.scaleValue}>
              {"<"} {smiThreshold.lowThreshold} kg/m²
            </Text>
          </View>

          <View
            style={[
              globalStyles.scaleRow,
              smiCategory === "Normal" && globalStyles.activeScaleRow,
            ]}
          >
            <Text style={globalStyles.scaleLabel}>Normal</Text>
            <Text style={globalStyles.scaleValue}>
              {smiThreshold.lowThreshold} - {smiThreshold.highThreshold} kg/m²
            </Text>
          </View>

          <View
            style={[
              globalStyles.scaleRow,
              smiCategory === "Élevé" && globalStyles.activeScaleRow,
            ]}
          >
            <Text style={globalStyles.scaleLabel}>Élevé</Text>
            <Text style={globalStyles.scaleValue}>
              {">"} {smiThreshold.highThreshold} kg/m²
            </Text>
          </View>
        </>
      )}

      {bodyFat !== null && smm !== null && (
        <>
          <Text style={globalStyles.subTitle}>
            Estimation Composition Corporelle
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <SegmentedDonut
              segments={donutSegments}
              strokeWidth={20}
              radius={55}
            />
            <View>
              <View
                style={[globalStyles.pillBadge, { backgroundColor: "#EBC375" }]}
              >
                <Text
                  style={[globalStyles.pillBadgeText, { color: "#000000" }]}
                >
                  Graisse corporelle : {bodyFat.toFixed(2)} %
                </Text>
              </View>

              <View
                style={[globalStyles.pillBadge, { backgroundColor: "#ff6666" }]}
              >
                <Text
                  style={[globalStyles.pillBadgeText, { color: "#000000" }]}
                >
                  Taux musculaire : {musclePercent.toFixed(2)} %
                </Text>
              </View>

              <View
                style={[globalStyles.pillBadge, { backgroundColor: "#c2e8ff" }]}
              >
                <Text
                  style={[globalStyles.pillBadgeText, { color: "#000000" }]}
                >
                  Autre (Os, eau, organe) : {restPercent.toFixed(2)} %
                </Text>
              </View>
            </View>
          </View>
        </>
      )}
      <Text style={globalStyles.sectionTitle}>Mon historique</Text>

      <View style={globalStyles.optionsRow}>
        {PERIOD_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[
              globalStyles.option,
              period === opt.value && globalStyles.optionSelected,
            ]}
            onPress={() => selectPeriod(opt.value)}
          >
            <Text
              style={
                period === opt.value
                  ? globalStyles.optionTextSelected
                  : globalStyles.optionText
              }
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {history.length === 0 ? (
        <Text>Aucune mesure enregistrée sur cette période.</Text>
      ) : (
        history
          .slice()
          .reverse()
          .map((item) => {
            const itemBodyFat = calculateBodyFatPercentage({
              gender,
              height,
              neck: item.neck,
              waist: item.waist,
              hip: item.hip,
            });
            const itemMuscle = smm && weight ? (smm / weight) * 100 : 0; // rappel : constantes actuelles, pas historisées
            const itemRest = Math.max(100 - itemBodyFat - itemMuscle, 0);

            return (
              <View key={item.id} style={globalStyles.card}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={globalStyles.scaleLabel}>{item.date}</Text>
                  <TouchableOpacity onPress={() => confirmDelete(item.id)}>
                    <Text>🗑️</Text>
                  </TouchableOpacity>
                </View>

                <View style={globalStyles.gridContainer}>
                  <View style={globalStyles.miniCard}>
                    <Text style={globalStyles.miniCardValue}>
                      {itemBodyFat}%
                    </Text>
                    <Text style={globalStyles.miniCardTitle}>Masse grasse</Text>
                  </View>
                  <View style={globalStyles.miniCard}>
                    <Text style={globalStyles.miniCardValue}>
                      {itemMuscle.toFixed(1)}%
                    </Text>
                    <Text style={globalStyles.miniCardTitle}>
                      Masse musculaire
                    </Text>
                  </View>
                  <View style={globalStyles.miniCard}>
                    <Text style={globalStyles.miniCardValue}>
                      {itemRest.toFixed(1)}%
                    </Text>
                    <Text style={globalStyles.miniCardTitle}>Autre</Text>
                  </View>
                </View>
              </View>
            );
          })
      )}
    </ScrollView>
  );
}
