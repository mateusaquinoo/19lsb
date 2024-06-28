import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { getEventos } from '../../../firestore/Calendario/eventoController';
import { EventoDTO } from '../../../firestore/Calendario/eventoDTO';
import { getFuncionarios } from '../../../firestore/Funcionarios/funcionariosController';
import { getClients } from '../../../firestore/Cliente/clienteController';
import { ClientDTO } from '../../../firestore/Cliente/clienteDTO';

export default function DemandasFeed() {
    const navigation = useNavigation();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [events, setEvents] = useState<EventoDTO[]>([]);
    const [funcionarios, setFuncionarios] = useState<{ nome: string; id: string }[]>([]);
    const [clientes, setClientes] = useState<{ nome: string; id: string }[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const eventosList = await getEventos();
            const filteredEvents = eventosList.filter(event => event.date === selectedDate);
            setEvents(filteredEvents);

            const fetchedFuncionarios = await getFuncionarios();
            const formattedFuncionarios = fetchedFuncionarios.map(funcionario => ({
                nome: funcionario.nome,
                id: funcionario.id ?? '',
            }));
            setFuncionarios(formattedFuncionarios);

            const fetchedClientes = await getClients();
            const formattedClientes = fetchedClientes.map(cliente => ({
                nome: cliente.nome,
                id: cliente.id ?? '',
            }));
            setClientes(formattedClientes);

            console.log('Fetched employees:', formattedFuncionarios);
            console.log('Fetched events:', filteredEvents);
            console.log('Fetched clients:', formattedClientes);
        };

        fetchData();
    }, [selectedDate]);

    const handleDayPress = (day: any) => {
        setSelectedDate(day.dateString);
    };

    const getEmployeeName = (employeeId: string) => {
        const employee = funcionarios.find(f => f.id === employeeId);
        console.log(`Employee ID: ${employeeId}, Found Employee: ${employee?.nome ?? 'Desconhecido'}`);
        return employee ? employee.nome : 'Desconhecido';
    };

    const getClientName = (clientId: string) => {
        const client = clientes.find(c => c.id === clientId);
        console.log(`Client ID: ${clientId}, Found Client: ${client?.nome ?? clientId}`);
        return client ? client.nome : clientId;
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#40FF01" />
                    <Text style={styles.backButtonText}>Voltar</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.title}>Calendário</Text>

            <Calendar
                onDayPress={handleDayPress}
                markedDates={{
                    [selectedDate]: {
                        selected: true,
                        selectedColor: '#40FF01',
                    },
                }}
                theme={{
                    selectedDayBackgroundColor: '#40FF01',
                    todayTextColor: '#40FF01',
                }}
            />

            <FlatList
                data={events}
                keyExtractor={(item) => item.id ?? ''}
                renderItem={({ item }) => (
                    <View style={styles.eventContainer}>
                        <Text style={styles.eventTitle}>Título: {item.title}</Text>
                        <Text style={styles.eventDetails}>Cliente: {getClientName(item.client)}</Text>
                        <Text style={styles.eventDetails}>Funcionário: {getEmployeeName(item.employee)}</Text>
                        <Text style={styles.eventDetails}>Hora: {item.time}</Text>
                    </View>
                )}
                ListEmptyComponent={<Text style={styles.noEventText}>Nenhum compromisso para o dia.</Text>}
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
        color: '#000',
        alignSelf: 'center',
        marginTop: 10,
    },
    eventContainer: {
        padding: 15,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#40FF01',
    },
    eventTitle: {
        fontSize: 18,
        color: '#000',
        marginBottom: 5,
    },
    eventDetails: {
        fontSize: 16,
        color: '#555',
    },
    noEventText: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        marginTop: 20,
    },
});
