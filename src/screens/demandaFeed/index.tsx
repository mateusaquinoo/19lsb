import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getEventos } from '../../../firestore/Calendario/eventoController';
import { EventoDTO } from '../../../firestore/Calendario/eventoDTO';
import { getFuncionarios } from '../../../firestore/Funcionarios/funcionariosController';
import { FuncionarioDTO } from '../../../firestore/Funcionarios/funcionariosDTO';

export default function DemandasFeed() {
    const navigation = useNavigation();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [events, setEvents] = useState<EventoDTO[]>([]);
    const [funcionarios, setFuncionarios] = useState<{ nome: string | undefined; id: string; }[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const eventosList = await getEventos();
            const filteredEvents = eventosList.filter(event =>
                new Date(event.date).toLocaleDateString() === selectedDate.toLocaleDateString()
            );
            setEvents(filteredEvents);

            const fetchedFuncionarios = await getFuncionarios();
            const formattedFuncionarios = fetchedFuncionarios.map(funcionario => ({
                nome: funcionario.nome,
                id: funcionario.id ?? ''
            }));
            setFuncionarios(formattedFuncionarios);
        };

        fetchData();
    }, [selectedDate]);

    const handlePreviousDay = () => {
        setSelectedDate(prevDate => new Date(prevDate.setDate(prevDate.getDate() - 1)));
    };

    const handleNextDay = () => {
        setSelectedDate(prevDate => new Date(prevDate.setDate(prevDate.getDate() + 1)));
    };

    const getEmployeeName = (employeeId: string) => {
        const employee = funcionarios.find(f => f.id === employeeId);
        return employee ? employee.nome : employeeId;
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
            <View style={styles.dateNavigation}>
                <TouchableOpacity onPress={handlePreviousDay} style={styles.navigationButton}>
                    <MaterialCommunityIcons name="chevron-left" size={24} color="#40FF01" />
                </TouchableOpacity>
                <Text style={styles.dateText}>{selectedDate.toLocaleDateString()}</Text>
                <TouchableOpacity onPress={handleNextDay} style={styles.navigationButton}>
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#40FF01" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={events}
                keyExtractor={(item) => item.id ?? ''}
                renderItem={({ item }) => (
                    <View style={styles.eventContainer}>
                        <Text style={styles.eventTitle}>Título: {item.title}</Text>
                        <Text style={styles.eventDetails}>Cliente: {item.client}</Text>
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
        marginTop: 10, // Adicione uma margem superior para ajustar o espaço
    },
    dateNavigation: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    navigationButton: {
        padding: 10,
    },
    dateText: {
        fontSize: 18,
        fontWeight: 'bold',
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
