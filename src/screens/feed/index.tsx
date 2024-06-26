import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState, useRef } from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View, Dimensions, Pressable, Alert } from 'react-native';
import { Image } from "expo-image";
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Modalize } from 'react-native-modalize';
import * as ImagePicker from 'expo-image-picker';
import { signOut } from 'firebase/auth';
import { auth } from '../../../config/firebase'; // Certifique-se de importar corretamente

export default function Feed() {
    const navigation = useNavigation();
    const [firstName, setFirstName] = useState('');
    const [profileImage, setProfileImage] = useState("https://www.pngkey.com/png/full/114-1149878_setting-user-avatar-in-specific-size-without-breaking.png");
    const modalizeRef = useRef<Modalize>(null);

    useEffect(() => {
        const getUserName = async () => {
            const name = await AsyncStorage.getItem('userName');
            if (name) {
                const firstName = name.split(' ')[0]; // Obter o primeiro nome
                setFirstName(firstName);
            }
            const image = await AsyncStorage.getItem('profileImage');
            if (image) {
                setProfileImage(image);
            }
        };
        getUserName();
    }, []);

    const openModal = () => {
        modalizeRef.current?.open();
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
            await AsyncStorage.setItem('profileImage', result.assets[0].uri);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            navigation.navigate("Home");
        } catch (error) {
            console.error("Erro ao sair da conta:", error);
        }
    };

    const changePassword = () => {
        Alert.alert('Alterar senha', 'Funcionalidade de alteração de senha ainda não implementada.');
    };

    return (
        <>
            <View style={{
                flex: 1,
                paddingHorizontal: 20,
                paddingVertical: 80,
            }}>
                <View
                    style={{
                        paddingBottom: 20,
                        paddingHorizontal: 20,
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <View>
                        <Text
                            style={{
                                fontSize: 28,
                                color: "#000",
                            }}
                        >
                            Olá{" "}
                            <Text style={{ fontWeight: "bold" }}>
                                {firstName} 👋
                            </Text>
                        </Text>
                        <Text
                            style={{
                                fontSize: 15,
                                color: "#555",
                            }}
                        >
                            Este é o painel lsb
                        </Text>
                    </View>
                    <Pressable onPress={openModal}>
                        <Image
                            style={{
                                height: 40,
                                width: 40,
                                borderRadius: 40,
                            }}
                            source={{ uri: profileImage }}
                        />
                    </Pressable>
                </View>
                <View
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: 20,
                    }}
                >
                    <TouchableOpacity
                        onPress={() => navigation.navigate("clientes")}

                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                            borderRadius: 10,
                            backgroundColor: "#BDBCBB",
                        }}
                    >
                        <View
                            style={{
                                paddingVertical: 20,
                                paddingRight: 20,
                                marginLeft: 20,
                                display: "flex",
                                width: Dimensions.get("window").width - 60,
                                justifyContent: "space-between",
                                alignItems: "center",
                                flexDirection: "row",
                            }}
                        >
                            <View
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                }}
                            >
                                <MaterialCommunityIcons
                                    name="clipboard-account-outline"
                                    size={24}
                                    color="#40FF01"
                                />
                                <Text
                                    style={{
                                        marginLeft: 10,
                                        fontSize: 16,
                                        color: "#000",
                                    }}
                                >
                                    Clientes
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={14} color="#000" />
                        </View>
                    </TouchableOpacity>
                </View>
                <View
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: 20,
                    }}
                >
                    <TouchableOpacity
                        onPress={() => navigation.navigate("servicos")}

                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                            borderRadius: 10,
                            backgroundColor: "#BDBCBB",
                        }}
                    >
                        <View
                            style={{
                                paddingVertical: 20,
                                paddingRight: 20,
                                marginLeft: 20,
                                display: "flex",
                                width: Dimensions.get("window").width - 60,
                                justifyContent: "space-between",
                                alignItems: "center",
                                flexDirection: "row",
                            }}
                        >
                            <View
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                }}
                            >
                                <MaterialCommunityIcons
                                    name="clipboard-account-outline"
                                    size={24}
                                    color="#40FF01"
                                />
                                <Text
                                    style={{
                                        marginLeft: 10,
                                        fontSize: 16,
                                        color: "#000",
                                    }}
                                >
                                    Serviços
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={14} color="#000" />
                        </View>
                    </TouchableOpacity>
                </View>
                <View
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: 20,
                    }}
                >
                    <TouchableOpacity

                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                            borderRadius: 10,
                            backgroundColor: "#BDBCBB",
                        }}
                        onPress={() => navigation.navigate("Calendario")}
                    >
                        <View
                            style={{
                                paddingVertical: 20,
                                paddingRight: 20,
                                marginLeft: 20,
                                display: "flex",
                                width: Dimensions.get("window").width - 60,
                                justifyContent: "space-between",
                                alignItems: "center",
                                flexDirection: "row",
                            }}
                        >
                            <View
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                }}
                            >
                                <MaterialCommunityIcons
                                    name="calendar"
                                    size={24}
                                    color="#40FF01"
                                />
                                <Text
                                    style={{
                                        marginLeft: 10,
                                        fontSize: 16,
                                        color: "#000",
                                    }}
                                >
                                    Calendario
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={14} color="#000" />
                        </View>
                    </TouchableOpacity>
                </View>
                <View
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: 20,
                    }}
                >
                    <TouchableOpacity

                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                            borderRadius: 10,
                            backgroundColor: "#BDBCBB",
                        }}
                        onPress={() => navigation.navigate("Avisos")}
                    >
                        <View
                            style={{
                                paddingVertical: 20,
                                paddingRight: 20,
                                marginLeft: 20,
                                display: "flex",
                                width: Dimensions.get("window").width - 60,
                                justifyContent: "space-between",
                                alignItems: "center",
                                flexDirection: "row",
                            }}
                        >
                            <View
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                }}
                            >
                                <MaterialCommunityIcons
                                    name="alert"
                                    size={24}
                                    color="#40FF01"
                                />
                                <Text
                                    style={{
                                        marginLeft: 10,
                                        fontSize: 16,
                                        color: "#000",
                                    }}
                                >
                                    Avisos
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={14} color="#000" />
                        </View>
                    </TouchableOpacity>
                </View>
                <View
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: 20,
                    }}
                >
                    <TouchableOpacity

                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                            borderRadius: 10,
                            backgroundColor: "#BDBCBB",
                        }}
                        onPress={() => navigation.navigate("DemandasFeed")}
                    >
                        <View
                            style={{
                                paddingVertical: 20,
                                paddingRight: 20,
                                marginLeft: 20,
                                display: "flex",
                                width: Dimensions.get("window").width - 60,
                                justifyContent: "space-between",
                                alignItems: "center",
                                flexDirection: "row",
                            }}
                        >
                            <View
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                }}
                            >
                                <MaterialCommunityIcons
                                    name="checkbook"
                                    size={24}
                                    color="#40FF01"
                                />
                                <Text
                                    style={{
                                        marginLeft: 10,
                                        fontSize: 16,
                                        color: "#000",
                                    }}
                                >
                                    Demandas
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={14} color="#000" />
                        </View>
                    </TouchableOpacity>
                </View>
                <View
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: 20,
                    }}
                >
                    <TouchableOpacity

                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                            borderRadius: 10,
                            backgroundColor: "#BDBCBB",
                        }}
                        onPress={() => navigation.navigate("Ponto")}
                    >
                        <View
                            style={{
                                paddingVertical: 20,
                                paddingRight: 20,
                                marginLeft: 20,
                                display: "flex",
                                width: Dimensions.get("window").width - 60,
                                justifyContent: "space-between",
                                alignItems: "center",
                                flexDirection: "row",
                            }}
                        >
                            <View
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                }}
                            >
                                <MaterialCommunityIcons
                                    name="map-marker-radius-outline"
                                    size={24}
                                    color="#40FF01"
                                />
                                <Text
                                    style={{
                                        marginLeft: 10,
                                        fontSize: 16,
                                        color: "#000",
                                    }}
                                >
                                    Ponto
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={14} color="#000" />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <Modalize ref={modalizeRef} adjustToContentHeight>
                <View style={{ padding: 20 }}>
                    <TouchableOpacity onPress={pickImage} style={{ backgroundColor: '#40FF01', padding: 15, borderRadius: 10, marginBottom: 10 }}>
                        <Text style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>Adicionar Foto de Perfil</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={changePassword} style={{ backgroundColor: '#40FF01', padding: 15, borderRadius: 10, marginBottom: 10 }}>
                        <Text style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>Alterar Senha</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSignOut} style={{ backgroundColor: '#FF0000', padding: 15, borderRadius: 10 }}>
                        <Text style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>Sair da Conta</Text>
                    </TouchableOpacity>
                </View>
            </Modalize>
        </>
    );
}
