import { StyleSheet } from "react-native";

export const bodyCompositionStyles = StyleSheet.create({
  mainTitle: {
    textAlign: "center",
    letterSpacing: 2,
    fontSize: 13,
    fontWeight: "600",
    color: "#5A524C",
    marginBottom: 8,
  },
  heroValue: {
    fontSize: 64,
    fontWeight: "bold",
    color: "#D96B27",
    textAlign: "center",
    lineHeight: 68,
  },
  unitText: {
    fontSize: 20,
    color: "#6E655F",
    textAlign: "center",
  },
  subUnitText: {
    fontSize: 14,
    color: "#8C837B",
    textAlign: "center",
    marginBottom: 16,
  },
  pillBadge: {
    backgroundColor: "#DCEBFF",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: "center",
  },
  pillBadgeText: {
    color: "#0066FF",
    fontWeight: "600",
    fontSize: 14,
  },
  comparisonRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  comparisonBox: {
    flex: 1,
    backgroundColor: "#F2EFEB",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  compLabel: {
    fontSize: 13,
    color: "#6E655F",
    marginBottom: 4,
  },
  compValue: {
    fontSize: 22,
    fontWeight: "bold",
  },
  compUnit: {
    fontSize: 14,
    fontWeight: "normal",
  },
  greenInsightText: {
    color: "#00875A",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  riskAlertBox: {
    backgroundColor: "#DDF7E8",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  checkIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#A3EAD0",
    alignItems: "center",
    justifyContent: "center",
  },
  riskAlertTitle: {
    color: "#00875A",
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 2,
  },
  riskAlertDescription: {
    color: "#2C523C",
    fontSize: 13,
    lineHeight: 18,
  },
  
  riskAlertBoxDanger: { backgroundColor: "#FDE2E1" },
  checkIconDanger: { backgroundColor: "#F5A3A0" },
  riskAlertTitleDanger: { color: "#C62828" },
  riskAlertDescriptionDanger: { color: "#7A2E27" },
  footerNote: {
    fontSize: 12,
    color: "#5A524C",
  },
  scaleRow: {
    backgroundColor: "#F7F5F0",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  activeScaleRow: {
    backgroundColor: "#DCEBFF",
    borderWidth: 2,
    borderColor: "#0066FF",
  },
  scaleLabel: {
    fontWeight: "600",
    color: "#5A524C",
  },
  scaleValue: {
    color: "#756D65",
  },
  warningBanner: {
    backgroundColor: "#FFF3CD",
    borderColor: "#FFEEBA",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginVertical: 10,
  },
  warningText: {
    color: "#856404",
    fontSize: 14,
  },

  
  riskAlertTextWrapper: { flex: 1 },
  
  donutRow: { flexDirection: "row", alignItems: "center" },
});