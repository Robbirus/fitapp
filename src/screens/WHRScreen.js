import { useDatabase } from "../db/DatabaseContext";
import { loadProfileSettings, loadLatestBodyMeasurement } from "../db/Queries";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Text, View, Button, ScrollView } from "react-native";
import { globalStyles } from "../styles/GlobalStyles";
import {
  calculateWaistHipRatio,
  obtainWHRCategory,
  obtainWHtRCategory,
  getWHRZones,
  getWHtRZones,
  getCategoryColors,
  calculateWaistHeightRatio,
  obtainBodyShape,
  calculateWaistBoundary,
  calculateWHtRDifferencePercent,
  getWHtRRecommendation,
} from "../utils/BodyCompositionCalculator";
import { getDaysSince } from "../utils/DateHelpers";
import Gauge from "../components/Gauge";

export default function WHRScreen({ navigation }) {
  const db = useDatabase();
  const [waist, setWaist] = useState(null);
  const [hip, setHip] = useState(null);
  const [height, setHeight] = useState(null);
  const [measurementDate, setMeasurementDate] = useState(null);
  const [gender, setGender] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadWHRparameters();
    }, []),
  );

  const loadWHRparameters = async () => {
    const latestMeasurement = await loadLatestBodyMeasurement(db);
    const profile = await loadProfileSettings(db);
    setWaist(latestMeasurement?.waist || null);
    setHip(latestMeasurement?.hip || null);
    setGender(profile?.gender || null);
    setHeight(profile?.height || null);
  };

  const whr = calculateWaistHipRatio(waist, hip);

  if (whr === null) {
    return (
      <View style={globalStyles.container}>
        <Text>Ajoute au moins une mesure corporelle pour voir ton RTH.</Text>
      </View>
    );
  }

  const daysOld = measurementDate ? getDaysSince(measurementDate) : null;
  if (daysOld !== null && daysOld > 7) {
    return (
      <View style={globalStyles.container}>
        <Text>
          Tes dernières mesures date de {daysOld} jours. Mesures-toi pour voir
          tes résultats.
        </Text>
      </View>
    );
  }

  const isStale = daysOld !== null && daysOld > 3;
  const whtr = calculateWaistHeightRatio(waist, height);
  const whtrCategory = obtainWHtRCategory(whtr);

  const whrCategory = obtainWHRCategory(waist / hip, gender);
  const whrZonesData = gender ? getWHRZones(gender) : null;
  const whtrZonesData = getWHtRZones();
  const bodyShapeInfo = obtainBodyShape(whrCategory);

  const waistBoundary = calculateWaistBoundary(height);
  const whtrDiffPercent = calculateWHtRDifferencePercent(whtr);

  return (
    <ScrollView contentContainerStyle={globalStyles.scrollContainer}>
      {isStale && (
        <View style={globalStyles.warningBanner}>
          <Text style={globalStyles.warningText}>
            ⚠️ Tes dernières mesures date de {daysOld} jours. Les résultats
            ci-dessous sont basés sur une valeur non à jour. Mesures-toi pour
            plus de précision.
          </Text>
        </View>
      )}

      {whr !== null && (
        <>
          <Text style={globalStyles.subTitle}>Rapport Taille-Hanche (RTH)</Text>
          <View style={globalStyles.card}>
            <Text style={globalStyles.mainTitle}>
              VOTRE RATIO TAILLE-HANCHE
            </Text>
            <Text style={globalStyles.heroValue}>{whr.toFixed(2)}</Text>
            <View
              style={[
                globalStyles.pillBadge,
                { backgroundColor: getCategoryColors(whrCategory).bg },
              ]}
            >
              <Text
                style={[
                  globalStyles.pillBadgeText,
                  { color: getCategoryColors(whrCategory).text },
                ]}
              >
                {whrCategory}
              </Text>
            </View>
          </View>
        </>
      )}
      <View style={globalStyles.gridContainer}>
        <View style={globalStyles.miniCard}>
          <Text style={globalStyles.miniCardTitle}>Silhouette</Text>
          <Text style={globalStyles.miniCardValue}>{bodyShapeInfo.shape}</Text>
          <Text style={globalStyles.footerNote}>
            {bodyShapeInfo.description}
          </Text>
        </View>

        <View style={globalStyles.miniCard}>
          <Text style={globalStyles.miniCardTitle}>Risque santé</Text>
          <Text
            style={[
              globalStyles.miniCardValue,
              { color: getCategoryColors(whrCategory).text },
            ]}
          >
            {whrCategory}
          </Text>
        </View>
      </View>

      {whr !== null && whrZonesData && (
        <Gauge
          value={whr}
          min={whrZonesData.min}
          max={whrZonesData.max}
          zones={whrZonesData.zones}
        />
      )}

      <Text style={globalStyles.sectionTitle}>Plages de référence OMS</Text>
      <Text style={globalStyles.sectionSubtitle}>
        Classification du risque santé par genre
      </Text>

      <Text style={globalStyles.scaleLabel}>Hommes</Text>

      <View
        style={[
          globalStyles.scaleRow,
          gender === 1 &&
            whrCategory === "Risque faible" &&
            globalStyles.activeScaleRow,
        ]}
      >
        <Text style={globalStyles.scaleLabel}>Faible</Text>
        <Text style={globalStyles.scaleValue}>{"<"} 0.90</Text>
      </View>
      <View
        style={[
          globalStyles.scaleRow,
          gender === 1 &&
            whrCategory === "Risque modéré" &&
            globalStyles.activeScaleRow,
        ]}
      >
        <Text style={globalStyles.scaleLabel}>Modéré</Text>
        <Text style={globalStyles.scaleValue}>0.90 - 0.99</Text>
      </View>
      <View
        style={[
          globalStyles.scaleRow,
          gender === 1 &&
            whrCategory === "Risque élevé" &&
            globalStyles.activeScaleRow,
        ]}
      >
        <Text style={globalStyles.scaleLabel}>Élevé</Text>
        <Text style={globalStyles.scaleValue}>{">="} 1.00</Text>
      </View>

      <Text style={[globalStyles.scaleLabel, { marginTop: 12 }]}>Femmes</Text>

      <View
        style={[
          globalStyles.scaleRow,
          gender === 2 &&
            whrCategory === "Risque faible" &&
            globalStyles.activeScaleRow,
        ]}
      >
        <Text style={globalStyles.scaleLabel}>Faible</Text>
        <Text style={globalStyles.scaleValue}>{"<"} 0.80</Text>
      </View>
      <View
        style={[
          globalStyles.scaleRow,
          gender === 2 &&
            whrCategory === "Risque modéré" &&
            globalStyles.activeScaleRow,
        ]}
      >
        <Text style={globalStyles.scaleLabel}>Modéré</Text>
        <Text style={globalStyles.scaleValue}>0.80 - 0.84</Text>
      </View>
      <View
        style={[
          globalStyles.scaleRow,
          gender === 2 &&
            whrCategory === "Risque élevé" &&
            globalStyles.activeScaleRow,
        ]}
      >
        <Text style={globalStyles.scaleLabel}>Élevé</Text>
        <Text style={globalStyles.scaleValue}>{">="} 0.85</Text>
      </View>

      {whtr !== null && (
        <>
          <Text style={globalStyles.subTitle}>
            Rapport Taille-Taille (WHtR)
          </Text>
          <View style={globalStyles.card}>
            <Text style={globalStyles.mainTitle}>
              VOTRE RATIO TAILLE-TAILLE
            </Text>
            <Text style={globalStyles.heroValue}>{whtr.toFixed(2)}</Text>
            <View
              style={[
                globalStyles.pillBadge,
                { backgroundColor: getCategoryColors(whtrCategory).bg },
              ]}
            >
              <Text
                style={[
                  globalStyles.pillBadgeText,
                  { color: getCategoryColors(whtrCategory).text },
                ]}
              >
                {whtrCategory}
              </Text>
            </View>
          </View>

          {whtrZonesData && (
            <Gauge
              value={whtr}
              min={whtrZonesData.min}
              max={whtrZonesData.max}
              zones={whtrZonesData.zones}
            />
          )}

          <View style={globalStyles.comparisonRow}>
            <View style={globalStyles.comparisonBox}>
              <Text style={globalStyles.compLabel}>Seuil des 0.5</Text>
              <Text style={globalStyles.compValue}>
                {waistBoundary.toFixed(1)}{" "}
                <Text style={globalStyles.compUnit}>cm</Text>
              </Text>
              <Text style={globalStyles.footerNote}>
                Ton tour de taille devrait être sous cette valeur pour un ratio
                de 0.5
              </Text>
            </View>

            <View style={globalStyles.comparisonBox}>
              <Text style={globalStyles.compLabel}>Comparé au seuil sain</Text>
              <Text
                style={[
                  globalStyles.compValue,
                  { color: whtrDiffPercent >= 0 ? "#e53935" : "#00875A" },
                ]}
              >
                {whtrDiffPercent >= 0 ? "+" : ""}
                {whtrDiffPercent.toFixed(0)}%
              </Text>
              <Text style={globalStyles.footerNote}>
                {whtrDiffPercent >= 0 ? "Au-dessus" : "En dessous"} du seuil
                critique de 0.5
              </Text>
            </View>
          </View>

          <Text style={globalStyles.sectionTitle}>Recommandations</Text>
          <View
            style={[
              globalStyles.riskAlertBox,
              { backgroundColor: getCategoryColors(whtrCategory).bg },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  globalStyles.riskAlertDescription,
                  { color: getCategoryColors(whtrCategory).text },
                ]}
              >
                {getWHtRRecommendation(whtrCategory)}
              </Text>
            </View>
          </View>

          <View style={globalStyles.infoBanner}>
            <Text style={globalStyles.infoText}>
              Privilégie une activité cardiovasculaire régulière, réduis les
              aliments transformés et le sucre ajouté, gère ton niveau de
              stress, et vise 7-9h de sommeil. De petits changements constants
              apportent des résultats durables.
            </Text>
          </View>

          <Text style={globalStyles.sectionTitle}>
            Plages de référence WHtR
          </Text>
          <Text style={globalStyles.sectionSubtitle}>
            Classification universelle (identique pour hommes et femmes)
          </Text>

          <View
            style={[
              globalStyles.scaleRow,
              whtrCategory === "Mince" && globalStyles.activeScaleRow,
            ]}
          >
            <Text style={globalStyles.scaleLabel}>Mince</Text>
            <Text style={globalStyles.scaleValue}>{"<"} 0.40</Text>
          </View>
          <View
            style={[
              globalStyles.scaleRow,
              whtrCategory === "Sain" && globalStyles.activeScaleRow,
            ]}
          >
            <Text style={globalStyles.scaleLabel}>Sain</Text>
            <Text style={globalStyles.scaleValue}>0.40 - 0.49</Text>
          </View>
          <View
            style={[
              globalStyles.scaleRow,
              whtrCategory === "Surpoids" && globalStyles.activeScaleRow,
            ]}
          >
            <Text style={globalStyles.scaleLabel}>Surpoids</Text>
            <Text style={globalStyles.scaleValue}>0.50 - 0.53</Text>
          </View>
          <View
            style={[
              globalStyles.scaleRow,
              whtrCategory === "Risque élevé" && globalStyles.activeScaleRow,
            ]}
          >
            <Text style={globalStyles.scaleLabel}>Risque élevé</Text>
            <Text style={globalStyles.scaleValue}>0.54 - 0.57</Text>
          </View>
          <View
            style={[
              globalStyles.scaleRow,
              whtrCategory === "Risque très élevé" &&
                globalStyles.activeScaleRow,
            ]}
          >
            <Text style={globalStyles.scaleLabel}>Risque très élevé</Text>
            <Text style={globalStyles.scaleValue}>{">="} 0.58</Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}
