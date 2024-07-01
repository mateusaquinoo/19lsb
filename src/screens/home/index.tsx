import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, ScrollView, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../../config/firebase';
import { Modalize } from 'react-native-modalize';
import lsb from '../../../assets/TELA-2.png'; // Ajuste conforme seu caminho de imagem
import { Picker } from '@react-native-picker/picker';

export default function Home() {
    const navigation = useNavigation();
    const modalizeRef = useRef<Modalize>(null);
    const [nome, setNome] = useState('');
    const [dataNascimento, setDataNascimento] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [cargo, setCargo] = useState('');
    const [pickerVisible, setPickerVisible] = useState(false);

    const openSignUpModal = () => {
        modalizeRef.current?.open();
    };

    const handleSignUp = async () => {
        if (senha !== confirmarSenha) {
            alert("As senhas não coincidem");
            return;
        }

        if (!cargo) {
            alert("Por favor, selecione um cargo");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
            const user = userCredential.user;

            await setDoc(doc(db, 'funcionarios', user.uid), {
                nome,
                dataNascimento,
                email,
                cargo,
                profileImage: "https://www.pngkey.com/png/full/114-1149878_setting-user-avatar-in-specific-size-without-breaking.png"
            });

            console.log('Usuário criado com sucesso:', user);
            navigation.navigate("Feed");
            modalizeRef.current?.close();
        } catch (error) {
            console.error("Erro ao criar conta:", error);
            alert("Erro ao criar conta. Tente novamente.");
        }
    };

    const handleSignIn = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, senha);
            const user = userCredential.user;
            console.log('Usuário logado com sucesso:', user);
            navigation.navigate("Feed");
        } catch (error) {
            console.error("Erro ao entrar:", error);
            alert("Erro ao entrar. Verifique suas credenciais e tente novamente.");
        }
    };

    return (
        <View style={styles.container}>
            <ImageBackground source={lsb} style={styles.backgroundImage}>
                <View style={styles.centeredView}>
                    <TouchableOpacity onPress={openSignUpModal} style={styles.signUpButton}>
                        <Text style={styles.signUpText}>Cadastre-se</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSignIn} style={styles.signInButton}>
                        <Text style={styles.signInText}>Entrar</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>

            <Modalize ref={modalizeRef} adjustToContentHeight>
                <View style={styles.modalContent}>
                    <TextInput placeholder="Nome" value={nome} onChangeText={setNome} style={styles.inputField} />
                    <TextInput placeholder="Data de Nascimento" value={dataNascimento} onChangeText={setDataNascimento} style={styles.inputField} />
                    <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.inputField} />
                    <TextInput placeholder="Senha" value={senha} onChangeText={setSenha} secureTextEntry style={styles.inputField} />
                    <TextInput placeholder="Confirmar Senha" value={confirmarSenha} onChangeText={setConfirmarSenha} secureTextEntry style={styles.inputField} />
                    <TouchableOpacity onPress={() => setPickerVisible(true)} style={styles.pickerButton}>
                        <Text style={styles.pickerButtonText}>{cargo || 'Selecione o Cargo'}</Text>
                    </TouchableOpacity>
                    <Modal
                        visible={pickerVisible}
                        transparent={true}
                        animationType="slide"
                        onRequestClose={() => setPickerVisible(false)}
                    >
                        <View style={styles.pickerModal}>
                            <Picker
                                selectedValue={cargo}
                                onValueChange={(itemValue) => {
                                    setCargo(itemValue);
                                }}
                                style={styles.picker}
                            >
                                <Picker.Item label="Designer" value="Designer" />
                                <Picker.Item label="Gestor de Tráfego" value="Gestor de Tráfego" />
                                <Picker.Item label="Editor de Vídeos" value="Editor de Vídeos" />
                                <Picker.Item label="Programador" value="Programador" />
                                <Picker.Item label="Administração" value="Administração" />
                            </Picker>
                            <TouchableOpacity style={styles.closePickerButton} onPress={() => setPickerVisible(false)}>
                                <Text style={styles.closePickerButtonText}>Fechar</Text>
                            </TouchableOpacity>
                        </View>
                    </Modal>
                    <TouchableOpacity onPress={handleSignUp} style={styles.submitButton}>
                        <Text style={styles.submitButtonText}>Cadastrar</Text>
                    </TouchableOpacity>
                </View>
            </Modalize>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundImage: {
        width: '100%',
        height: '100%',
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    signUpButton: {
        backgroundColor: 'white',
        width: 350,
        height: 45,
        borderRadius: 50,
        justifyContent: 'center',
        marginTop: 100,
    },
    signUpText: {
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
    },
    signInButton: {
        backgroundColor: 'transparent',
        marginTop: 20,
    },
    signInText: {
        color: 'white',
        fontSize: 19,
    },
    modalContent: {
        padding: 20,
    },
    inputField: {
        borderWidth: 1,
        marginBottom: 10,
        padding: 10,
        borderRadius: 5,
    },
    pickerButton: {
        borderWidth: 1,
        marginBottom: 20,
        padding: 10,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    pickerButtonText: {
        color: '#555',
    },
    pickerModal: {
        backgroundColor: 'white',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    picker: {
        width: '100%',
    },
    closePickerButton: {
        padding: 10,
        alignItems: 'center',
        backgroundColor: '#ccc',
    },
    closePickerButtonText: {
        color: 'black',
        fontSize: 16,
    },
    submitButton: {
        backgroundColor: '#40FF01',
        padding: 15,
        borderRadius: 10,
    },
    submitButtonText: {
        textAlign: 'center',
        color: '#fff',
        fontWeight: 'bold',
    },
});
