import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState, useEffect, useRef } from 'react';
import { Text, TouchableOpacity, View, Dimensions, TextInput, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Modalize } from 'react-native-modalize';
import { ClientDTO } from '../../../firestore/Cliente/clienteDTO';
import { addClient, getClients } from '../../../firestore/Cliente/clienteController';

export default function Cliente() {
    const navigation = useNavigation();
    const modalizeRef = useRef<Modalize>(null);
    const serviceModalizeRef = useRef<Modalize>(null);
    const contractPickerRef = useRef<Modalize>(null);
    const [clientes, setClientes] = useState<ClientDTO[]>([]);
    const [nome, setNome] = useState('');
    const [dataEntrada, setDataEntrada] = useState('');
    const [tempoContrato, setTempoContrato] = useState('');
    const [valor, setValor] = useState('');
    const [servicos, setServicos] = useState<string[]>([]);
    const [newService, setNewService] = useState('');

    useEffect(() => {
        const fetchClients = async () => {
            const clients = await getClients();
            setClientes(clients);
        };
        fetchClients();
    }, []);

    const openModal = () => {
        modalizeRef.current?.open();
    };

    const openServiceModal = () => {
        serviceModalizeRef.current?.open();
    };

    const openContractPicker = () => {
        contractPickerRef.current?.open();
    };

    const handleAddService = () => {
        setServicos([...servicos, newService]);
        setNewService('');
        serviceModalizeRef.current?.close();
    };

    const handleAddClient = async () => {
        const newClient: ClientDTO = {
            nome,
            dataEntrada,
            tempoContrato,
            servicos,
            valor,
            relatorios: [],
            briefing: [],
            demandas: [],
            reuniao: [],
            
        };
        const addedClient = await addClient(newClient);
        setClientes([...clientes, addedClient]);
        setNome('');
        setDataEntrada('');
        setTempoContrato('');
        setServicos([]);
        setValor('');
        modalizeRef.current?.close();
    };

    const handleSelectContractTime = (time: string) => {
        setTempoContrato(time);
        contractPickerRef.current?.close();
    };

    const renderButton = (cliente: ClientDTO, index: number) => (
        <TouchableOpacity
            key={index}
            style={styles.buttonContainer}
            onPress={() => navigation.navigate('ClienteDetalhes', { cliente })}
        >
            <View style={styles.buttonContent}>
                <View style={styles.buttonInnerContent}>
                    <MaterialCommunityIcons name="clipboard-account-outline" size={24} color="#40FF01" />
                    <Text style={styles.buttonText}>{cliente.nome}</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color="#000" />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#40FF01" />
                    <Text style={styles.backButtonText}>Menu</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={openModal} style={styles.addButton}>
                    <MaterialCommunityIcons name="plus" size={24} color="#40FF01" />
                    <Text style={styles.addButtonText}>Adicionar Cliente</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.clientesTitle}>Clientes</Text>

            <ScrollView contentContainerStyle={styles.clientList} showsVerticalScrollIndicator={false}>
                {clientes.map((cliente, index) => renderButton(cliente, index))}
            </ScrollView>

            <Modalize ref={modalizeRef} adjustToContentHeight>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Adicionar Cliente</Text>
                    <TextInput
                        placeholder="Nome do Cliente"
                        value={nome}
                        onChangeText={setNome}
                        style={styles.input}
                    />
                    <TextInput
                        placeholder="Data de Entrada"
                        value={dataEntrada}
                        onChangeText={setDataEntrada}
                        style={styles.input}
                    />
                    <TouchableOpacity onPress={openContractPicker} style={styles.pickerButton}>
                        <Text style={styles.pickerButtonText}>
                            {tempoContrato || 'Selecione o Tempo de Contrato'}
                        </Text>
                    </TouchableOpacity>
                    <TextInput
                        placeholder="Valor a Pagar"
                        value={valor}
                        onChangeText={setValor}
                        style={styles.input}
                    />
                   
                    <TouchableOpacity onPress={handleAddClient} style={styles.submitButton}>
                        <Text style={styles.submitButtonText}>Adicionar</Text>
                    </TouchableOpacity>
                </View>
            </Modalize>
            <Modalize ref={contractPickerRef} adjustToContentHeight>
                <View style={styles.modalContent}>
                    <TouchableOpacity onPress={() => handleSelectContractTime('3 meses')} style={styles.pickerItem}>
                        <Text style={styles.pickerItemText}>3 meses</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleSelectContractTime('6 meses')} style={styles.pickerItem}>
                        <Text style={styles.pickerItemText}>6 meses</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleSelectContractTime('12 meses')} style={styles.pickerItem}>
                        <Text style={styles.pickerItemText}>12 meses</Text>
                    </TouchableOpacity>
                </View>
            </Modalize>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 80,
        backgroundColor: 'white',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButtonText: {
        marginLeft: 10,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addButtonText: {
        marginLeft: 10,
        fontSize: 16,
        color: '#000',
    },
    clientesTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 10,
    },
    clientList: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        paddingBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        borderRadius: 10,
        backgroundColor: '#BDBCBB',
        marginVertical: 10,
        paddingHorizontal: 10,
        paddingVertical: 20,
    },
    buttonContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    buttonInnerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 1,
    },
    buttonText: {
        marginLeft: 10,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        flexShrink: 1,
    },
    modalContent: {
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        marginBottom: 10,
        padding: 10,
        borderRadius: 5,
    },
    pickerButton: {
        borderWidth: 1,
        borderColor: '#40FF01',
        padding: 10,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        backgroundColor: '#f0f0f0',
    },
    pickerButtonText: {
        color: '#555',
    },
    serviceButton: {
        backgroundColor: '#f0f0f0',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        borderColor: '#40FF01',
        borderWidth: 1,
    },
    serviceButtonText: {
        textAlign: 'center',
        color: '#000',
        fontWeight: 'bold',
    },
    serviceItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    submitButton: {
        backgroundColor: '#40FF01',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    submitButtonText: {
        textAlign: 'center',
        color: '#fff',
        fontWeight: 'bold',
    },
    pickerItem: {
        borderWidth: 1,
        borderColor: '#40FF01',
        padding: 10,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        backgroundColor: '#f0f0f0',
    },
    pickerItemText: {
        fontSize: 18,
        color: '#000',
    },
});
