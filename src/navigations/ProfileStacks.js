import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "../screens/ProfileScreen";
import PersonalInfoScreen from "../screens/PersonalInfoScreen";
import GoalsScreen from "../screens/GoalScreen";
import DietStyleScreen from "../screens/DietStyleScreen";
import MealTimesScreen from "../screens/MealTimeScreen";
import WeightScreen from "../screens/WeightScreen";
import BMIScreen from "../screens/BMIScreen";
import MeasurementScreen from "../screens/MeasurementScreen";
import WHRScreen from "../screens/WHRScreen";
import BodyFatScreen from "../screens/BodyFatScreen";
import AchievementsScreen from "../screens/AchievementsScreen";
import RemindersScreen from "../screens/RemindersScreen";

const Stack = createNativeStackNavigator();

export default function ProfileStacks() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Votre Profile" component={ProfileScreen} options={{ title: "Profil" }} />
      <Stack.Screen name="Informations personnelles" component={PersonalInfoScreen} />
      <Stack.Screen name="Objectifs & Activité" component={GoalsScreen} />
      <Stack.Screen name="Style de régime" component={DietStyleScreen} />
      <Stack.Screen name="Horaires & Hydratation" component={MealTimesScreen} />
      <Stack.Screen name="Poids" component={WeightScreen} />
      <Stack.Screen name="IMC" component={BMIScreen} />
      <Stack.Screen name="Mesures" component={MeasurementScreen} />
      <Stack.Screen name="Ratio Taille" component={WHRScreen} />
      <Stack.Screen name="Composition Corporelle" component={BodyFatScreen} />
      <Stack.Screen
        name="Succès"
        component={AchievementsScreen}
        options={{ title: "Mes Succès" }}
      />
      <Stack.Screen
        name="Rappels"
        component={RemindersScreen}
        options={{ title: "Rappels d'eau" }}
      />
    </Stack.Navigator>
  );
}