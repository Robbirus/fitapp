import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MeasurementScreen from "../screens/MeasurementScreen";
import WHRScreen from "../screens/WHRScreen";
import BodyFatScreen from "../screens/BodyFatScreen";

const Stack = createNativeStackNavigator();

export default function BodyCompositionStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Mesure" component={MeasurementScreen} />
      <Stack.Screen name="Ratio Taille" component={WHRScreen} />
      <Stack.Screen name="Composition Corporelle" component={BodyFatScreen} />
    </Stack.Navigator>
  );
}
