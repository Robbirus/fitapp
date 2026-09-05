import { useState } from "react";
import {
  TouchableOpacity,
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
} from "react-native";
import { getScoreBand, getScoreBreakdown, getScoreComponents } from "../utils/FoodScore";
import SegmentedDonut from "./SegmentedDonut";
import { scoreBadgeStyles as styles } from "../styles/ComponentStyle";

const ORIGIN_LABELS = { fr: "France", eu: "UE", non_eu: "Hors UE" };

// scoreResult: { score, scoreType, nutriscoreGrade, isOrganic, originCategory }
// macros: { calories100g, protein100g, fiber100g, fat100g } -- only needed (and only
//         used) when scoreType is "estimate", since that formula reads straight from macros.
// compact: smaller badge for use inline next to a list item / ingredient row.
export default function ScoreBadge({ scoreResult, macros, compact = false }) {
  const [modalVisible, setModalVisible] = useState(false);

  if (!scoreResult || typeof scoreResult.score !== "number") return null;

  const band = getScoreBand(scoreResult.score);
  const breakdown = getScoreBreakdown(scoreResult, macros);
  const components = getScoreComponents(scoreResult); // non-null only for "off" scores
  const rounded = Math.round(scoreResult.score);

  const donutSegments = components
    ? [
        { value: components.nutritionContribution, color: "#4A90D9", label: "Nutrition" },
        { value: components.additiveContribution, color: "#F5A623", label: "Additifs" },
        { value: components.bioContribution, color: "#7CB342", label: "Bio" },
      ]
    : null;

  return (
    <>
      <TouchableOpacity onPress={() => setModalVisible(true)} activeOpacity={0.8}>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: band.color,
              paddingVertical: compact ? 2 : 8,
              paddingHorizontal: compact ? 8 : 14,
            },
          ]}
        >
          <Text style={[styles.badgeText, { fontSize: compact ? 12 : 14 }]}>
            {compact
              ? `${rounded}${scoreResult.scoreType === "estimate" ? "*" : ""}`
              : `${band.label} · ${rounded}/100${
                  scoreResult.scoreType === "estimate" ? " (estimation)" : ""
                }`}
          </Text>
        </View>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Détail du score</Text>

            {donutSegments ? (
              <>
                <View style={styles.donutWrapper}>
                  <SegmentedDonut
                    segments={donutSegments}
                    centerValue={rounded}
                    textValue={band.label}
                    radius={55}
                    strokeWidth={28}
                  />
                </View>

                <View style={styles.legend}>
                  {donutSegments.map((seg, index) => (
                    <View key={index} style={styles.legendRow}>
                      <View style={[styles.legendSwatch, { backgroundColor: seg.color }]} />
                      <Text style={styles.legendLabel}>{seg.label}</Text>
                      <Text style={styles.legendValue}>{Math.round(seg.value)} pts</Text>
                    </View>
                  ))}
                  {components.originBonus !== 0 && (
                    <View style={styles.legendRow}>
                      <View style={[styles.legendSwatch, { backgroundColor: "#999" }]} />
                      <Text style={styles.legendLabel}>
                        Origine ({ORIGIN_LABELS[scoreResult.originCategory] || "?"})
                      </Text>
                      <Text style={styles.legendValue}>
                        {components.originBonus > 0 ? "+" : ""}
                        {components.originBonus} pts
                      </Text>
                    </View>
                  )}
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.scoreHeadline, { color: band.color }]}>
                  {band.label} · {rounded}/100
                </Text>
                <ScrollView style={styles.detailsContainer}>
                  {breakdown.rows.map((row, index) => (
                    <View key={index} style={styles.detailRow}>
                      <Text style={styles.detailLabel}>{row.label}</Text>
                      <Text style={styles.detailValue}>{row.display}</Text>
                    </View>
                  ))}
                </ScrollView>
              </>
            )}

            {breakdown.note && <Text style={styles.note}>{breakdown.note}</Text>}

            <Pressable
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Fermer</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}