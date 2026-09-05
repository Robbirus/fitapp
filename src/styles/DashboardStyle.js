import { StyleSheet } from "react-native";

export const dashboardStyles = StyleSheet.create({
  statsRow: { flexDirection: "row", justifyContent: "space-around" },
  statBox: { alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: "bold" },
  statLabel: { fontSize: 14, color: "#666" },

  waterButtonLight: { backgroundColor: "#42A5F5" },
  waterButtonDark: { backgroundColor: "#1E88E5" },
  waterButtonsRow: { flexDirection: "row", gap: 10, marginTop: 12 },

  backupButton: { flex: 1, marginRight: 8, backgroundColor: "#607D8B" },
  restoreButton: { flex: 1, marginLeft: 8, backgroundColor: "#78909C" },
  backupRestoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  barChartTopLabel: { fontSize: 10, color: "#555" },
  weekChartWrapper: { marginTop: 12, alignItems: "center" },

  donutWrapper: { alignItems: "center", marginVertical: 10 },
  macrosListWrapper: { marginTop: 8 },

  // AchievementsScreen
  achievementCard: { marginBottom: 10 },
  achievementProgressText: { fontSize: 13, color: "#756D65" },
  achievementUnlockedDate: { fontSize: 11, color: "#8C837B" },
  categorySection: { marginBottom: 16 },

  chartScrollWrapper: { marginTop: 12 },
});