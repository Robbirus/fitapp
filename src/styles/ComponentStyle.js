import { StyleSheet } from "react-native";

export const scoreBadgeStyles = StyleSheet.create({
  badge: { borderRadius: 20, alignSelf: "flex-start" },
  badgeText: { color: "#fff", fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    maxHeight: "85%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  donutWrapper: { alignItems: "center", marginBottom: 12 },
  legend: { width: "100%" },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  legendSwatch: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  legendLabel: { flex: 1 },
  legendValue: { fontWeight: "bold" },
  scoreHeadline: { fontSize: 16, fontWeight: "bold", textAlign: "center", marginBottom: 12 },
  detailsContainer: { width: "100%" },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  detailLabel: { flex: 1, paddingRight: 10 },
  detailValue: { fontWeight: "bold" },
  note: { color: "#999", fontSize: 12, marginTop: 12 },
  closeButton: {
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginTop: 16,
  },
  closeButtonText: { color: "#fff", fontWeight: "bold" },
});

export const achievementToastStyles = StyleSheet.create({
  toast: {
    position: "absolute",
    top: 0, left: 20, right: 20,
    backgroundColor: "#FFD700", // Doré
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5,
    elevation: 6,
    zIndex: 9999,
    alignItems: "center",
  },
  title: { fontWeight: "bold", fontSize: 16, color: "#000", marginBottom: 4 },
  desc: { fontWeight: "600", fontSize: 14, color: "#333" },
  sub: { fontSize: 12, color: "#555", marginTop: 2, textAlign: "center" },
});