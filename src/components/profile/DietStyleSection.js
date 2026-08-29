import { View, Text, TouchableOpacity } from "react-native";
import { globalStyles } from "../../styles/GlobalStyles";

export const DIET_STYLE_OPTIONS = [
  { value: "balanced", label: "Équilibré" },
  { value: "keto", label: "Cétogène" },
  { value: "high_protein", label: "Riche en protéines" },
  { value: "low_carb", label: "Faible en glucides" },
];

const DIET_STYLE_DESCRIPTIONS = {
  balanced: "Répartition classique : protéines et lipides selon ton poids, le reste en glucides.",
  keto: "Glucides très bas (~25g/jour), protéines modérées, lipides en majorité.",
  high_protein: "Apport en protéines nettement augmenté pour la prise ou le maintien de muscle.",
  low_carb: "Glucides plafonnés à environ 20% des calories totales.",
};

export default function DietStyleSection({ dietStyle, setDietStyle }) {
  return (
    <View>
      <Text style={globalStyles.titre}>Style de régime</Text>

      <Text style={globalStyles.label}>Répartition des macronutriments :</Text>
      <View style={globalStyles.optionsRow}>
        {DIET_STYLE_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[globalStyles.option, dietStyle === opt.value && globalStyles.optionSelected]}
            onPress={() => setDietStyle(opt.value)}
          >
            <Text style={dietStyle === opt.value ? globalStyles.optionTextSelected : globalStyles.optionText}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={globalStyles.weightInfo}>
        {DIET_STYLE_DESCRIPTIONS[dietStyle] || DIET_STYLE_DESCRIPTIONS.balanced}
      </Text>
    </View>
  );
}