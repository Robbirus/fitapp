import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ScrollView, TouchableOpacity, Text, View } from "react-native";
import { useDatabase } from "../db/DatabaseContext";
import { loadProfileFormData } from "../utils/ProfileFormHelpers";
import { globalStyles } from "../styles/GlobalStyles";
import { ACTIVITY_OPTIONS, GOAL_OPTIONS } from "../components/profile/GoalsSection";
import { DIET_STYLE_OPTIONS } from "../components/profile/DietStyleSection";

const labelFor = (options, value) => options.find((o) => o.value === value)?.label || value;

function MenuRow({ label, preview, onPress }) {
  return (
    <TouchableOpacity
      style={[globalStyles.card, globalStyles.menuRow, { marginBottom: 12 }]}
      activeOpacity={0.6}
      onPress={onPress}
    >
      <View style={globalStyles.menuRowTextWrapper}>
        <Text style={globalStyles.sectionTitle}>{label}</Text>
        {preview ? <Text style={globalStyles.sectionSubtitle}>{preview}</Text> : null}
      </View>
      <Text style={globalStyles.menuChevron}>›</Text>
    </TouchableOpacity>
  );
}

export default function ProfileScreen({ navigation }) {
  const db = useDatabase();
  const [form, setForm] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadProfileFormData(db).then(setForm);
    }, [db]),
  );

  if (!form) return null;

  return (
    <ScrollView contentContainerStyle={globalStyles.scrollContainer}>
      <TouchableOpacity
        style={[globalStyles.primaryButton, { marginBottom: 16, backgroundColor: "#FFD700" }]}
        activeOpacity={0.6}
        onPress={() => navigation.navigate("Succès")}
      >
        <Text style={[globalStyles.primaryButtonText, { color: "#000" }]}>
          🏆 Voir mes succès
        </Text>
      </TouchableOpacity>

      <MenuRow
        label="Informations personnelles"
        preview={`${form.name} · ${form.height} cm · ${form.age} ans`}
        onPress={() => navigation.navigate("Informations personnelles")}
      />
      <MenuRow
        label="Objectifs & Activité"
        preview={`${labelFor(GOAL_OPTIONS, form.weightGoal)} · ${labelFor(ACTIVITY_OPTIONS, form.activityLevel)}`}
        onPress={() => navigation.navigate("Objectifs & Activité")}
      />
      <MenuRow
        label="Style de régime"
        preview={labelFor(DIET_STYLE_OPTIONS, form.dietStyle)}
        onPress={() => navigation.navigate("Style de régime")}
      />
      <MenuRow
        label="Horaires & Hydratation"
        preview={`Eau : ${form.waterGoal} L/j`}
        onPress={() => navigation.navigate("Horaires & Hydratation")}
      />
      <MenuRow
        label="💧 Rappels d'eau"
        preview="Notifications à intervalle régulier"
        onPress={() => navigation.navigate("Rappels")}
      />
      <MenuRow
        label="Mon poids"
        preview={form.latestWeight ? `${form.latestWeight} kg` : "Aucune entrée"}
        onPress={() => navigation.navigate("Poids")}
      />
      <MenuRow
        label="Mes mesures corporelles"
        onPress={() => navigation.navigate("Mesures")}
      />
    </ScrollView>
  );
}