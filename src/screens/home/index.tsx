import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ImageBackground, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../../config/firebase';
import { Modalize } from 'react-native-modalize';
import lsb from '../../../assets/TELA-2.png'; // Ajuste conforme seu caminho de imagem
import { Picker } from '@react-native-picker/picker';
import { TextInputMask } from 'react-native-masked-text';

export default function Home() {
    const navigation = useNavigation();
    const signUpModalRef = useRef<Modalize>(null);
    const signInModalRef = useRef<Modalize>(null);
    const pickerModalRef = useRef<Modalize>(null);
    const [nome, setNome] = useState('');
    const [dataNascimento, setDataNascimento] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [cargo, setCargo] = useState('');

    const openSignUpModal = () => {
        signUpModalRef.current?.open();
    };

    const openSignInModal = () => {
        signInModalRef.current?.open();
    };

    const openPickerModal = () => {
        pickerModalRef.current?.open();
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
            signUpModalRef.current?.close();
        } catch (error) {
            console.error("Erro ao criar conta:", error);
            Alert.alert("Erro ao criar conta", (error as Error).message);
        }
    };

    const handleSignIn = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, senha);
            const user = userCredential.user;
            console.log('Usuário logado com sucesso:', user);
            navigation.navigate("Feed");
            signInModalRef.current?.close();
        } catch (error) {
            console.error("Erro ao entrar:", error);
            Alert.alert("Erro ao entrar", (error as Error).message);
        }
    };

    const handleNameChange = (text: string) => {
        const formattedText = text
            .replace(/[^a-zA-Z ]/g, '')  // Remove todos os caracteres não alfabéticos
            .replace(/\b\w/g, (char) => char.toUpperCase());  // Torna a primeira letra de cada palavra maiúscula
        setNome(formattedText);
    };

    return (
        <View style={styles.container}>
            <ImageBackground source={lsb} style={styles.backgroundImage}>
                <View style={styles.centeredView}>
                    <TouchableOpacity onPress={openSignUpModal} style={styles.signUpButton}>
                        <Text style={styles.signUpText}>Cadastre-se</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={openSignInModal} style={styles.signInButton}>
                        <Text style={styles.signInText}>Entrar</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>

            <Modalize ref={signUpModalRef} adjustToContentHeight>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalContent}
                >
                    <TextInput 
                        placeholder="Nome" 
                        value={nome} 
                        onChangeText={handleNameChange} 
                        style={styles.inputField} 
                    />
                    <TextInputMask
                        type={'datetime'}
                        options={{
                            format: 'DD/MM/YYYY'
                        }}
                        placeholder="Data de Nascimento"
                        value={dataNascimento}
                        onChangeText={setDataNascimento}
                        style={styles.inputField}
                        keyboardType="numeric"
                    />
                    <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.inputField} />
                    <TextInput placeholder="Senha" value={senha} onChangeText={setSenha} secureTextEntry style={styles.inputField} />
                    <TextInput placeholder="Confirmar Senha" value={confirmarSenha} onChangeText={setConfirmarSenha} secureTextEntry style={styles.inputField} />
                    <TouchableOpacity onPress={openPickerModal} style={styles.pickerButton}>
                        <Text style={styles.pickerButtonText}>{cargo || 'Selecione o Cargo'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSignUp} style={styles.submitButton}>
                        <Text style={styles.submitButtonText}>Cadastrar</Text>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </Modalize>

            <Modalize ref={signInModalRef} adjustToContentHeight>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalContent}
                >
                    <TextInput
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        style={styles.inputField}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <TextInput
                        placeholder="Senha"
                        value={senha}
                        onChangeText={setSenha}
                        secureTextEntry
                        style={styles.inputField}
                    />
                    <TouchableOpacity onPress={handleSignIn} style={styles.submitButton}>
                        <Text style={styles.submitButtonText}>Entrar</Text>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </Modalize>

            <Modalize ref={pickerModalRef} adjustToContentHeight>
                <View style={styles.pickerModal}>
                    <Picker
                        selectedValue={cargo}
                        onValueChange={(itemValue) => setCargo(itemValue)}
                        style={styles.picker}
                    >
                        <Picker.Item label="Selecione o Cargo" value="" />
                        <Picker.Item label="Designer" value="Designer" />
                        <Picker.Item label="Gestor de Tráfego" value="Gestor de Tráfego" />
                        <Picker.Item label="Editor de Vídeos" value="Editor de Vídeos" />
                        <Picker.Item label="Programador" value="Programador" />
                        <Picker.Item label="Administração" value="Administração" />
                    </Picker>
                    <TouchableOpacity style={styles.closePickerButton} onPress={() => pickerModalRef.current?.close()}>
                        <Text style={styles.closePickerButtonText}>Fechar</Text>
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
        marginBottom: 20,  
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
        padding: 20,
    },
    picker: {
        width: '100%',
    },
    closePickerButton: {
        padding: 10,
        alignItems: 'center',
        backgroundColor: '#ccc',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#40FF01',
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
