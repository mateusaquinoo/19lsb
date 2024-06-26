import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState, useEffect, useRef, ReactElement, JSXElementConstructor } from 'react';
import { Text, TouchableOpacity, View, Dimensions, TextInput, Switch, FlatList, ListRenderItemInfo } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Modalize } from 'react-native-modalize';
import { ClientDTO } from '../../../firestore/Cliente/clienteDTO';
import { addClient, getClients } from '../../../firestore/Cliente/clienteController';
import { ServicoDTO } from '../../../firestore/Servicos/servicosDTO';
import { getServicos } from '../../../firestore/Servicos/servicoController';

export default function Feed() {
    const navigation = useNavigation();
    const modalizeRef = useRef<Modalize>(null);
    const [clientes, setClientes] = useState<ClientDTO[]>([]);
    const [servicos, setServicos] = useState<ServicoDTO[]>([]);
    const [nome, setNome] = useState('');
    const [dataEntrada, setDataEntrada] = useState('');
    const [tempoContrato, setTempoContrato] = useState('');
    const [selectedServicos, setSelectedServicos] = useState<string[]>([]);
    const [valor, setValor] = useState('');

    useEffect(() => {
        const fetchClientsAndServices = async () => {
            const clients = await getClients();
            setClientes(clients);
            const fetchedServicos = await getServicos();
            setServicos(fetchedServicos);
        };
        fetchClientsAndServices();
    }, []);

    const openModal = () => {
        modalizeRef.current?.open();
    };

    const handleAddClient = async () => {
        const newClient: ClientDTO = {
            nome,
            dataEntrada,
            tempoContrato,
            servicos: selectedServicos, // Mantendo como array
            valor,
            relatorios: [],
            briefing: [],
            id: '',
            demandas: []
        };
        const addedClient = await addClient(newClient);
        setClientes([...clientes, addedClient]);
        setNome('');
        setDataEntrada('');
        setTempoContrato('');
        setSelectedServicos([]);
        setValor('');
        modalizeRef.current?.close();
    };

    const toggleService = (service: string) => {
        if (selectedServicos.includes(service)) {
            setSelectedServicos(selectedServicos.filter(s => s !== service));
        } else {
            setSelectedServicos([...selectedServicos, service]);
        }
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
            flatListProps={{
                data: servicos,
                keyExtractor: (item) => item.id,
                renderItem: ({ item }) => (
                    <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <Text>{item.nome}</Text>
                        <Switch
                            value={selectedServicos.includes(item.nome)}
                            onValueChange={() => toggleService(item.nome)}
                        />
                    </View>
                ),
                ListHeaderComponent: (
                    <>
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
                        <TextInput
                            placeholder="Tempo de Contrato"
                            value={tempoContrato}
                            onChangeText={setTempoContrato}
                            style={{ 
                                borderWidth: 1,
                                marginBottom: 10,
                                padding: 10,
                                borderRadius: 5
                            }}
                        />
                        <Text style={{ marginBottom: 10, fontWeight: 'bold' }}>Serviços Contratados</Text>
                    </>
                ),
                ListFooterComponent: (
                    <>
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
                        <TouchableOpacity onPress={handleAddClient} style={{ backgroundColor: '#40FF01', padding: 15, borderRadius: 10, marginBottom: 20 }}>
                            <Text style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>Adicionar</Text>
                        </TouchableOpacity>
                    </>
                ),
                contentContainerStyle: { padding: 20 },
                showsVerticalScrollIndicator: false,
            }}
            snapPoint={500}
        />
        </View>
    );
}
