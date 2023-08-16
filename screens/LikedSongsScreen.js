import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useState, useEffect, useContext, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SongItem from "../components/SongItem";
import { Player } from "../PlayerContext";
import { BottomModal } from "react-native-modals";
import { ModalContent } from "react-native-modals";
import { Audio } from "expo-av";
import { debounce } from "lodash";

const LikedSongsScreen = () => {
  const colors = [
    "#27374D",
    "#1D267D",
    "#BE5A83",
    "#212A3E",
    "#917FB3",
    "#37306B",
    "#443C68",
    "#5B8FB9",
    "#144272",
  ];
  const navigation = useNavigation();
  const [backgroundColor, setBackgroundColor] = useState("#0A2647");
 const { currentTrack, setCurrentTrack } = useContext(Player);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchedTracks, setSearchedTracks] = useState([]);
  const [input, setInput] = useState("");
  const [savedTracks, setSavedTracks] = useState([]);
  const value = useRef(0);
  const [currentSound, setCurrentSound] = useState(null);
  const [progress, setProgress] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  async function getSavedTracks() {
    const accessToken = await AsyncStorage.getItem("token");
    const response = await fetch(
      "https://api.spotify.com/v1/me/tracks?offset=0&limit=50",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          limit: 50,
        },
      }
    );

    if (!response.ok) {
      throw new Error("failed to fetch the tracks");
    }
    const data = await response.json();
    setSavedTracks(data.items);
    //console.log(savedTracks)
    }
    useEffect(() => {
      getSavedTracks();
    }, []);
    //console.log(savedTracks)

    const playTrack = async () => {
      if (savedTracks.length > 0) {
        setCurrentTrack(savedTracks[0]);
      }
      await play(savedTracks[0]);
    };
    const play = async (nextTrack) => {
      //console.log(nextTrack)
      const preview_url = nextTrack?.track?.preview_url;
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: false,
        });
        const { sound, status } = await Audio.Sound.createAsync(
          {
            uri: preview_url,
          },
          {
            shouldPlay: true,
            isLooping: false,
          },
          onPlaybackStatusUpdate,
        )
        onPlaybackStatusUpdate(status);
        setCurrentSound(sound);
        await sound.playAsync();
      } catch (error) {
        console.log(error.message)
      }
    }

    const onPlaybackStatusUpdate = async(status) => {
      console.log(status)
      if (status.isLoaded && status.isPlaying) {
        const progress = status.positionMillis / status.durationMillis;
        console.log("progresss", progress);
        setProgress(progress);
        setCurrentTime(status.positionMillis);
        setTotalDuration(status.durationMillis);
      }
    }

  return (
    <>
       <LinearGradient colors={["#614385", "#516395"]} style={{ flex: 1 }}>
       <ScrollView style={{ flex: 1, marginTop: 30 }}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={{ marginHorizontal: 10 }}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Pressable
            style={{
              marginHorizontal: 10,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 9,
            }}>
               <Pressable
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                backgroundColor: "#42275a",
                padding: 9,
                flex: 1,
                borderRadius: 3,
                height: 38,
              }}
            >
              <AntDesign name="search1" size={20} color="white" />
              <TextInput
                value={input}
                onChangeText={(text) => handleInputChange(text)}
                placeholder="Find in Liked songs"
                placeholderTextColor={"white"}
                style={{ fontWeight: "500",color:"white" }}
              />
            </Pressable>
            <Pressable
              style={{
                marginHorizontal: 10,
                backgroundColor: "#42275a",
                padding: 10,
                borderRadius: 3,
                height: 38,
              }}
            >
              <Text style={{ color: "white" }}>Sort</Text>
            </Pressable>
            </Pressable>
            <View style={{ height: 30 }} />
            <View style={{ marginHorizontal: 10 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "white" }}>
                Liked Songs
              </Text>
              <Text style={{ color: "white", fontSize: 13, marginTop: 5 }}>
                430 songs
              </Text>
            </View>

            <Pressable
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginHorizontal: 10,
              }}
            >
              <Pressable
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor: "#1DB954",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <AntDesign name="arrowdown" size={20} color="white" />
            </Pressable>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <MaterialCommunityIcons
                name="cross-bolnisi"
                size={24}
                color="#1DB954"
              />
              <Pressable
                onPress={playTrack}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#1DB954",
                }}
              >
               <Entypo name="controller-play" size={24} color="white" />
              </Pressable>
            </View>
            </Pressable>

            <FlatList 
              showsVerticalScrollIndicator={false}
              data={savedTracks}
              renderItem={({ item, index }) => (
                <SongItem item={item} key={index} />
               )}
            />
       </ScrollView>
       </LinearGradient>
        {
          currentTrack && (
            <Pressable
          onPress={() => setModalVisible(!modalVisible)}
          style={{
            backgroundColor: "#5072A7",
            width: "90%",
            padding: 10,
            marginLeft: "auto",
            marginRight: "auto",
            marginBottom: 15,
            position: "absolute",
            borderRadius: 6,
            left: 5,
            bottom: 10,
            justifyContent: "space-between",
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Image
              style={{ width: 40, height: 40 }}
              source={{ uri: currentTrack?.track?.album?.images[0].url }}
            />
            <Text
              numberOfLines={1}
              style={{
                fontSize: 13,
                width: 220,
                color: "white",
                fontWeight: "bold",
              }}
            >
               {currentTrack?.track?.name} •{" "}
              {currentTrack?.track?.artists[0].name}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <AntDesign name="heart" size={24} color="#1DB954" />
            <Pressable>
              <AntDesign name="pausecircle" size={24} color="white" />
            </Pressable>
          </View>
        </Pressable>
          )
        }
        <BottomModal
        visible={modalVisible}
        onHardwareBackPress={() => setModalVisible(false)}
        swipeDirection={["up", "down"]}
        swipeThreshold={200}
        >
          <ModalContent
          style={{ height: "100%", width: "100%", backgroundColor: "#5072A7" }}
        >
          <View style={{ height: "100%", width: "100%", marginTop: 10 }}>
          <Pressable
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
               <AntDesign
                onPress={() => setModalVisible(!modalVisible)}
                name="down"
                size={24}
                color="white"
              />
               <Text
                style={{ fontSize: 14, fontWeight: "bold", color: "white" }}
              >
                 {currentTrack?.track?.name}
              </Text>
              <Entypo name="dots-three-vertical" size={24} color="white" />
            </Pressable>
            <View style={{ height: 10 }} />
            <View style={{ padding: 10 }}>
            <Image
                style={{ width: "100%", height: 290, borderRadius: 4 }}
                source={{ uri: currentTrack?.track?.album?.images[0].url }}
              />
              <View
                style={{
                  marginTop: 20,
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View>
                <Text
                    style={{ fontSize: 18, fontWeight: "bold", color: "white" }}
                  >
                    {currentTrack?.track?.name}
                  </Text>
                  <Text style={{ color: "#D3D3D3", marginTop: 4 }}>
                    {currentTrack?.track?.artists[0].name}
                  </Text>
                </View>
                <AntDesign name="heart" size={24} color="#1DB954" />
              </View>
              <View style={{marginTop:5}}>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 17,
                }}
              >
                <Pressable>
                  <FontAwesome name="arrows" size={30} color="#03C03C" />
                </Pressable>
                <Pressable>
                  <Ionicons name="play-skip-back" size={30} color="white" />
                </Pressable>
                <Pressable>
                <AntDesign name="pausecircle" size={60} color="white" />
                </Pressable>
                <Pressable>
                  <Ionicons name="play-skip-forward" size={30} color="white" />
                </Pressable>
                <Pressable>
                  <Feather name="repeat" size={30} color="#03C03C" />
                </Pressable>
              </View>
            </View>
          </View>
        </ModalContent>
        </BottomModal>
    </>
  )
}

export default LikedSongsScreen

const styles = StyleSheet.create({})