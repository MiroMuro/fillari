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
  //Coordinate data for drawing the route on the map.
  const [coordinatesPolyline, setCoordinatesPolyline] = useState([]);
  //The addressdata for mapview set initially to Haaga-Helia kampus
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
  //import function for calculating distances between two coordinates
  const haversine = require("haversine");
  //The task that receives location updates and data.
  const LOCATION_TRACKING = "location-tracking";
  const [speed, setSpeed] = useState("");
  const [tripName, setTripName] = useState("");
  const [travelTime, setTravelTime] = useState("");
  const [isStopwatchStart, setIsStopWatchStart] = useState(false);
  const [resetStopwatch, setResetStopwatch] = useState(false);
  //If this is true, location is tracking. If it's false the location is not tracking.
  const [locationStarted, setLocationStarted] = React.useState(false);
  var l1;
  var l2;

  const firebaseConfig = {
    apiKey: "AIzaSyB-1xoh26z88vqnIZI7I8GWWkZmYWelFKQ",
    authDomain: "fillarisovellus.firebaseapp.com",
    databaseURL:
      "https://fillarisovellus-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "fillarisovellus",
    storageBucket: "fillarisovellus.appspot.com",
    messagingSenderId: "1081489325532",
    appId: "1:1081489325532:web:c8d7ae766abf7a9f8e2319",
    measurementId: "G-RS3D7HGPMK",
  };

  // Initialize Firebase

  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  // Convert milliseconds into hours, minutes and seconds. Also calculates the average speed during the trip
  const MillisecondConverter = (millis) => {
    const hours = Math.floor(millis / 3600000);
    const minutes = Math.floor((millis % 3600000) / 60000);
    const seconds = Math.floor(((millis % 3600000) % 60000) / 1000);
    const timeInHours = parseFloat(hours + "." + minutes + seconds);
    setTravelTime(hours + " h " + minutes + " min " + seconds + " secs");
    setSpeed(
      ((travelledDistance / timeInHours) * 0.6 * 10).toFixed(2) + " km/h"
    );
  };

  //This button activates upon pressing  the "Save" button in the app.
  const saveTrip = () => {
    //Push the current trip into the firebase real-time-database.
    push(ref(database, "trips/"), {
      travelledDistance: travelledDistance.toFixed(2),
      travelTime: travelTime,
      speed: speed,
      route: coordinatesPolyline,
      name: tripName,
    });
  };

  //this function receives the elapsed in milliseconds from the Timer
  //and calls the Millisecondconverter function.
  const getMilliseconds = (time) => {
    if (isStopwatchStart) {
    } else {
      setTimeMilliseconds(time);
      MillisecondConverter(time);
    }
  };
  //If the user presses the cancel button after a trip, the trip wont save
  //and the polyline and stopwatch will be reset.
  const handleCancel = () => {
    setOpen(false);

    setCoordinatesPolyline([]);
    setResetStopwatch(true);
  };
  //If the user presses the save button after a trip, the trip will be saved
  //into the database and the polylines and timer will be reset.
  const handleSave = () => {
    saveTrip();
    setOpen(false);
    setCoordinatesPolyline([]);
    setResetStopwatch(true);
  };

  const startLocationTracking = async () => {
    //Reset the travelled distance upon a new trip.
    setTravelledDistance(0);
    //This saves location data into the LOCATION_TRACKING task that other components can access.
    await Location.startLocationUpdatesAsync(LOCATION_TRACKING, {
      accuracy: Location.Accuracy.Highest,
      timeInterval: 500,
      distanceInterval: 0,
    });
    //If location tracking is initialaizes succesfully this const will be set to true.
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(
      LOCATION_TRACKING
    );
    //Set the locationStarted to true.
    setLocationStarted(hasStarted);
    console.log("tracking started?", hasStarted);
  };

  React.useEffect(() => {
    //Upon opening the app for the first time, access to background and foreground location are asked.
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
    //Starts location tracking and the stopwatch timer.
    startLocationTracking();
    setIsStopWatchStart(!isStopwatchStart);
    setResetStopwatch(false);
  };
  const stopLocation = () => {
    console.log("****************TRACKING STOPPED****************");
    //Opens up a dialog for the user that shows stats about the trip and gives
    //the possibility to save it.
    setOpen(true);
    setLocationStarted(false);
    setIsStopWatchStart(false);
    //Stops location tracking.
    TaskManager.isTaskRegisteredAsync(LOCATION_TRACKING).then((tracking) => {
      if (tracking) {
        Location.stopLocationUpdatesAsync(LOCATION_TRACKING);
      }
    });
    //Calculates the distance for the trip, looping through all of the coordinates gathered during the trip.
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
    //sets the calcutad distance.
    setTravelledDistance(distance);
  };

  TaskManager.defineTask(LOCATION_TRACKING, async ({ data, error }) => {
    if (error) {
      console.log("LOCATION_TRACKING task ERROR:", error);
      return;
    }
    if (data) {
      //Gathers location data from the LOCATION_TRACKING task and updates the mapview
      //and the route data array for the polyline.
      const { locations } = data;
      let latitude = locations[0].coords.latitude;
      let longitude = locations[0].coords.longitude;

      setCoordinatesPolyline((current) => [
        ...current,
        { latitude, longitude },
      ]);

      setAddressData({ latitude: latitude, longitude: longitude });
      console.log(`${new Date(Date.now())}: ${latitude},${longitude}`);
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
        {/*The polyline draws a line on the map based on the coordinates given to it in an array. */}
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
      {/*If the locationStarted equals true, the location is being tracked and the UI will show a stop button with the text stop tracking. */}
      <View style={styles.viewWithOpacity}>
        {locationStarted ? (
          <View>
            <TouchableOpacity style={styles.stopOpacity} onPress={stopLocation}>
              <Text style={styles.btnTextStart}>Stop Tracking</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.startOpacity} onPress={startLocation}>
            {/*Here if locationStarted equals false the location is not being tracked and the UI will show a start button with the text start tracking. */}
            <Text style={styles.btnTextStart}>Start Tracking</Text>
          </TouchableOpacity>
        )}
      </View>
      {/*This Dialog will pop up upon pressing the stop tracking button on the UI. 
      It shows the users info about the trip
      The user can either save the trip
      by giving it a name
      or just pressing cancel which closes the Dialog. */}
      <Dialog.Container visible={open}>
        <Dialog.Title>Trip complete</Dialog.Title>
        <TextInput
          placeholder="Trip name"
          style={styles.textinput}
          onChangeText={(text) => setTripName(text)}
        ></TextInput>
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
  post: { marginBottom: 200 },
  textinput: {
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 12,
    fontSize: 18,
    width: 200,
    borderColor: "gray",
    borderWidth: 1,
  },
});
