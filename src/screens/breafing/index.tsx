import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ClientDTO } from '../../../firestore/Cliente/clienteDTO';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type RootStackParamList = {
    DemandaCliente: { cliente: ClientDTO };
};

type DemandaClienteRouteProp = RouteProp<RootStackParamList, 'DemandaCliente'>;

interface EventDTO {
    title: string;
    date: string;
    time: string;
    employee: string;
}

export default function DemandaCliente() {
    const navigation = useNavigation();
    const route = useRoute<DemandaClienteRouteProp>();
    const { cliente } = route.params;

    const [employees, setEmployees] = useState<{ id: string; nome: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const employeesSnapshot = await getDocs(collection(db, 'funcionarios'));
                const employeesList = employeesSnapshot.docs.map(doc => {
                    const data = doc.data();
                    return { id: doc.id, nome: data.nome };
                });
                setEmployees(employeesList);
            } catch (error) {
                console.error('Error fetching employees:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployees();
    }, []);

    if (loading) {
        return <Text>Carregando...</Text>;
    }

    if (!cliente) {
        return <Text>Cliente não encontrado.</Text>;
    }

    // Verifica se a propriedade eventos existe e é um array
    const eventos = cliente.eventos && Array.isArray(cliente.eventos) ? cliente.eventos : [];

    // Remove eventos duplicados
    const uniqueEventos = Array.from(new Set(eventos.map((evento: any) => JSON.stringify(evento)))).map(e => JSON.parse(e));

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#40FF01" />
                    <Text style={styles.backButtonText}>Voltar</Text>
                </TouchableOpacity>
                <Text style={styles.title}>{cliente.nome}</Text>
            </View>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <Text style={styles.sectionTitle}>Eventos:</Text>
                {uniqueEventos.length > 0 ? (
                    uniqueEventos.map((evento: EventDTO, index: number) => {
                        const employeeName = employees.find(e => e.id === evento.employee)?.nome || 'Desconhecido';
                        return (
                            <View key={index} style={styles.eventContainer}>
                                <Text style={styles.eventText}>Título: {evento.title}</Text>
                                <Text style={styles.eventText}>Data: {evento.date}</Text>
                                <Text style={styles.eventText}>Hora: {evento.time}</Text>
                                <Text style={styles.eventText}>Responsável: {employeeName}</Text>
                            </View>
                        );
                    })
                ) : (
                    <Text style={styles.noEventText}>Nenhum evento registrado.</Text>
                )}
            </ScrollView>
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
        flex: 1,
    },
    scrollViewContent: {
        paddingBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#000',
    },
    eventContainer: {
        padding: 15,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#40FF01',
    },
    eventText: {
        fontSize: 16,
        color: '#000',
    },
    noEventText: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        marginTop: 20,
    },
});
