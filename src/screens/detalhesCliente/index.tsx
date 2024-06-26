import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ClientDTO } from '../../../firestore/Cliente/clienteDTO';

type RootStackParamList = {
    ClienteDetalhes: { cliente: ClientDTO };
    ServicosCliente: { cliente: ClientDTO };
    AcessosCliente: { cliente: ClientDTO };
    BriefingCliente: { cliente: ClientDTO };
    RelatoriosCliente: { cliente: ClientDTO };
};

type ClienteDetalhesRouteProp = RouteProp<RootStackParamList, 'ClienteDetalhes'>;

export default function ClienteDetalhes() {
    const navigation = useNavigation();
    const route = useRoute<ClienteDetalhesRouteProp>();
    const { cliente } = route.params;

    return (
        <View style={{
            flex: 1,
            paddingHorizontal: 20,
            paddingVertical: 80,
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
            </View>

            <View style={{ marginTop: 20 }}>
                <Text style={{ fontSize: 28, fontWeight: 'bold' }}>{cliente.nome}</Text>
                <Text style={{ fontSize: 16, color: '#555', marginBottom: 20 }}>Data de Entrada: {cliente.dataEntrada}</Text>

                {['Demandas', 'Acessos', 'Breafing', 'Reuniões', 'Relatórios', 'Serviços'].map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                            borderRadius: 10,
                            backgroundColor: "#BDBCBB",
                            marginVertical: 10,
                        }}
                        onPress={() => {
                            if (item === 'Serviços') {
                                navigation.navigate('ServicosCliente', { cliente });
                            } else if (item === 'Acessos') {
                                navigation.navigate('AcessosCliente', { cliente });
                            } else if (item === 'Breafing') {
                                navigation.navigate('BriefingCliente', { cliente });
                            } else if (item === 'Relatórios') {
                                navigation.navigate('RelatoriosCliente', { cliente });
                            } else if (item === 'Demandas') {
                                navigation.navigate('Demanda', { cliente });
                            } else if (item === 'Reuniões') {
                                navigation.navigate('ReuniaoCliente', { cliente });
                            }

                        }}
                    >
                        <View
                            style={{
                                paddingVertical: 20,
                                paddingRight: 20,
                                marginLeft: 20,
                                display: "flex",
                                width: Dimensions.get("window").width - 60,
                                justifyContent: "space-between",
                                alignItems: "center",
                                flexDirection: "row",
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
                                        color: "#000",
                                    }}
                                >
                                    {item}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={14} color="#000" />
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}
