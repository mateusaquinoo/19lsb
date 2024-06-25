import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ClientDTO } from '../../../firestore/Cliente/clienteDTO';

type RootStackParamList = {
    ServicosCliente: { cliente: ClientDTO };
};

type ServicosClienteRouteProp = RouteProp<RootStackParamList, 'ServicosCliente'>;

export default function ServicosCliente() {
    const navigation = useNavigation();
    const route = useRoute<ServicosClienteRouteProp>();
    const { cliente } = route.params;

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
                
                <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, marginTop: 20}}>Serviços Contratados:</Text>

                {Array.isArray(cliente.servicos) && cliente.servicos.length > 0 ? (
                    cliente.servicos.map((servico, index) => (
                        <View key={index} style={{ padding: 15, backgroundColor: '#f0f0f0', borderRadius: 10, marginBottom: 10 }}>
                            <Text style={{ fontSize: 18, color: '#000' }}>{servico}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={{ fontSize: 16, color: '#555' }}>Nenhum serviço contratado.</Text>
                )}
            </View>
        </View>
    );
}
