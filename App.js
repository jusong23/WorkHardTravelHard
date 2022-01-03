import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TouchableHighlight,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "./colors";
import { Fontisto, Ionicons } from "@expo/vector-icons";

const STORAGE_KEY = "@toDos";
const STORAGE_WORKING = "@working";
export default function App() {
  useEffect(() => {
    loadToDos(), loadWorking();
  }, []);
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});

  // STORAGE 에서 가져올게 있으면 loadToDos 부터 실행 ! 없으면 그냥 스킵됨
  const travel = () => setWorking(false);
  // travel 이 실행되면 working 에는 false 가 들어감
  const work = () => setWorking(true);
  // travel 이 실행되면 working 에는 true 가 들어감
  const onChangeText = payload => setText(payload);
  // 뭔가 입력하면 setText 실행하도록 (text에 무언가를 집어넣도록, 그 무언 배열의 이름은 payload)

  const saveToDos = async toSave => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };
  const saveWorking = async toSave => {
    await AsyncStorage.setItem(STORAGE_WORKING, JSON.stringify(toSave));
  };

  const loadToDos = async () => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEY);
      setToDos(JSON.parse(s));
    } catch (error) {
      Alert.alert("Can't find you.", "So sad");
    }
  };
  const loadWorking = async toSave => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_WORKING);
      setWorking(JSON.parse(s));
    } catch (error) {
      Alert.alert("Can't find you.", "So sad");
    }
  };

  const addToDo = async () => {
    if (text === "") {
      return;
    }
    // save to do
    const newToDos = { ...toDos, [Date.now()]: { text, working } };
    // Object.assign({}, toDos, {
    //   [Date.now()]: { text, work: working },
    // });
    setToDos(newToDos);
    await saveToDos(newToDos);
    await saveWorking(working);
    setText("");
    // newToDos를 toDos 에 집어넣는 행위
    // setState 를 활용하는 방법
  };
  const deleteToDo = async key => {
    Alert.alert("Delete To Do", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "I`m sure",
        onPress: () => {
          const newToDos = { ...toDos };
          delete newToDos[key];
          setToDos(newToDos);
          saveToDos(newToDos);
          saveWorking(working);
        },
      },
    ]);
  };
  const checkTheBox = async key => {
    Alert.alert("Finish the schedule", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "I`m sure",
        onPress: () => {
          const newToDos = {
            ...toDos,
            [key]: { text: toDos[key].text, working, done: true },
          };
          setToDos(newToDos);
          saveToDos(newToDos);
          saveWorking(working);
        },
      },
    ]);
  };
  console.log(toDos);
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableHighlight onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableHighlight>
      </View>
      <View>
        <TextInput
          returnKeyType="done"
          onSubmitEditing={addToDo}
          // done 이 됨을 감지
          onChangeText={onChangeText}
          // text가 어떻게 변했는지를 감지
          value={text}
          placeholder={working ? "Add a To Do" : "Where do you want to go?"}
          style={styles.input}
        />

        {toDos ? (
          <ScrollView>
            {Object.keys(toDos).map(key =>
              // toDos의 key 들을 배열화 시키는 method [첫번째 toDos의 key(msc), ... ]
              toDos[key].working === working ? (
                <View style={styles.toDo} key={key}>
                  <Text style={styles.toDoText}>{toDos[key].text}</Text>
                  <View style={styles.icons}>
                    <TouchableOpacity
                      style={styles.icons}
                      onPress={() => checkTheBox(key)}
                    >
                      <Ionicons
                        style={styles.checkBoxIcon}
                        name="ios-checkbox-sharp"
                        size={19}
                        color="white"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteToDo(key)}>
                      <Fontisto name="trash" size={18} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null
            )}
            {Object.keys(toDos).map(key =>
              toDos[key].done === true ? (
                <View>
                  <Text style={styles.toDoText}></Text>
                </View>
              ) : (
                <View>
                  <Text></Text>
                </View>
              )
            )}
          </ScrollView>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
    color: "white",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.grey,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  icons: {
    flexDirection: "row",
  },
  checkBoxIcon: {
    marginRight: 5,
  },
});
