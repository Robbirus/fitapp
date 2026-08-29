import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LogScreen from "../screens/LogScreen";
import ScannerScreen from "../screens/ScannerScreen";
import RecipesScreen from "../screens/RecipeScreen";
import RecipeBuilderScreen from "../screens/RecipeBuilderScreen";
import RecipeLogScreen from "../screens/RecipeLogScreen";

const Stack = createNativeStackNavigator();

export default function JournalStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Accueil" component={LogScreen} />
      <Stack.Screen name="Scanner" component={ScannerScreen} />
      <Stack.Screen
        name="Recipes"
        component={RecipesScreen}
        options={{ title: "Mes recettes" }}
      />
      <Stack.Screen
        name="RecipeBuilder"
        component={RecipeBuilderScreen}
        options={{ title: "Recette" }}
      />
      <Stack.Screen
        name="RecipeLog"
        component={RecipeLogScreen}
        options={{ title: "Ajouter la recette" }}
      />
    </Stack.Navigator>
  );
}
