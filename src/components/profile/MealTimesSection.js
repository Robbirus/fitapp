import { View, Text, TextInput } from "react-native";
import { globalStyles } from "../../styles/GlobalStyles";

export default function MealTimesSection({ mealTimes, setMealTimes, waterGoal, setWaterGoal }) {
  const handleChange = (key, value) => {
    setMealTimes((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <View>
      <Text style={globalStyles.label}>Petit-déjeuner :</Text>
      <TextInput
        style={globalStyles.input}
        value={mealTimes.breakfast}
        onChangeText={(val) => handleChange("breakfast", val)}
        placeholder="HH:MM"
      />

      <Text style={globalStyles.label}>Déjeuner :</Text>
      <TextInput
        style={globalStyles.input}
        value={mealTimes.lunch}
        onChangeText={(val) => handleChange("lunch", val)}
        placeholder="HH:MM"
      />

      <Text style={globalStyles.label}>Collation (Snack) :</Text>
      <TextInput
        style={globalStyles.input}
        value={mealTimes.snack}
        onChangeText={(val) => handleChange("snack", val)}
        placeholder="HH:MM"
      />

      <Text style={globalStyles.label}>Dîner :</Text>
      <TextInput
        style={globalStyles.input}
        value={mealTimes.dinner}
        onChangeText={(val) => handleChange("dinner", val)}
        placeholder="HH:MM"
      />

      <Text style={globalStyles.label}>Objectif d'eau (L / jour) :</Text>
      <TextInput
        style={globalStyles.input}
        value={waterGoal}
        onChangeText={setWaterGoal}
        keyboardType="numeric"
      />
    </View>
  );
}