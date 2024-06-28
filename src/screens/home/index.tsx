import { StatusBar } from 'expo-status-bar';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View, TextInput, Modal, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import lsb from '../../../assets/TELA-2.png';
import { useState, useRef } from 'react';
import { Modalize } from 'react-native-modalize';
import { auth, db } from '../../../config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

export default function Home() {
  const navigation = useNavigation();
  const modalizeRef = useRef<Modalize>(null);
  const loginModalizeRef = useRef<Modalize>(null);
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

  const openLoginModal = () => {
    loginModalizeRef.current?.open();
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

      // Adicionar o usuário à coleção de funcionários
      await addDoc(collection(db, 'funcionarios'), {
        employeeId: user.uid, // Adiciona o campo employeeId
        nome: nome,
        email: email,
        dataNascimento: dataNascimento,
        cargo: cargo,
      });

      console.log('Usuário criado com sucesso:', user);

      // Salvar o nome do usuário no AsyncStorage
      await AsyncStorage.setItem('userName', nome);

      modalizeRef.current?.close();
    } catch (error) {
      console.error("Erro ao criar conta:", error);
    }
  };

  const handleSignIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;
      console.log('Usuário logado com sucesso:', user);
      navigation.navigate("Feed");
      loginModalizeRef.current?.close();
    } catch (error) {
      console.error("Erro ao entrar:", error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground source={lsb} style={{ width: '100%', height: '100%' }}>
        <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity onPress={openLoginModal} style={{ backgroundColor: 'white', width: 350, height: 45, borderRadius: 50, marginTop: 100, justifyContent: 'center' }}>
            <Text style={{ textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: 'black' }}>
              ENTRAR
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={openSignUpModal}>
            <Text style={{ color: 'white', fontSize: 19, marginTop: 20 }}>
              Cadastre-se
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
      
      <Modalize ref={modalizeRef} adjustToContentHeight>
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>Cadastro</Text>
          <TextInput
            placeholder="Nome"
            value={nome}
            onChangeText={setNome}
            style={{ borderWidth: 1, marginBottom: 10, padding: 10, borderRadius: 5 }}
          />
          <TextInput
            placeholder="Data de Nascimento"
            value={dataNascimento}
            onChangeText={setDataNascimento}
            style={{ borderWidth: 1, marginBottom: 10, padding: 10, borderRadius: 5 }}
          />
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={{ borderWidth: 1, marginBottom: 10, padding: 10, borderRadius: 5 }}
          />
          <TextInput
            placeholder="Senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            style={{ borderWidth: 1, marginBottom: 10, padding: 10, borderRadius: 5 }}
          />
          <TextInput
            placeholder="Confirmar Senha"
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            secureTextEntry
            style={{ borderWidth: 1, marginBottom: 20, padding: 10, borderRadius: 5 }}
          />
          <TouchableOpacity
            onPress={() => setPickerVisible(true)}
            style={{ borderWidth: 1, marginBottom: 20, padding: 10, borderRadius: 5, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }}
          >
            <Text style={{ color: '#555' }}>{cargo || 'Selecione o Cargo'}</Text>
          </TouchableOpacity>
          <Modal
            visible={pickerVisible}
            transparent={true}
            animationType="slide"
          >
            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
              <View style={{ backgroundColor: 'white', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                <ScrollView>
                  <Picker
                    selectedValue={cargo}
                    onValueChange={(itemValue) => {
                      setCargo(itemValue);
                      setPickerVisible(false);
                    }}
                  >
                    <Picker.Item label="Selecione o Cargo" value="" />
                    <Picker.Item label="Designer" value="Designer" />
                    <Picker.Item label="Gestor de Tráfego" value="Gestor de Tráfego" />
                    <Picker.Item label="Editor de Vídeos" value="Editor de Vídeos" />
                    <Picker.Item label="Programador" value="Programador" />
                    <Picker.Item label="Administração" value="Administração" />
                  </Picker>
                </ScrollView>
              </View>
            </View>
          </Modal>
          <TouchableOpacity onPress={handleSignUp} style={{ backgroundColor: '#40FF01', padding: 15, borderRadius: 10 }}>
            <Text style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>Cadastrar</Text>
          </TouchableOpacity>
        </View>
      </Modalize>

      <Modalize ref={loginModalizeRef} adjustToContentHeight>
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>Entrar</Text>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={{ borderWidth: 1, marginBottom: 10, padding: 10, borderRadius: 5 }}
          />
          <TextInput
            placeholder="Senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            style={{ borderWidth: 1, marginBottom: 20, padding: 10, borderRadius: 5 }}
          />
          <TouchableOpacity onPress={handleSignIn} style={{ backgroundColor: '#40FF01', padding: 15, borderRadius: 10 }}>
            <Text style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </Modalize>
    </View>
  );
}
