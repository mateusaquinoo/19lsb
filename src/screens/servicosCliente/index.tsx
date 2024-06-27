import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState, useRef, useEffect } from 'react';
import { Text, TouchableOpacity, View, StyleSheet, TextInput, FlatList, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ClientDTO } from '../../../firestore/Cliente/clienteDTO';
import { Modalize } from 'react-native-modalize';
import { updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';

type RootStackParamList = {
    ServicosCliente: { cliente: ClientDTO };
};

type ServicosClienteRouteProp = RouteProp<RootStackParamList, 'ServicosCliente'>;

export default function ServicosCliente() {
    const navigation = useNavigation();
    const route = useRoute<ServicosClienteRouteProp>();
    const { cliente } = route.params;

    const [servicos, setServicos] = useState<string[]>(cliente.servicos || []);
    const [nome, setNome] = useState('');
    const modalizeRef = useRef<Modalize>(null);

    useEffect(() => {
        const fetchCliente = async () => {
            if (cliente.id) {
                const clienteDoc = doc(db, 'clientes', cliente.id);
                const docSnap = await getDoc(clienteDoc);
                if (docSnap.exists()) {
                    const clienteData = docSnap.data() as ClientDTO;
                    setServicos(clienteData.servicos || []);
                }
            }
        };

        fetchCliente();
    }, [cliente.id]);

    const handleAddServico = async () => {
        if (nome.trim()) {
            const updatedServicos = [...servicos, nome];
            setServicos(updatedServicos);

            if (cliente.id) {
                const clienteDoc = doc(db, 'clientes', cliente.id);
                await updateDoc(clienteDoc, { servicos: updatedServicos });
            }

            setNome('');
            modalizeRef.current?.close();
        } else {
            Alert.alert('Erro', 'O nome do serviço não pode ser vazio.');
        }
    };

    const handleDeleteServico = async (index: number) => {
        const updatedServicos = servicos.filter((_, i) => i !== index);
        setServicos(updatedServicos);

        if (cliente.id) {
            const clienteDoc = doc(db, 'clientes', cliente.id);
            await updateDoc(clienteDoc, { servicos: updatedServicos });
        }
    };

    const confirmDeleteServico = (index: number) => {
        Alert.alert(
            "Excluir Serviço",
            "Você tem certeza que deseja excluir este serviço?",
            [
                {
                    text: "Não",
                    style: "cancel"
                },
                {
                    text: "Sim",
                    onPress: () => handleDeleteServico(index)
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#40FF01" />
                    <Text style={styles.backButtonText}>Voltar</Text>
                </TouchableOpacity>
            </View>

            <View style={{ marginTop: 20 }}>
                <Text style={styles.clienteNome}>{cliente.nome}</Text>
                <Text style={styles.servicosTitle}>Serviços Contratados:</Text>

                <FlatList
                    data={servicos}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={({ item, index }) => (
                        <View style={styles.servicoContainer}>
                            <Text style={styles.servicoText}>{item}</Text>
                            <View style={styles.servicoActions}>
                                <TouchableOpacity onPress={() => confirmDeleteServico(index)} style={styles.deleteButton}>
                                    <Text style={{ color: '#dc3545' }}>Excluir</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            </View>

            <Modalize ref={modalizeRef} adjustToContentHeight>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Adicionar Serviço</Text>
                    <TextInput
                        placeholder="Nome do Serviço"
                        value={nome}
                        onChangeText={setNome}
                        style={styles.input}
                    />
                    <TouchableOpacity onPress={handleAddServico} style={styles.submitButton}>
                        <Text style={styles.submitButtonText}>Adicionar</Text>
                    </TouchableOpacity>
                </View>
            </Modalize>

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                    setNome('');
                    modalizeRef.current?.open();
                }}
            >
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 80,
        backgroundColor: '#fff',
    },
    header: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    backButton: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
    },
    backButtonText: {
        marginLeft: 10,
        fontSize: 24,
        fontWeight: "bold",
        color: "#000",
    },
    clienteNome: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    servicosTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        marginTop: 10,
    },
    servicoContainer: {
        padding: 15,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        marginBottom: 10,
    },
    servicoText: {
        fontSize: 18,
        color: '#000',
    },
    servicoActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    deleteButton: {},
    modalContent: {
        padding: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        marginBottom: 10,
        padding: 10,
        borderRadius: 5,
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
    addButton: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        backgroundColor: '#40FF01',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
