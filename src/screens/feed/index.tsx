import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState, useRef } from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View, Dimensions, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Image } from "expo-image";
import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { Modalize } from 'react-native-modalize';
import { auth, db, storage } from '../../../config/firebase'; // Certifique-se de importar corretamente
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export default function Feed() {
    const navigation = useNavigation();
    const [firstName, setFirstName] = useState('');
    const [profileImage, setProfileImage] = useState("https://www.pngkey.com/png/full/114-1149878_setting-user-avatar-in-specific-size-without-breaking.png");
    const [uploading, setUploading] = useState(false);
    const modalizeRef = useRef<Modalize>(null);

    useEffect(() => {
        const getUserProfile = async () => {
            const user = auth.currentUser;
            if (user) {
                const docRef = doc(db, 'funcionarios', user.uid);
                const docSnap = await getDoc(docRef);
    
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    setFirstName(userData.nome || '');
                    setProfileImage(userData.profileImage || "https://www.pngkey.com/png/full/114-1149878_setting-user-avatar-in-specific-size-without-breaking.png");
                } else {
                    console.log("No such document!");
                }
            }
        };
    
        getUserProfile();
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

        if (!result.canceled && result.assets.length > 0) {
            const imageUri = result.assets[0].uri;
            setUploading(true);
            await uploadFile(imageUri);
        }
    };

    const uploadFile = async (uri: string) => {
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const user = auth.currentUser;
            if (!user) {
                setUploading(false);
                return;
            }

            const storageRef = ref(storage, `profileImages/${user.uid}`);
            const uploadTask = uploadBytesResumable(storageRef, blob);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`Upload is ${progress}% done`);
                },
                (error) => {
                    console.error('Upload error:', error);
                    Alert.alert('Erro', 'Ocorreu um erro ao fazer o upload da imagem. Tente novamente.');
                    setUploading(false);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    setProfileImage(downloadURL);
                    await updateDoc(doc(db, 'funcionarios', user.uid), { profileImage: downloadURL });
                    setUploading(false);
                }
            );
        } catch (error) {
            console.error('Fetch error:', error);
            Alert.alert('Erro', 'Ocorreu um erro ao processar a imagem. Tente novamente.');
            setUploading(false);
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
                                borderWidth: 1,
                                borderColor: "#40FF01",
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
                        onPress={() => navigation.navigate("Calendario")}
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
                        onPress={() => navigation.navigate("Avisos")}
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
                                    name="clipboard-alert-outline"
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
                        onPress={() => navigation.navigate("GerenciarAvisos")}
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
                                    name="clipboard-text-search-outline"
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
                                    Controle
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
                        onPress={() => navigation.navigate("DemandasFeed")}
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
                        onPress={() => navigation.navigate("Ponto")}
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
                <View
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: 20,
                    }}
                >
                    <TouchableOpacity
                        onPress={() => navigation.navigate("GerenciarPontos")}
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
                                    ADM
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={14} color="#000" />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <Modalize ref={modalizeRef} adjustToContentHeight>
                <View style={{ padding: 20 }}>
                    <TouchableOpacity onPress={pickImage} style={{ backgroundColor: '#999', padding: 10, borderRadius: 10, marginBottom: 10, borderWidth:1, borderColor:'#40FF01' }}>
                        {uploading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>Adicionar Foto de Perfil</Text>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={changePassword} style={{ backgroundColor: '#999', padding: 10, borderRadius: 10, marginBottom: 10, borderWidth:1, borderColor:'#40FF01' }}>
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
