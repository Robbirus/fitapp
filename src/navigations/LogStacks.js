import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LogScreen from "../screens/LogScreen";
import ScannerScreen from "../screens/ScannerScreen";

const Stack = createNativeStackNavigator();

export default function JournalStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Accueil" component={LogScreen} />
      <Stack.Screen name="Scanner" component={ScannerScreen} />
    </Stack.Navigator>
  );
}
