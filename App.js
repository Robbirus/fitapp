import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DatabaseProvider } from "./src/db/DatabaseContext";
import LogStack from "./src/navigations/LogStacks";
import ActivityScreen from "./src/screens/ActivityScreen";
import ScannerScreen from "./src/screens/ScannerScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import ProfileStacks from "./src/navigations/ProfileStacks";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <DatabaseProvider>
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen name="Dashboard" component={DashboardScreen} />
          <Tab.Screen name="Journal" component={LogStack} />
          <Tab.Screen name="Activité" component={ActivityScreen} />
          <Tab.Screen name="Profile" component={ProfileStacks} />
        </Tab.Navigator>
      </NavigationContainer>
    </DatabaseProvider>
  );
}
