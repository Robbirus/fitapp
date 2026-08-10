import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "../screens/ProfileScreen";
import WeightScreen from "../screens/WeightScreen";
import BMIScreen from "../screens/BMIScreen";
import MeasurementScreen from "../screens/MeasurementScreen";
import WHRScreen from "../screens/WHRScreen";
import BodyFatScreen from "../screens/BodyFatScreen";

const Stack = createNativeStackNavigator();

export default function ProfileStacks() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Profil" component={ProfileScreen} />
      <Stack.Screen name="Poids" component={WeightScreen} />
      <Stack.Screen name="BMI" component={BMIScreen} />
      <Stack.Screen name="Mesures" component={MeasurementScreen} />
      <Stack.Screen name="RTH" component={WHRScreen} />
      <Stack.Screen name="Graisse Corporelle" component={BodyFatScreen} />
    </Stack.Navigator>
  );
}
