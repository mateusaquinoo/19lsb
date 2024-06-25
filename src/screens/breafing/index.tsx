import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState, useEffect, useRef } from 'react';
import { Text, TouchableOpacity, View, TextInput, FlatList, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ClientDTO } from '../../../firestore/Cliente/clienteDTO';
import { updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { Modalize } from 'react-native-modalize';

type RootStackParamList = {
    BriefingCliente: { cliente: ClientDTO };
    ServicosCliente: { cliente: ClientDTO };
};

type BriefingClienteRouteProp = RouteProp<RootStackParamList, 'BriefingCliente'>;

interface Briefing {
    id: string;
    objetivo: string;
    descricao: string;
    prazo: string;
    data: string;
}

export default function BriefingCliente() {
    const navigation = useNavigation();
    const route = useRoute<BriefingClienteRouteProp>();
    const { cliente } = route.params;

    const [briefing, setBriefing] = useState<Briefing[]>(cliente.briefing || []);
    const [objetivo, setObjetivo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [prazo, setPrazo] = useState('');
    const [currentBriefingId, setCurrentBriefingId] = useState<string | null>(null);
    const modalizeRef = useRef<Modalize>(null);

    useEffect(() => {
        const fetchCliente = async () => {
            if (cliente.id) {
                const clienteDoc = doc(db, 'clientes', cliente.id);
                const docSnap = await getDoc(clienteDoc);
                if (docSnap.exists()) {
                    const clienteData = docSnap.data() as ClientDTO;
                    setBriefing(clienteData.briefing || []);
                }
            }
        };

        fetchCliente();
    }, [cliente.id]);

    const handleAddBriefing = async () => {
        const novoBriefing: Briefing = {
            id: Math.random().toString(36).substring(7),
            objetivo,
            descricao,
            prazo,
            data: new Date().toLocaleDateString()
        };

        const updatedBriefing = [...briefing, novoBriefing];
        setBriefing(updatedBriefing);

        if (cliente.id) {
            const clienteDoc = doc(db, 'clientes', cliente.id);
            await updateDoc(clienteDoc, { briefing: updatedBriefing });
        }

        setObjetivo('');
        setDescricao('');
        setPrazo('');
        modalizeRef.current?.close();
    };

    const handleEditBriefing = async () => {
        if (!currentBriefingId) return;

        const updatedBriefing = briefing.map((item) => 
            item.id === currentBriefingId ? { ...item, objetivo, descricao, prazo } : item
        );
        setBriefing(updatedBriefing);

        if (cliente.id) {
            const clienteDoc = doc(db, 'clientes', cliente.id);
            await updateDoc(clienteDoc, { briefing: updatedBriefing });
        }

        setObjetivo('');
        setDescricao('');
        setPrazo('');
        setCurrentBriefingId(null);
        modalizeRef.current?.close();
    };

    const handleDeleteBriefing = async (id: string) => {
        const updatedBriefing = briefing.filter((item) => item.id !== id);
        setBriefing(updatedBriefing);

        if (cliente.id) {
            const clienteDoc = doc(db, 'clientes', cliente.id);
            await updateDoc(clienteDoc, { briefing: updatedBriefing });
        }
    };

    const openEditModal = (item: Briefing) => {
        setObjetivo(item.objetivo);
        setDescricao(item.descricao);
        setPrazo(item.prazo);
        setCurrentBriefingId(item.id);
        modalizeRef.current?.open();
    };

    const confirmDeleteBriefing = (id: string) => {
        Alert.alert(
            "Excluir Briefing",
            "Você tem certeza que deseja excluir este briefing?",
            [
                {
                    text: "Não",
                    style: "cancel"
                },
                {
                    text: "Sim",
                    onPress: () => handleDeleteBriefing(id)
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
                <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, marginTop: 10 }}>Briefing:</Text>

                <FlatList
                    data={briefing}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={{ padding: 15, backgroundColor: '#f0f0f0', borderRadius: 10, marginBottom: 10 }}>
                            <Text style={{ fontSize: 18, color: '#000' }}>Objetivo: {item.objetivo}</Text>
                            <Text style={{ fontSize: 16, color: '#555' }}>Descrição: {item.descricao}</Text>
                            <Text style={{ fontSize: 16, color: '#555' }}>Prazo: {item.prazo}</Text>
                            <Text style={{ fontSize: 14, color: '#888' }}>Adicionado em: {item.data}</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
                                <TouchableOpacity
                                    onPress={() => openEditModal(item)}
                                    style={{ marginRight: 10 }}>
                                     <Text style={{ color: '#007bff' }}>Editar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => confirmDeleteBriefing(item.id)}
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
                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>{currentBriefingId ? 'Editar Briefing' : 'Adicionar Briefing'}</Text>
                    <TextInput
                        placeholder="Objetivo"
                        value={objetivo}
                        onChangeText={setObjetivo}
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
                    <TextInput
                        placeholder="Prazo"
                        value={prazo}
                        onChangeText={setPrazo}
                        style={{
                            borderWidth: 1,
                            marginBottom: 10,
                            padding: 10,
                            borderRadius: 5
                        }}
                    />
                    <TouchableOpacity onPress={currentBriefingId ? handleEditBriefing : handleAddBriefing} style={{ backgroundColor: '#40FF01', padding: 15, borderRadius: 10 }}>
                        <Text style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>{currentBriefingId ? 'Salvar Alterações' : 'Adicionar'}</Text>
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
