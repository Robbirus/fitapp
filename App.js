import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DatabaseProvider } from "./src/db/DatabaseContext";
import LogStack from "./src/navigations/LogStacks";
import ActivityScreen from "./src/screens/ActivityScreen";
import DashboardStack from "./src/navigations/DashboardStacks";
import ProfileStacks from "./src/navigations/ProfileStacks";
import { Text } from "react-native";
import {AchievementProvider} from "./src/contexts/AchievementContext"

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <DatabaseProvider>
      <AchievementProvider>
        <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen 
            name="Dashboard"
            component={DashboardStack}
            options={{
              headerShown: false, // Hides the duplicate header from the Tab Navigator
              tabBarIcon: () => <Text style={{fontSize:20}}>🏠</Text>
            }} 
          />

          <Tab.Screen 
            name="Journal" 
            component={LogStack} 
            options={{
              tabBarIcon: () => <Text style={{fontSize:20}}>📔</Text>
            }} 
          />

          <Tab.Screen 
            name="Activité" 
            component={ActivityScreen}
            options={{
              tabBarIcon: () => <Text style={{fontSize:20}}>🏋️</Text>
            }}  
          />

          <Tab.Screen 
            name="Profile" 
            component={ProfileStacks}
            options={{
              tabBarIcon: () => <Text style={{fontSize:20}}>👤</Text>
            }}   
          />
        </Tab.Navigator>
      </NavigationContainer>
      </AchievementProvider>
      
    </DatabaseProvider>
  );
}