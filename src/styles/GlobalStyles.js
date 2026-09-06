import { StyleSheet } from "react-native";

export const MACRO_COLORS = {
  protein: "#EF5350",
  carbs: "#FFA726",
  fat: "#42A5F5",
  fiber: "#8D6E63",
};

export const globalStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20, paddingTop: 60 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  label: { fontSize: 16, marginTop: 15, marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  optionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  option: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  optionSelected: { backgroundColor: "#4CAF50", borderColor: "#4CAF50" },
  optionText: { color: "#333" },
  optionTextSelected: { color: "#fff", fontWeight: "bold" },

  titre: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 8,
  },
  total: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  infoBanner: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D3D3D3",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginVertical: 10,
  },
  infoText: {
    color: "#856404",
    fontSize: 14,
  },
  liste: { flex: 1 },
  ligne: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  details: {
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 6,
    marginBottom: 5,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  progressBarBackground: {
    height: 20,
    backgroundColor: "#eee",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 20,
  },
  progressBarFill: { height: "100%", backgroundColor: "#4CAF50" },

  weightInfo: {
    marginTop: 20,
    marginBottom: 10,
    fontStyle: "italic",
    color: "#666",
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    flexWrap: "wrap",
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
    marginLeft: 15,
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#fff",
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  primaryButton: {
    backgroundColor: "#0095ff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 8,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  card: {
    backgroundColor: "#FCFAF7",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#EFECE6",
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "serif",
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#756D65",
    marginTop: 4,
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: "row",
    gap: 10,
  },
  miniCard: {
    flex: 1,
    backgroundColor: "#FCFAF7",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#EFECE6",
    alignItems: "center",
  },
  miniCardTitle: {
    fontSize: 12,
    color: "#5A524C",
    textAlign: "center",
    marginBottom: 8,
  },
  miniCardValue: {
    fontSize: 22,
    fontWeight: "bold",
  },
  miniCardUnit: {
    fontSize: 12,
    color: "#8C837B",
  },
  menuRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  menuRowTextWrapper: { flex: 1, paddingRight: 10 },
  menuChevron: {
    fontSize: 24,
    color: "#B9B2AA",
  },
});