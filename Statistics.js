import { View, Text, StyleSheet } from "react-native";
export default function Statistics({ navigation, route }) {
  return (
    <View style={styles.container}>
      <Text>This is the statistics page</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
