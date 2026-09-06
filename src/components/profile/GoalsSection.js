import { View, Text, TouchableOpacity } from "react-native";
import { globalStyles } from "../../styles/GlobalStyles";

export const ACTIVITY_OPTIONS = [
  { value: "sedentary", label: "Sédentaire" },
  { value: "light", label: "Léger" },
  { value: "moderate", label: "Modéré" },
  { value: "active", label: "Intense" },
];

export const GOAL_OPTIONS = [
  { value: "lose", label: "Perdre" },
  { value: "maintain", label: "Maintenir" },
  { value: "gain", label: "Prendre" },
];

const RATE_OPTIONS = [0.25, 0.5, 0.75, 1];

export default function GoalsSection({
  activityLevel, setActivityLevel, weightGoal, setWeightGoal, weightGoalRate, setWeightGoalRate, latestWeight
}) {
  return (
    <View>
      <Text style={globalStyles.label}>Niveau d'activité :</Text>
      <View style={globalStyles.optionsRow}>
        {ACTIVITY_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[globalStyles.option, activityLevel === opt.value && globalStyles.optionSelected]}
            onPress={() => setActivityLevel(opt.value)}
          >
            <Text style={activityLevel === opt.value ? globalStyles.optionTextSelected : globalStyles.optionText}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={globalStyles.label}>Objectif :</Text>
      <View style={globalStyles.optionsRow}>
        {GOAL_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[globalStyles.option, weightGoal === opt.value && globalStyles.optionSelected]}
            onPress={() => setWeightGoal(opt.value)}
          >
            <Text style={weightGoal === opt.value ? globalStyles.optionTextSelected : globalStyles.optionText}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {weightGoal !== "maintain" && (
        <>
          <Text style={globalStyles.label}>Rythme (kg / semaine) :</Text>
          <View style={globalStyles.optionsRow}>
            {RATE_OPTIONS.map((rate) => (
              <TouchableOpacity
                key={rate}
                style={[globalStyles.option, weightGoalRate === rate && globalStyles.optionSelected]}
                onPress={() => setWeightGoalRate(rate)}
              >
                <Text style={weightGoalRate === rate ? globalStyles.optionTextSelected : globalStyles.optionText}>
                  {rate}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <Text style={globalStyles.weightInfo}>
        Poids actuel utilisé pour le calcul : {latestWeight ? `${latestWeight} kg` : "aucune entrée"}
      </Text>
    </View>
  );
}