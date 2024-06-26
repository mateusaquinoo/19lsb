import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState, useEffect, useRef } from 'react';
import { Text, TouchableOpacity, View, TextInput, FlatList, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ClientDTO } from '../../../firestore/Cliente/clienteDTO';
import { updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { Modalize } from 'react-native-modalize';

type RootStackParamList = {
    ReuniaoCliente: { cliente: ClientDTO };
};

type ReuniaoClienteRouteProp = RouteProp<RootStackParamList, 'ReuniaoCliente'>;

interface Reuniao {
    id: string;
    pauta: string;
    descricao: string;
    data: string;
}

export default function ReuniaoCliente() {
    const navigation = useNavigation();
    const route = useRoute<ReuniaoClienteRouteProp>();
    const { cliente } = route.params;

    const [reuniao, setReuniao] = useState<Reuniao[]>(cliente.reuniao || []);
    const [pauta, setPauta] = useState('');
    const [descricao, setDescricao] = useState('');
    const [currentReuniaoId, setCurrentReuniaoId] = useState<string | null>(null);
    const modalizeRef = useRef<Modalize>(null);

    useEffect(() => {
        const fetchCliente = async () => {
            if (cliente.id) {
                const clienteDoc = doc(db, 'clientes', cliente.id);
                const docSnap = await getDoc(clienteDoc);
                if (docSnap.exists()) {
                    const clienteData = docSnap.data() as ClientDTO;
                    setReuniao(clienteData.reuniao || []);
                }
            }
        };

        fetchCliente();
    }, [cliente.id]);

    const handleAddReuniao = async () => {
        const novaReuniao: Reuniao = {
            id: Math.random().toString(36).substring(7),
            pauta,
            descricao,
            data: new Date().toLocaleDateString()
        };

        const updatedReuniao = [...reuniao, novaReuniao];
        setReuniao(updatedReuniao);

        if (cliente.id) {
            const clienteDoc = doc(db, 'clientes', cliente.id);
            await updateDoc(clienteDoc, { reuniao: updatedReuniao });
        }

        setPauta('');
        setDescricao('');
        modalizeRef.current?.close();
    };

    const handleEditReuniao = async () => {
        if (!currentReuniaoId) return;

        const updatedReuniao = reuniao.map((item) => 
            item.id === currentReuniaoId ? { ...item, pauta, descricao } : item
        );
        setReuniao(updatedReuniao);

        if (cliente.id) {
            const clienteDoc = doc(db, 'clientes', cliente.id);
            await updateDoc(clienteDoc, { reuniao: updatedReuniao });
        }

        setPauta('');
        setDescricao('');
        setCurrentReuniaoId(null);
        modalizeRef.current?.close();
    };

    const handleDeleteReuniao = async (id: string) => {
        const updatedReuniao = reuniao.filter((item) => item.id !== id);
        setReuniao(updatedReuniao);

        if (cliente.id) {
            const clienteDoc = doc(db, 'clientes', cliente.id);
            await updateDoc(clienteDoc, { reuniao: updatedReuniao });
        }
    };

    const openEditModal = (item: Reuniao) => {
        setPauta(item.pauta);
        setDescricao(item.descricao);
        setCurrentReuniaoId(item.id);
        modalizeRef.current?.open();
    };

    const confirmDeleteReuniao = (id: string) => {
        Alert.alert(
            "Excluir Reunião",
            "Você tem certeza que deseja excluir esta Reunião?",
            [
                {
                    text: "Não",
                    style: "cancel"
                },
                {
                    text: "Sim",
                    onPress: () => handleDeleteReuniao(id)
                }
            ]
        );
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
                <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, marginTop: 10 }}>Reuniões:</Text>

                <FlatList
                    data={reuniao}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={{ padding: 15, backgroundColor: '#f0f0f0', borderRadius: 10, marginBottom: 10 }}>
                            <Text style={{ fontSize: 18, color: '#000' }}>Pauta: {item.pauta}</Text>
                            <Text style={{ fontSize: 16, color: '#555' }}>Descrição: {item.descricao}</Text>
                            <Text style={{ fontSize: 14, color: '#888' }}>Adicionado em: {item.data}</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
                                <TouchableOpacity
                                    onPress={() => openEditModal(item)}
                                    style={{ marginRight: 10 }}>
                                     <Text style={{ color: '#007bff' }}>Editar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => confirmDeleteReuniao(item.id)}
                                >
                                    <Text style={{ color: '#dc3545' }}>Excluir</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            </View>

            <Modalize ref={modalizeRef} adjustToContentHeight>
                <View style={{ padding: 20 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>{currentReuniaoId ? 'Editar Reunião' : 'Adicionar Reunião'}</Text>
                    <TextInput
                        placeholder="Pauta"
                        value={pauta}
                        onChangeText={setPauta}
                        style={{
                            borderWidth: 1,
                            marginBottom: 10,
                            padding: 10,
                            borderRadius: 5
                        }}
                    />
                    <TextInput
                        placeholder="Descrição"
                        value={descricao}
                        onChangeText={setDescricao}
                        style={{
                            borderWidth: 1,
                            marginBottom: 10,
                            padding: 10,
                            borderRadius: 5
                        }}
                    />
                 
                    <TouchableOpacity onPress={currentReuniaoId ? handleEditReuniao : handleAddReuniao} style={{ backgroundColor: '#40FF01', padding: 15, borderRadius: 10 }}>
                        <Text style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>{currentReuniaoId ? 'Salvar Alterações' : 'Adicionar'}</Text>
                    </TouchableOpacity>
                   
                </View>
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
                onPress={() => modalizeRef.current?.open()}
            >
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}
