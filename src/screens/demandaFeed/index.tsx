import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../auth/AuthProvider';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DemandaDTO } from '../../../firestore/Demanda/demandaDTO';
import { getDemandasByResponsavel } from '../../../firestore/Demanda/demandaController';
import { getClients } from '../../../firestore/Cliente/clienteController'; // Importe a função para obter os clientes

export default function DemandasFeed() {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [demandas, setDemandas] = useState<DemandaDTO[]>([]);
    const [clientes, setClientes] = useState<{ [key: string]: string }>({}); // Objeto para armazenar os nomes dos clientes

    useEffect(() => {
        const fetchDemandas = async () => {
            if (user) {
                console.log('User UID:', user.uid);
                const demandasList = await getDemandasByResponsavel(user.uid);
                console.log('Demandas:', demandasList);
                setDemandas(demandasList);

                // Fetch clientes e mapeie os nomes dos clientes pelos seus IDs
                const clientesList = await getClients();
                const clientesMap: { [key: string]: string } = {};
                clientesList.forEach(cliente => {
                    clientesMap[cliente.id] = cliente.nome;
                });
                setClientes(clientesMap);
            }
        };

        fetchDemandas();
    }, [user]);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#40FF01" />
                    <Text style={styles.backButtonText}>Voltar</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.title}>Demandas</Text>
            <FlatList
                data={demandas}
                keyExtractor={item => item.id ?? ''}
                renderItem={({ item }) => (
                    <View style={styles.demandaContainer}>
                        <Text style={styles.demandaTitle}>Título: {item.titulo}</Text>
                        <Text style={styles.demandaTitle}>Cliente: {clientes[item.clienteId]}</Text>
                        <Text style={styles.demandaDetails}>Data: {item.data}</Text>
                        <Text style={styles.demandaDetails}>Hora: {item.hora}</Text>
                        <Text style={styles.demandaDetails}>Descrição: {item.descricao}</Text>
                        {item.arquivoUri && (
                            <TouchableOpacity
                                onPress={() => navigation.navigate('VisualizarArquivo', { uri: item.arquivoUri ?? '', tipo: 'application/pdf' })}
                                style={{ backgroundColor: '#40FF01', padding: 10, borderRadius: 5, marginTop: 10, alignItems: 'center' }}
                            >
                                <Text style={{ color: '#fff' }}>Ver Arquivo</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
                showsVerticalScrollIndicator={false}
            />
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#000',
        textAlign: 'center',
    },
    demandaContainer: {
        padding: 15,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#40FF01',
    },
    demandaTitle: {
        fontSize: 18,
        color: '#000',
        marginBottom: 5,
    },
    demandaDetails: {
        fontSize: 16,
        color: '#555',
    },
});
