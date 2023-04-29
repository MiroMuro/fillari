import { StatusBar } from "expo-status-bar";

import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { initializeApp } from "firebase/app";
import { getDatabase, push, ref, onValue } from "firebase/database";
import * as TaskManager from "expo-task-manager";
import Dialog from "react-native-dialog";

import { Stopwatch } from "react-native-stopwatch-timer";
export default function Map({ navigation, route }) {
  const [timeMilliseconds, setTimeMilliseconds] = useState(0);
  const [coordinatesPolyline, setCoordinatesPolyline] = useState([]);
  const [addressData, setAddressData] = useState({
    latitude: 60.200692,
    longitude: 24.934302,
    latitudeDelta: 0.0322,
    longitudeDelta: 0.0221,
  });
  let distance = 0;
  const [travelledDistance, setTravelledDistance] = useState(0);
  //Boolean value for opening and closing dialog.
  const [open, setOpen] = useState(false);
  const haversine = require("haversine");
  //The task that receives location updates
  const LOCATION_TRACKING = "location-tracking";
  const [speed, setSpeed] = useState("");
  const [travelTime, setTravelTime] = useState("");
  const [isStopwatchStart, setIsStopWatchStart] = useState(false);
  const [resetStopwatch, setResetStopwatch] = useState(false);
  const [locationStarted, setLocationStarted] = React.useState(false);
  var l1;
  var l2;

  const MillisecondConverter = (millis) => {
    const hours = Math.floor(millis / 3600000);
    const minutes = Math.floor((millis % 3600000) / 60000);
    const seconds = Math.floor(((millis % 3600000) % 60000) / 1000);
    const timeInHours = parseFloat(hours + "." + minutes + seconds);
    setTravelTime(hours + " h " + minutes + " min " + seconds + " secs");
    console.log(
      hours + " tunnit " + minutes + " minuutit " + seconds + " sekunnit "
    );
    setSpeed((travelledDistance / timeInHours).toFixed(2) + " km/h");
    //console.log("timeInHours= " + (travelledDistance / timeInHours).toFixed(2));
  };

  const getMilliseconds = (time) => {
    if (isStopwatchStart) {
    } else {
      setTimeMilliseconds(time);
      MillisecondConverter(time);
    }
  };
  const handleCancel = () => {
    setOpen(false);
    console.log(travelledDistance.toFixed(2) + " km");
    setCoordinatesPolyline([]);
    setResetStopwatch(true);
  };
  const handleSave = () => {
    setOpen(false);
    setCoordinatesPolyline([]);
    setResetStopwatch(true);
  };

  const startLocationTracking = async () => {
    setTravelledDistance(0);
    await Location.startLocationUpdatesAsync(LOCATION_TRACKING, {
      accuracy: Location.Accuracy.Highest,
      timeInterval: 5000,
      distanceInterval: 0,
    });

    const hasStarted = await Location.hasStartedLocationUpdatesAsync(
      LOCATION_TRACKING
    );
    setLocationStarted(hasStarted);
    console.log("tracking started?", hasStarted);
  };

  React.useEffect(() => {
    const config = async () => {
      let resf = await Location.requestForegroundPermissionsAsync();
      let resb = await Location.requestBackgroundPermissionsAsync();
      if (resf.status != "granted" && resb.status !== "granted") {
        console.log("Permission to access location was denied");
      } else {
        console.log("Permission to access location granted");
      }
    };
    config();
  }, []);

  const startLocation = () => {
    startLocationTracking();
    setIsStopWatchStart(!isStopwatchStart);
    setResetStopwatch(false);
  };
  const stopLocation = () => {
    console.log("****************TRACKING STOPPED****************");
    setOpen(true);
    setLocationStarted(false);
    setIsStopWatchStart(false);
    TaskManager.isTaskRegisteredAsync(LOCATION_TRACKING).then((tracking) => {
      if (tracking) {
        Location.stopLocationUpdatesAsync(LOCATION_TRACKING);
      }
    });

    for (i = 0; i < coordinatesPolyline.length - 1; i++) {
      const start = {
        latitude: coordinatesPolyline[i].latitude,
        longitude: coordinatesPolyline[i].longitude,
      };

      const end = {
        latitude: coordinatesPolyline[i + 1].latitude,
        longitude: coordinatesPolyline[i + 1].longitude,
      };
      console.log(haversine(start, end, { unit: "meter" }) + " Meters");
      distance = distance + haversine(start, end);
    }
    console.log(distance.toFixed(2) + " kilometers");
    setTravelledDistance(distance);
  };

  TaskManager.defineTask(LOCATION_TRACKING, async ({ data, error }) => {
    if (error) {
      console.log("LOCATION_TRACKING task ERROR:", error);
      return;
    }
    if (data) {
      const { locations } = data;
      let latitude = locations[0].coords.latitude;
      let longitude = locations[0].coords.longitude;

      setCoordinatesPolyline((current) => [
        ...current,
        { latitude, longitude },
      ]);

      setAddressData({ latitude: latitude, longitude: longitude });
      console.log(
        `${new Date(Date.now()).toLocaleDateString}: ${latitude},${longitude}`
      );
      console.log(timeMilliseconds);
    }
  });
  return (
    <View style={styles.container}>
      <MapView
        style={{ width: "100%", height: "100%" }}
        region={{
          latitude: addressData.latitude,
          longitude: addressData.longitude,
          latitudeDelta: 0.0322,
          longitudeDelta: 0.0221,
        }}
      >
        <Marker
          coordinate={{
            latitude: addressData.latitude,
            longitude: addressData.longitude,
          }}
        ></Marker>
        <Polyline coordinates={coordinatesPolyline} />
      </MapView>
      <View style={styles.viewWithStopwatch}>
        <Stopwatch
          msecs
          start={isStopwatchStart}
          reset={resetStopwatch}
          getMsecs={(time) => {
            getMilliseconds(time);
          }}
        ></Stopwatch>
      </View>
      <View style={styles.viewWithOpacity}>
        {locationStarted ? (
          <View>
            <TouchableOpacity style={styles.stopOpacity} onPress={stopLocation}>
              <Text style={styles.btnTextStart}>Stop Tracking</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.startOpacity} onPress={startLocation}>
            <Text style={styles.btnTextStart}>Start Tracking</Text>
          </TouchableOpacity>
        )}
      </View>
      <Dialog.Container visible={open}>
        <Dialog.Title>Trip complete</Dialog.Title>
        <Dialog.Description>Do you want to save this trip?</Dialog.Description>
        <Dialog.Description>
          Matka kilometreinä: {travelledDistance.toFixed(2)}
        </Dialog.Description>
        <Dialog.Description>Matkan kesto: {travelTime}</Dialog.Description>
        <Dialog.Description>
          Matkasi keskivertonopeus: {speed}
        </Dialog.Description>
        <Dialog.Button label="Cancel" onPress={handleCancel} />
        <Dialog.Button label="Save" onPress={handleSave} />
      </Dialog.Container>
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
  // key: 7LvZgZq0HUMQRpG2Hgy1Sqey3urgAVrh
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "black",
    marginBottom: 1,
  },
  btnTextStart: {
    fontSize: 20,
    color: "black",
    textAlign: "center",
  },
  viewWithOpacity: {
    position: "absolute",
    top: "93%",
  },
  startOpacity: {
    backgroundColor: "green",
    height: 45,
    width: 150,
    alignContent: "center",
    justifyContent: "center",
    borderRadius: 6,
  },
  stopOpacity: {
    backgroundColor: "red",
    height: 45,
    width: 150,
    alignContent: "center",
    justifyContent: "center",
    borderRadius: 6,
  },
  viewWithStopwatch: {
    position: "absolute",
    top: "4%",
  },
});
const options = {
  container: {
    backgroundColor: "#FF0000",
  },
};
