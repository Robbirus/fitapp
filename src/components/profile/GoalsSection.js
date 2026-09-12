import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { globalStyles } from "../../styles/GlobalStyles";
import { estimateGoalDate } from "../../utils/NutritionCalculator";
import { getTodayISO } from "../../utils/DateHelpers";

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
  activityLevel, setActivityLevel, weightGoal, setWeightGoal, weightGoalRate, setWeightGoalRate,
  targetWeight, setTargetWeight, latestWeight
}) {
  const parsedTarget = parseFloat(targetWeight);
  const hasValidTarget = latestWeight && !isNaN(parsedTarget) && parsedTarget > 0;
  const alreadyThere = hasValidTarget && Math.abs(parsedTarget - latestWeight) < 0.05;

  const estimatedDate =
    weightGoal !== "maintain" && hasValidTarget && !alreadyThere
      ? estimateGoalDate({
          goalStartDate: getTodayISO(),
          goalStartWeight: latestWeight,
          weightGoal,
          weightGoalRate,
          targetWeight: parsedTarget,
        })
      : null;

  const targetGoesWrongWay =
    weightGoal !== "maintain" && hasValidTarget && !alreadyThere && !estimatedDate;

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

          <Text style={globalStyles.label}>Poids cible (kg) :</Text>
          <TextInput
            style={globalStyles.input}
            value={targetWeight}
            onChangeText={setTargetWeight}
            keyboardType="numeric"
            placeholder="ex: 70"
          />

          {alreadyThere && (
            <Text style={globalStyles.weightInfo}>
              Tu as déjà atteint ce poids !
            </Text>
          )}
          {estimatedDate && (
            <Text style={globalStyles.weightInfo}>
              Objectif estimé atteint autour du {estimatedDate}, à un rythme de{" "}
              {weightGoalRate} kg/semaine.
            </Text>
          )}
          {targetGoesWrongWay && (
            <Text style={[globalStyles.weightInfo, { color: "#e53935" }]}>
              {weightGoal === "lose"
                ? "Ce poids cible est supérieur à ton poids actuel : incohérent avec l'objectif \"Perdre\"."
                : "Ce poids cible est inférieur à ton poids actuel : incohérent avec l'objectif \"Prendre\"."}
            </Text>
          )}
        </>
      )}

      <Text style={globalStyles.weightInfo}>
        Poids actuel utilisé pour le calcul : {latestWeight ? `${latestWeight} kg` : "aucune entrée"}
      </Text>
    </View>
  );
}