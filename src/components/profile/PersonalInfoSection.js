import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { globalStyles } from "../../styles/GlobalStyles";

const ETHNICITY_OPTIONS = [
  { value: "caucasian", label: "Caucasien" },
  { value: "afro-american", label: "Afro-Américain" },
  { value: "asian", label: "Asiatique" },
];

export default function PersonalInfoSection({
  name, setName, height, setHeight, age, setAge, gender, setGender, ethnicity, setEthnicity
}) {
  return (
    <View>
      <Text style={globalStyles.label}>Nom :</Text>
      <TextInput style={globalStyles.input} value={name} onChangeText={setName} />

      <Text style={globalStyles.label}>Taille (cm) :</Text>
      <TextInput style={globalStyles.input} value={height} onChangeText={setHeight} keyboardType="numeric" />

      <Text style={globalStyles.label}>Âge :</Text>
      <TextInput style={globalStyles.input} value={age} onChangeText={setAge} keyboardType="numeric" />

      <Text style={globalStyles.label}>Sexe :</Text>
      <View style={globalStyles.optionsRow}>
        {[{ value: 1, label: "Homme" }, { value: 2, label: "Femme" }].map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[globalStyles.option, gender === opt.value && globalStyles.optionSelected]}
            onPress={() => setGender(opt.value)}
          >
            <Text style={gender === opt.value ? globalStyles.optionTextSelected : globalStyles.optionText}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={globalStyles.label}>Ethnie :</Text>
      <View style={globalStyles.optionsRow}>
        {ETHNICITY_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[globalStyles.option, ethnicity === opt.value && globalStyles.optionSelected]}
            onPress={() => setEthnicity(opt.value)}
          >
            <Text style={ethnicity === opt.value ? globalStyles.optionTextSelected : globalStyles.optionText}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}