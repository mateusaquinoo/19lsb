import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState, useEffect, useRef } from 'react';
import { Text, TouchableOpacity, View, TextInput, FlatList, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ClientDTO } from '../../../firestore/Cliente/clienteDTO';
import { updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { Picker } from '@react-native-picker/picker';
import { Modalize } from 'react-native-modalize';

type RootStackParamList = {
    AcessosCliente: { cliente: ClientDTO };
};

type AcessosClienteRouteProp = RouteProp<RootStackParamList, 'AcessosCliente'>;

interface Acesso {
    id: string;
    redeSocial: string;
    login: string;
    senha: string;
}

export default function AcessosCliente() {
    const navigation = useNavigation();
    const route = useRoute<AcessosClienteRouteProp>();
    const { cliente } = route.params;

    const [acessos, setAcessos] = useState<Acesso[]>(cliente.acessos || []);
    const [redeSocial, setRedeSocial] = useState('');
    const [login, setLogin] = useState('');
    const [senha, setSenha] = useState('');
    const [currentAcessoId, setCurrentAcessoId] = useState<string | null>(null);
    const [pickerVisible, setPickerVisible] = useState(false);

    const modalizeRef = useRef<Modalize>(null);
    const pickerRef = useRef<Modalize>(null);

    useEffect(() => {
        const fetchCliente = async () => {
            if (cliente.id) {
                const clienteDoc = doc(db, 'clientes', cliente.id);
                const docSnap = await getDoc(clienteDoc);
                if (docSnap.exists()) {
                    const clienteData = docSnap.data() as ClientDTO;
                    setAcessos(clienteData.acessos || []);
                }
            }
        };

        fetchCliente();
    }, [cliente.id]);

    const handleAddOrUpdateAcesso = async () => {
        if (!redeSocial || !login || !senha) {
            alert("Todos os campos são obrigatórios");
            return;
        }

        const updatedAcessos = currentAcessoId
            ? acessos.map(a => a.id === currentAcessoId ? { id: a.id, redeSocial, login, senha } : a)
            : [...acessos, { id: Math.random().toString(36).substring(7), redeSocial, login, senha }];

        setAcessos(updatedAcessos);

        if (cliente.id) {
            const clienteDoc = doc(db, 'clientes', cliente.id);
            await updateDoc(clienteDoc, { acessos: updatedAcessos });
        }

        setRedeSocial('');
        setLogin('');
        setSenha('');
        setCurrentAcessoId(null);
        modalizeRef.current?.close();
    };

    const handleEditAcesso = (acesso: Acesso) => {
        setRedeSocial(acesso.redeSocial);
        setLogin(acesso.login);
        setSenha(acesso.senha);
        setCurrentAcessoId(acesso.id);
        modalizeRef.current?.open();
    };

    const handleDeleteAcesso = (acessoId: string) => {
        Alert.alert(
            "Confirmar exclusão",
            "Você tem certeza que deseja excluir este acesso?",
            [
                {
                    text: "Não",
                    style: "cancel"
                },
                {
                    text: "Sim",
                    onPress: async () => {
                        const updatedAcessos = acessos.filter(a => a.id !== acessoId);
                        setAcessos(updatedAcessos);

                        if (cliente.id) {
                            const clienteDoc = doc(db, 'clientes', cliente.id);
                            await updateDoc(clienteDoc, { acessos: updatedAcessos });
                        }
                    }
                }
            ]
        );
    };

    const openModal = () => {
        setRedeSocial('');
        setLogin('');
        setSenha('');
        setCurrentAcessoId(null);
        modalizeRef.current?.open();
    };

    const openPickerModal = () => {
        pickerRef.current?.open();
    };

    return (
        <View style={{
            flex: 1,
            paddingHorizontal: 20,
            paddingVertical: 80,
            backgroundColor: '#fff'
        }}>
            <View
                style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                    }}
                >
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#40FF01" />
                    <Text
                        style={{
                            marginLeft: 10,
                            fontSize: 24,
                            fontWeight: "bold",
                            color: "#000",
                        }}
                    >
                        Voltar
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={{ marginTop: 20 }}>
                <Text style={{ fontSize: 28, fontWeight: 'bold' }}>{cliente.nome}</Text>
                <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, marginTop:10 }}>Acessos:</Text>

                <FlatList
                    data={acessos}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={{ padding: 15, backgroundColor: '#f0f0f0', borderRadius: 10, marginBottom: 10 }}>
                            <Text style={{ fontSize: 20, color: '#000', marginBottom: 5 }}>{item.redeSocial}</Text>
                            <Text style={{ fontSize: 16, color: '#555' }}>Login: {item.login}</Text>
                            <Text style={{ fontSize: 16, color: '#555' }}>Senha: {item.senha}</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
                                <TouchableOpacity onPress={() => handleEditAcesso(item)} style={{ marginRight: 10 }}>
                                    <Text style={{ color: '#007bff' }}>Editar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDeleteAcesso(item.id)}>
                                    <Text style={{ color: '#dc3545' }}>Excluir</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            </View>

            <Modalize ref={modalizeRef} adjustToContentHeight>
                <ScrollView contentContainerStyle={{ padding: 20 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>
                        {currentAcessoId ? 'Editar Acesso' : 'Adicionar Novo Acesso'}
                    </Text>
                    <TouchableOpacity
                        onPress={openPickerModal}
                        style={{
                            borderWidth: 1,
                            marginBottom: 20,
                            padding: 10,
                            borderRadius: 5,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: '#f0f0f0'
                        }}
                    >
                        <Text style={{ color: '#555' }}>{redeSocial || 'Selecione a Rede Social'}</Text>
                    </TouchableOpacity>
                    <TextInput
                        placeholder="Login"
                        value={login}
                        onChangeText={setLogin}
                        style={{
                            borderWidth: 1,
                            marginBottom: 10,
                            padding: 10,
                            borderRadius: 5
                        }}
                    />
                    <TextInput
                        placeholder="Senha"
                        value={senha}
                        onChangeText={setSenha}
                        style={{
                            borderWidth: 1,
                            marginBottom: 10,
                            padding: 10,
                            borderRadius: 5
                        }}
                    />
                    <TouchableOpacity onPress={handleAddOrUpdateAcesso} style={{ backgroundColor: '#40FF01', padding: 15, borderRadius: 10 }}>
                        <Text style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>
                            {currentAcessoId ? 'Atualizar' : 'Adicionar'}
                        </Text>
                    </TouchableOpacity>
                  
                </ScrollView>
            </Modalize>

            <Modalize ref={pickerRef} adjustToContentHeight>
                <Picker
                    selectedValue={redeSocial}
                    onValueChange={(itemValue) => {
                        setRedeSocial(itemValue);
                        pickerRef.current?.close();
                    }}
                >
                    <Picker.Item label="Selecione a Rede Social" value="" />
                    <Picker.Item label="Instagram" value="Instagram" />
                    <Picker.Item label="Facebook" value="Facebook" />
                    <Picker.Item label="LinkedIn" value="LinkedIn" />
                    <Picker.Item label="Google" value="Google" />
                    <Picker.Item label="TikTok" value="TikTok" />
                    <Picker.Item label="YouTube" value="YouTube" />
                </Picker>
            </Modalize>

            <TouchableOpacity
                style={{
                    position: 'absolute',
                    bottom: 30,
                    right: 30,
                    backgroundColor: '#40FF01',
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
                onPress={openModal}
            >
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}
