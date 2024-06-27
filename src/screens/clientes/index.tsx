import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState, useEffect, useRef, ReactElement, JSXElementConstructor } from 'react';
import { Text, TouchableOpacity, View, Dimensions, TextInput, FlatList } from 'react-native';
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
            reuniao: []
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
            style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                width: Dimensions.get("window").width / 2 - 30,
                borderRadius: 10,
                backgroundColor: "#BDBCBB",
                marginVertical: 10,
            }}
            onPress={() => navigation.navigate('ClienteDetalhes', { cliente })}
        >
            <View
                style={{
                    paddingVertical: 20,
                    paddingHorizontal: 20,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexDirection: "row",
                    width: "100%",
                }}
            >
                <View
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                    }}
                >
                    <MaterialCommunityIcons name="clipboard-account-outline" size={24} color="#40FF01" />
                    <Text
                        style={{
                            marginLeft: 10,
                            fontSize: 16,
                            fontWeight: "bold",
                            color: "#000",
                            height: 24,
                        }}
                    >
                        {cliente.nome}
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color="#000" />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={{
            flex: 1,
            paddingHorizontal: 20,
            paddingVertical: 80,
            flexWrap: "wrap",
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
                    Menu
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={openModal}
                style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                }}
            >
                <MaterialCommunityIcons name="plus" size={24} color="#40FF01" />
                <Text
                    style={{
                        marginLeft: 10,
                        fontSize: 16,
                        color: "#000",
                    }}
                >
                    Adicionar Cliente
                </Text>
            </TouchableOpacity>
        </View>
        
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginTop: 20 }}>
            {clientes.map((cliente, index) => renderButton(cliente, index))}
        </View>

        <Modalize
            ref={modalizeRef}
            adjustToContentHeight
        >
            <View style={{ padding: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Adicionar Cliente</Text>
                <TextInput
                    placeholder="Nome do Cliente"
                    value={nome}
                    onChangeText={setNome}
                    style={{ 
                        borderWidth: 1,
                        marginBottom: 10,
                        padding: 10,
                        borderRadius: 5
                    }}
                />
                <TextInput
                    placeholder="Data de Entrada"
                    value={dataEntrada}
                    onChangeText={setDataEntrada}
                    style={{ 
                        borderWidth: 1,
                        marginBottom: 10,
                        padding: 10,
                        borderRadius: 5
                    }}
                />
                <TouchableOpacity onPress={openContractPicker} style={{ 
                    borderWidth: 1, 
                    borderColor: '#40FF01', 
                    padding: 10, 
                    borderRadius: 5, 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    marginBottom: 10, 
                    backgroundColor: '#f0f0f0' 
                }}>
                    <Text style={{ color: '#555' }}>
                        {tempoContrato || 'Selecione o Tempo de Contrato'}
                    </Text>
                </TouchableOpacity>
                <TextInput
                    placeholder="Valor a Pagar"
                    value={valor}
                    onChangeText={setValor}
                    style={{ 
                        borderWidth: 1,
                        marginBottom: 10,
                        padding: 10,
                        borderRadius: 5
                    }}
                />
                <TouchableOpacity onPress={openServiceModal} style={{ backgroundColor: '#f0f0f0', padding: 15, borderRadius: 10, marginBottom: 20, borderColor: '#40FF01', borderWidth:1}}>
                    <Text style={{ textAlign: 'center', color: '#000', fontWeight: 'bold' }}>Adicionar Serviços</Text>
                </TouchableOpacity>
                <FlatList
                    data={servicos}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <Text>{item}</Text>
                        </View>
                    )}
                />
                <TouchableOpacity onPress={handleAddClient} style={{ backgroundColor: '#40FF01', padding: 15, borderRadius: 10, marginBottom: 20 }}>
                    <Text style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>Adicionar</Text>
                </TouchableOpacity>
            </View>
        </Modalize>

        <Modalize
            ref={serviceModalizeRef}
            adjustToContentHeight
        >
            <View style={{ padding: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Adicionar Serviço</Text>
                <TextInput
                    placeholder="Nome do Serviço"
                    value={newService}
                    onChangeText={setNewService}
                    style={{ 
                        borderWidth: 1,
                        marginBottom: 10,
                        padding: 10,
                        borderRadius: 5
                    }}
                />
                <TouchableOpacity onPress={handleAddService} style={{ backgroundColor: '#40FF01', padding: 15, borderRadius: 10 }}>
                    <Text style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>Adicionar Serviço</Text>
                </TouchableOpacity>
            </View>
        </Modalize>

        <Modalize
            ref={contractPickerRef}
            adjustToContentHeight
        >
            <View style={{ padding: 20 }}>
                <TouchableOpacity onPress={() => handleSelectContractTime('3 meses')} style={{
                borderWidth: 1,
                borderColor: '#40FF01',
                padding: 10,
                borderRadius: 5,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 10,
                backgroundColor: '#f0f0f0',
            }}>
                    <Text style={{
                        fontSize: 18,
                        color: '#000',
                    }}>3 meses</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleSelectContractTime('6 meses')} style={
                    {
                        borderWidth: 1,
                        borderColor: '#40FF01',
                        padding: 10,
                        borderRadius: 5,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: 10,
                        backgroundColor: '#f0f0f0',
                    }}>
                    <Text style={{
                        fontSize: 18,
                        color: '#000',
                    }}>6 meses</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleSelectContractTime('12 meses')} style={
                    {
                        borderWidth: 1,
                        borderColor: '#40FF01',
                        padding: 10,
                        borderRadius: 5,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: 10,
                        backgroundColor: '#f0f0f0',
                    }}>
                    <Text style={{
                        fontSize: 18,
                        color: '#000',
                    }}>12 meses</Text>
                </TouchableOpacity>
            </View>
        </Modalize>
        </View>
    );
}

