import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DatabaseProvider } from "./src/db/DatabaseContext";
import LogStack from "./src/navigations/LogStacks";
import ActivityScreen from "./src/screens/ActivityScreen";
import ScannerScreen from "./src/screens/ScannerScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import ProfileStacks from "./src/navigations/ProfileStacks";
import { Text } from "react-native";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <DatabaseProvider>
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen 
          name="Dashboard"
          component={DashboardScreen}
          options={{
            tabBarIcon: () => <Text style={{fontSize:20}}>🏠</Text>
          }} />

          <Tab.Screen 
          name="Journal" 
          component={LogStack} 
          options={{
            tabBarIcon: () => <Text style={{fontSize:20}}>📔</Text>
          }} />

          <Tab.Screen 
          name="Activité" 
          component={ActivityScreen}
          options={{
            tabBarIcon: () => <Text style={{fontSize:20}}>🏋️</Text>
          }}  />

          <Tab.Screen 
          name="Profile" 
          component={ProfileStacks}
          options={{
            tabBarIcon: () => <Text style={{fontSize:20}}>👤</Text>
          }}   />
        </Tab.Navigator>
      </NavigationContainer>
    </DatabaseProvider>
  );
}
