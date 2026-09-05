import { StyleSheet } from "react-native";

export const journalStyles = StyleSheet.create({
  message: { textAlign: "center", marginBottom: 20, fontSize: 16 },
  macrosBox: { width: "100%", marginTop: 10 },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  ingredientScoreBadge: {
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  ingredientScoreBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },

  dateNavRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  dateNavButton: { padding: 8 },
  dateNavArrow: { fontSize: 28 },

  mealSection: { marginBottom: 20 },
  mealSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  emptyMealText: { color: "#999" },

  pickerPanel: { flex: 1, padding: 20 },
  pickerLoadingIndicator: { marginTop: 20 },
  pickerResultsList: { marginTop: 10 },
  pickerEmptyText: { color: "#999", marginTop: 10 },
  cancelButton: { backgroundColor: "#e53935" },
  buttonSpacer: { height: 10 },
  fullFlex: { flex: 1 },
  scannerActionsOverlay: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: "center",
  },

  recipeListWrapper: { marginTop: 10 },
  recipeCard: { marginBottom: 12 },
  recipeCardActionsRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  recipeCardActionButton: { flex: 1, marginVertical: 0 },
  recipeMacroRow: { flexDirection: "row", gap: 14, marginTop: -8, marginBottom: 8 },
  recipeMacroText: { fontSize: 12 },
  emptyRecipesText: { color: "#999", marginTop: 20, textAlign: "center" },

  scoreBadgeWrapper: { alignItems: "center", marginBottom: 12 },
  labelSpaced: { marginTop: 20 },
  ingredientCardSpacing: { marginBottom: 8 },
  ingredientName: { fontWeight: "bold" },
  ingredientCalories: { color: "#666", marginBottom: 6 },
  quantityRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  quantityInput: { flex: 1, marginBottom: 0 },
  totalsBanner: { marginTop: 10 },
  totalsMacroRow: { flexDirection: "row", gap: 14, marginTop: 6 },
  totalsMacroText: { fontSize: 13 },
  
  noIngredientsText: { color: "#999", marginBottom: 10 },
  removeIngredientButton: { backgroundColor: "#e53935", marginTop: 8 },
  recipeTotalsBanner: { marginTop: 4, alignItems: "center" },
  recipeScoreWrapper: { marginTop: 8 },
  addIngredientRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
});