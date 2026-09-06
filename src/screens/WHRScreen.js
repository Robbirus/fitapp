import { useDatabase } from "../db/DatabaseContext";
import { loadProfileSettings, loadLatestBodyMeasurement } from "../db/Queries";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Text, View, ScrollView } from "react-native";
import { globalStyles } from "../styles/GlobalStyles";
import { bodyCompositionStyles } from "../styles/BodyCompositionStyle";
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
    setMeasurementDate(latestMeasurement?.date || null);
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

  const whrCategory = obtainWHRCategory(whr, gender);
  const whrZonesData = gender ? getWHRZones(gender) : null;
  const whtrZonesData = getWHtRZones();
  const bodyShapeInfo = obtainBodyShape(whrCategory);

  const waistBoundary = calculateWaistBoundary(height);
  const whtrDiffPercent = calculateWHtRDifferencePercent(whtr);

  return (
    <ScrollView contentContainerStyle={globalStyles.scrollContainer}>
      {isStale && (
        <View style={bodyCompositionStyles.warningBanner}>
          <Text style={bodyCompositionStyles.warningText}>
            ⚠️ Tes dernières mesures date de {daysOld} jours. Les résultats
            ci-dessous sont basés sur une valeur non à jour. Mesures-toi pour
            plus de précision.
          </Text>
        </View>
      )}

      {whr !== null && (
        <>
          <View style={globalStyles.card}>
            <Text style={bodyCompositionStyles.mainTitle}>
              VOTRE RATIO TAILLE-HANCHE
            </Text>
            <Text style={bodyCompositionStyles.heroValue}>{whr.toFixed(2)}</Text>
            <View
              style={[
                bodyCompositionStyles.pillBadge,
                { backgroundColor: getCategoryColors(whrCategory).bg },
              ]}
            >
              <Text
                style={[
                  bodyCompositionStyles.pillBadgeText,
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
          <Text style={bodyCompositionStyles.footerNote}>
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

      <Text style={bodyCompositionStyles.scaleLabel}>Hommes</Text>

      <View
        style={[
          bodyCompositionStyles.scaleRow,
          gender === 1 &&
            whrCategory === "Risque faible" &&
            bodyCompositionStyles.activeScaleRow,
        ]}
      >
        <Text style={bodyCompositionStyles.scaleLabel}>Faible</Text>
        <Text style={bodyCompositionStyles.scaleValue}>{"<"} 0.90</Text>
      </View>
      <View
        style={[
          bodyCompositionStyles.scaleRow,
          gender === 1 &&
            whrCategory === "Risque modéré" &&
            bodyCompositionStyles.activeScaleRow,
        ]}
      >
        <Text style={bodyCompositionStyles.scaleLabel}>Modéré</Text>
        <Text style={bodyCompositionStyles.scaleValue}>0.90 - 0.99</Text>
      </View>
      <View
        style={[
          bodyCompositionStyles.scaleRow,
          gender === 1 &&
            whrCategory === "Risque élevé" &&
            bodyCompositionStyles.activeScaleRow,
        ]}
      >
        <Text style={bodyCompositionStyles.scaleLabel}>Élevé</Text>
        <Text style={bodyCompositionStyles.scaleValue}>{">="} 1.00</Text>
      </View>

      <Text style={[bodyCompositionStyles.scaleLabel, { marginTop: 12 }]}>Femmes</Text>

      <View
        style={[
          bodyCompositionStyles.scaleRow,
          gender === 2 &&
            whrCategory === "Risque faible" &&
            bodyCompositionStyles.activeScaleRow,
        ]}
      >
        <Text style={bodyCompositionStyles.scaleLabel}>Faible</Text>
        <Text style={bodyCompositionStyles.scaleValue}>{"<"} 0.80</Text>
      </View>
      <View
        style={[
          bodyCompositionStyles.scaleRow,
          gender === 2 &&
            whrCategory === "Risque modéré" &&
            bodyCompositionStyles.activeScaleRow,
        ]}
      >
        <Text style={bodyCompositionStyles.scaleLabel}>Modéré</Text>
        <Text style={bodyCompositionStyles.scaleValue}>0.80 - 0.84</Text>
      </View>
      <View
        style={[
          bodyCompositionStyles.scaleRow,
          gender === 2 &&
            whrCategory === "Risque élevé" &&
            bodyCompositionStyles.activeScaleRow,
        ]}
      >
        <Text style={bodyCompositionStyles.scaleLabel}>Élevé</Text>
        <Text style={bodyCompositionStyles.scaleValue}>{">="} 0.85</Text>
      </View>

      {whtr !== null && (
        <>
          <View style={globalStyles.card}>
            <Text style={bodyCompositionStyles.mainTitle}>
              VOTRE RATIO TAILLE-TAILLE
            </Text>
            <Text style={bodyCompositionStyles.heroValue}>{whtr.toFixed(2)}</Text>
            <View
              style={[
                bodyCompositionStyles.pillBadge,
                { backgroundColor: getCategoryColors(whtrCategory).bg },
              ]}
            >
              <Text
                style={[
                  bodyCompositionStyles.pillBadgeText,
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

          <View style={bodyCompositionStyles.comparisonRow}>
            <View style={bodyCompositionStyles.comparisonBox}>
              <Text style={bodyCompositionStyles.compLabel}>Seuil des 0.5</Text>
              <Text style={bodyCompositionStyles.compValue}>
                {waistBoundary.toFixed(1)}{" "}
                <Text style={bodyCompositionStyles.compUnit}>cm</Text>
              </Text>
              <Text style={bodyCompositionStyles.footerNote}>
                Ton tour de taille devrait être sous cette valeur pour un ratio
                de 0.5
              </Text>
            </View>

            <View style={bodyCompositionStyles.comparisonBox}>
              <Text style={bodyCompositionStyles.compLabel}>Comparé au seuil sain</Text>
              <Text
                style={[
                  bodyCompositionStyles.compValue,
                  { color: whtrDiffPercent >= 0 ? "#e53935" : "#00875A" },
                ]}
              >
                {whtrDiffPercent >= 0 ? "+" : ""}
                {whtrDiffPercent.toFixed(0)}%
              </Text>
              <Text style={bodyCompositionStyles.footerNote}>
                {whtrDiffPercent >= 0 ? "Au-dessus" : "En dessous"} du seuil
                critique de 0.5
              </Text>
            </View>
          </View>

          <Text style={globalStyles.sectionTitle}>Recommandations</Text>
          <View
            style={[
              bodyCompositionStyles.riskAlertBox,
              { backgroundColor: getCategoryColors(whtrCategory).bg },
            ]}
          >
            <View style={bodyCompositionStyles.riskAlertTextWrapper}>
              <Text
                style={[
                  bodyCompositionStyles.riskAlertDescription,
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
              bodyCompositionStyles.scaleRow,
              whtrCategory === "Mince" && bodyCompositionStyles.activeScaleRow,
            ]}
          >
            <Text style={bodyCompositionStyles.scaleLabel}>Mince</Text>
            <Text style={bodyCompositionStyles.scaleValue}>{"<"} 0.40</Text>
          </View>
          <View
            style={[
              bodyCompositionStyles.scaleRow,
              whtrCategory === "Sain" && bodyCompositionStyles.activeScaleRow,
            ]}
          >
            <Text style={bodyCompositionStyles.scaleLabel}>Sain</Text>
            <Text style={bodyCompositionStyles.scaleValue}>0.40 - 0.49</Text>
          </View>
          <View
            style={[
              bodyCompositionStyles.scaleRow,
              whtrCategory === "Surpoids" && bodyCompositionStyles.activeScaleRow,
            ]}
          >
            <Text style={bodyCompositionStyles.scaleLabel}>Surpoids</Text>
            <Text style={bodyCompositionStyles.scaleValue}>0.50 - 0.53</Text>
          </View>
          <View
            style={[
              bodyCompositionStyles.scaleRow,
              whtrCategory === "Risque élevé" && bodyCompositionStyles.activeScaleRow,
            ]}
          >
            <Text style={bodyCompositionStyles.scaleLabel}>Risque élevé</Text>
            <Text style={bodyCompositionStyles.scaleValue}>0.54 - 0.57</Text>
          </View>
          <View
            style={[
              bodyCompositionStyles.scaleRow,
              whtrCategory === "Risque très élevé" &&
                bodyCompositionStyles.activeScaleRow,
            ]}
          >
            <Text style={bodyCompositionStyles.scaleLabel}>Risque très élevé</Text>
            <Text style={bodyCompositionStyles.scaleValue}>{">="} 0.58</Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}