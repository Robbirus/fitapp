import { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useDatabase } from "../db/DatabaseContext";
import { loadProfileSettings, updateWaterReminderSettings } from "../db/Queries";
import { globalStyles } from "../styles/GlobalStyles";
import {
  scheduleWaterReminders,
  disableWaterReminders,
  requestNotificationPermission,
} from "../utils/WaterReminders";

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export default function RemindersScreen() {
  const db = useDatabase();
  const [enabled, setEnabled] = useState(false);
  const [start, setStart] = useState("08:00");
  const [end, setEnd] = useState("20:00");
  const [intervalHours, setIntervalHours] = useState("2");
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!db) return;
      loadProfileSettings(db).then((p) => {
        if (!p) return;
        setEnabled(p.water_reminder_enabled === 1);
        setStart(p.water_reminder_start || "08:00");
        setEnd(p.water_reminder_end || "20:00");
        setIntervalHours((p.water_reminder_interval_hours ?? 2).toString());
      });
    }, [db]),
  );

  const save = async () => {
    if (enabled) {
      if (!TIME_REGEX.test(start) || !TIME_REGEX.test(end)) {
        Alert.alert("Heure invalide", "Utilise le format HH:MM (ex: 08:00).");
        return;
      }
      if (start >= end) {
        Alert.alert("Plage invalide", "L'heure de début doit précéder l'heure de fin.");
        return;
      }
    }
    const parsedInterval = parseFloat(intervalHours);
    if (enabled && (isNaN(parsedInterval) || parsedInterval <= 0)) {
      Alert.alert(
        "Valeur invalide",
        "L'intervalle doit être un nombre d'heures supérieur à 0.",
      );
      return;
    }

    setSaving(true);
    try {
      if (enabled) {
        const granted = await requestNotificationPermission();
        if (!granted) {
          Alert.alert(
            "Notifications désactivées",
            "Active les notifications pour cette app dans les réglages de ton téléphone pour recevoir les rappels d'eau.",
          );
          setSaving(false);
          return;
        }
        await scheduleWaterReminders({ start, end, intervalHours: parsedInterval });
      } else {
        await disableWaterReminders();
      }

      await updateWaterReminderSettings(db, {
        enabled,
        start,
        end,
        intervalHours: parsedInterval || 2,
      });

      Alert.alert("Enregistré", "Tes rappels d'eau ont été mis à jour.");
    } catch (error) {
      console.log("ERROR saving water reminders:", error.message);
      Alert.alert("Erreur", "Impossible d'enregistrer les rappels.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={globalStyles.scrollContainer}>
      <Text style={globalStyles.titre}>Rappels d'eau</Text>
      <Text style={[globalStyles.sectionSubtitle, { marginBottom: 16 }]}>
        Reçois une notification à intervalle régulier pendant la journée pour
        penser à t'hydrater.
      </Text>

      <View style={[globalStyles.card, { marginBottom: 16 }]}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={globalStyles.sectionTitle}>Activer les rappels</Text>
          <Switch value={enabled} onValueChange={setEnabled} />
        </View>

        {enabled && (
          <>
            <Text style={globalStyles.label}>Début :</Text>
            <TextInput
              style={globalStyles.input}
              value={start}
              onChangeText={setStart}
              placeholder="08:00"
            />

            <Text style={globalStyles.label}>Fin :</Text>
            <TextInput
              style={globalStyles.input}
              value={end}
              onChangeText={setEnd}
              placeholder="20:00"
            />

            <Text style={globalStyles.label}>Intervalle (heures) :</Text>
            <TextInput
              style={globalStyles.input}
              value={intervalHours}
              onChangeText={setIntervalHours}
              keyboardType="numeric"
              placeholder="2"
            />

            <Text style={globalStyles.weightInfo}>
              Un rappel sera programmé toutes les {intervalHours || "?"}h entre{" "}
              {start} et {end}.
            </Text>
          </>
        )}
      </View>

      <TouchableOpacity
        style={globalStyles.primaryButton}
        activeOpacity={0.6}
        onPress={save}
        disabled={saving}
      >
        <Text style={globalStyles.primaryButtonText}>
          {saving ? "Enregistrement..." : "Enregistrer"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}