import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import Stats from "./Statistics";
import IndividualRoute from "./IndividualRoute";
import Map from "./Map";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
// react-native-vector-icons/Ionicons otherwise.
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="NavStack"
          options={{ headerShown: false }}
          component={Navstack}
        ></Stack.Screen>
        <Stack.Screen name="IndividualRoute" component={IndividualRoute} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
export const Navstack = ({ navigation, route }) => {
  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen name="Map" component={Map}></Tab.Screen>
      <Tab.Screen
        name="Statistics"
        component={Stats}
        options={{ unmountOnBlur: true }}
      ></Tab.Screen>
    </Tab.Navigator>
  );
};
const screenOptions = ({ route }) => ({
  tabBarIcon: ({ focused, color, size }) => {
    let iconName;
    if (route.name === "Map") {
      iconName = "map-outline";
    } else if (route.name === "Statistics") {
      iconName = "stats-chart-outline";
    }
    return <Ionicons name={iconName} size={size} color={color} />;
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
