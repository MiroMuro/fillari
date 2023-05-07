import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Button,
  TouchableOpacity,
} from "react-native";
import { Avatar, Card } from "react-native-paper";
import { initializeApp } from "firebase/app";
import { getDatabase, push, ref, onValue, remove } from "firebase/database";
import React, { useState, useEffect } from "react";
import individualRoute from "./IndividualRoute";
export default function Statistics({ navigation, route }) {
  var ar = [];
  const [trips, setTrips] = useState([]);
  const [refreshFlatlist, setRefreshFlatList] = useState(false);
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
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);

  useEffect(() => {
    const tripsRef = ref(database, "trips/");
    onValue(tripsRef, (snapshot) => {
      const data = snapshot.val();
      ar.length = 0;
      snapshot.forEach(function (child_element) {
        ar.push({
          id: child_element.key,
          speed: child_element.val().speed,
          travelledDistance: child_element.val().travelledDistance,
          travelTime: child_element.val().travelTime,
          route: child_element.val().route,
          name: child_element.val().name,
        });

        console.log(child_element.key);
      });
      setTrips(ar);
      console.log(ar);
    });
  }, []);

  const deleteTrip = (id) => {
    remove(ref(database, "trips/" + id));
    setRefreshFlatList(!refreshFlatlist);
    console.log("Trip deleted");
    console.log(trips);
  };

  const listSeparator = () => {
    return (
      <View
        style={{
          height: 10,
          width: "100%",
          backgroundColor: "white",
        }}
      ></View>
    );
  };
  return (
    <View style={styles.container}>
      <FlatList
        style={styles.flatlist}
        renderItem={({ item }) => (
          <Card style={styles.cards} mode="outlined">
            <Card.Title title={item.name} titleVariant="titleLarge" />

            <Card.Content>
              <Text>Nopeus {item.speed}</Text>
              <Text>Matka {item.travelledDistance} km</Text>
              <Text>Matkan kesto {item.travelTime}</Text>
              <View style={styles.buttonView}>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteTrip(item.id)}
                >
                  <Text style={styles.text}>delete</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.showRouteButton}
                  title="test"
                  onPress={() => {
                    navigation.navigate("IndividualRoute", {
                      item: { item },
                    });
                  }}
                >
                  <Text style={styles.text}>Show route</Text>
                </TouchableOpacity>
              </View>
            </Card.Content>
          </Card>
        )}
        data={trips}
        extraData={refreshFlatlist}
        ItemSeparatorComponent={listSeparator}
      ></FlatList>
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
  cards: {
    width: "100%",
    mode: "outlined",
  },
  flatlist: {
    width: "98%",
  },
  deleteButton: {
    backgroundColor: "red",
    height: 45,
    width: 45,
    justifyContent: "center",
    borderRadius: 10,
    marginTop: 10,
    marginLeft: 0,
    marginBottom: 15,
  },
  showRouteButton: {
    backgroundColor: "white",
    height: 45,
    width: 45,
    justifyContent: "center",
    borderRadius: 10,
    borderColor: "black",
    borderWidth: 2,
    marginLeft: 0,
    marginTop: 10,
    marginBottom: 15,
  },
  buttonView: {
    flex: 1,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },
  text: {
    textAlign: "center",
  },
});
