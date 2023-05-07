import { View, Text, StyleSheet } from "react-native";
import React, { useState } from "react";
import MapView, { Callout, Marker, Polyline } from "react-native-maps";
export default function IndividualRoute({ navigation, route }) {
  const [routeCoordinates, setRouteCoordinates] = useState(
    route.params.item.item.route
  );
  console.log(routeCoordinates);
  return (
    <View style={styles.container}>
      <MapView
        style={{ width: "100%", height: "100%" }}
        region={{
          latitude: routeCoordinates[0].latitude,
          longitude: routeCoordinates[0].longitude,
          latitudeDelta: 0.0322,
          longitudeDelta: 0.0221,
        }}
      >
        {/*The marker for the beginning of the trip */}
        <Marker
          coordinate={{
            latitude: routeCoordinates[0].latitude,
            longitude: routeCoordinates[0].longitude,
          }}
        ></Marker>
        {/*The marker for the end of the trip. */}
        <Marker
          coordinate={{
            latitude: routeCoordinates[routeCoordinates.length - 1].latitude,
            longitude: routeCoordinates[routeCoordinates.length - 1].longitude,
          }}
          icon={require("./checkered-flag(1).png")}
        ></Marker>
        {/*The polyline draws a line on the map based on the coordinates given to it in an array. */}
        <Polyline coordinates={routeCoordinates}></Polyline>
      </MapView>
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
