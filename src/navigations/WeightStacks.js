import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WeightScreen from "../screens/WeightScreen";
import BMIScreen from "../screens/BMIScreen";

const Stack = createNativeStackNavigator();

export default function WeightStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Masse" component={WeightScreen} />
      <Stack.Screen name="BMI" component={BMIScreen} />
    </Stack.Navigator>
  );
}
