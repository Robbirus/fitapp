import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DashboardScreen from "../screens/DashboardScreen";
import AchievementsScreen from "../screens/AchievementsScreen";
import TrendsScreen from "../screens/TrendsScreen";

const Stack = createNativeStackNavigator();

export default function DashboardStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Tableau de bord" 
        component={DashboardScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Succès" 
        component={AchievementsScreen} 
        options={{ title: "Mes Succès" }} 
      />
      <Stack.Screen
        name="Tendances"
        component={TrendsScreen}
        options={{ title: "Tendances" }}
      />
    </Stack.Navigator>
  );
}