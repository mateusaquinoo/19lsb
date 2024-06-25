import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Calendar, DateData } from 'react-native-calendars';
import { Modalize } from 'react-native-modalize';
import { TextInput } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { addEvento, getEventos } from '../../../firestore/Calendario/eventoController';
import { EventoDTO } from '../../../firestore/Calendario/eventoDTO';
import { addAviso } from '../../../firestore/Avisos/avisoController';
import { AvisoDTO } from '../../../firestore/Avisos/avisoDTO';

export default function Calendario() {
    const navigation = useNavigation();
    const [selectedDate, setSelectedDate] = useState('');
    const [title, setTitle] = useState('');
    const [client, setClient] = useState('');
    const [employee, setEmployee] = useState('');
    const [time, setTime] = useState('');
    const [clients, setClients] = useState<{ nome: string | undefined; id: string; }[]>([]);
    const [employees, setEmployees] = useState<{ nome: string | undefined; id: string; }[]>([]);
    const [events, setEvents] = useState<{ [key: string]: any }>({});
    const [allEvents, setAllEvents] = useState<EventoDTO[]>([]);
    const modalizeRef = useRef<Modalize>(null);
    const clientPickerRef = useRef<Modalize>(null);
    const employeePickerRef = useRef<Modalize>(null);

    useEffect(() => {
        const fetchData = async () => {
            const clientsSnapshot = await getDocs(collection(db, 'clientes'));
            const clientsList = clientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as { nome: string | undefined; id: string; }[];
            setClients(clientsList);

            const employeesSnapshot = await getDocs(collection(db, 'funcionarios'));
            const employeesList = employeesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as { nome: string | undefined; id: string; }[];
            setEmployees(employeesList);

            const eventosList = await getEventos();
            const eventosFormatted = eventosList.reduce<{ [key: string]: any }>((acc, evento) => {
                if (!acc[evento.date]) {
                    acc[evento.date] = { marked: true, dotColor: 'red', events: [] };
                }
                acc[evento.date].events.push(evento);
                return acc;
            }, {});
            setEvents(eventosFormatted);
            setAllEvents(eventosList);
        };

        fetchData();
    }, []);

    const handleDayPress = (day: DateData) => {
        const today = new Date().setHours(0, 0, 0, 0);
        const selected = new Date(day.timestamp).setHours(0, 0, 0, 0);

        if (selected >= today) {
            setSelectedDate(day.dateString);
            modalizeRef.current?.open();
        }
    };

    const handleAddEvent = async () => {
        const newEvent: EventoDTO = {
            title,
            client,
            employee,
            date: selectedDate,
            time,
            createdAt: new Date(),
        };

        await addEvento(newEvent);

        setEvents({
            ...events,
            [selectedDate]: { marked: true, dotColor: 'red', events: [...(events[selectedDate]?.events || []), newEvent] }
        });

        setAllEvents([...allEvents, newEvent]);

        const newAviso: AvisoDTO = {
            title,
            employeeId: employee,
            date: selectedDate,
            time,
            createdAt: new Date(),
            client: clients.find(c => c.id === client)?.nome || '',
        };

        await addAviso(newAviso);

        setTitle('');
        setClient('');
        setEmployee('');
        setTime('');
        modalizeRef.current?.close();
    };

    const openClientPicker = () => {
        clientPickerRef.current?.open();
    };

    const openEmployeePicker = () => {
        employeePickerRef.current?.open();
    };

    const today = new Date().toISOString().split('T')[0];
    const markedDates = {
        ...events,
        [selectedDate]: {
            selected: true,
            selectedColor: 'green',
            events: events[selectedDate]?.events || []
        },
        ...Object.keys(events).reduce<{ [key: string]: any }>((acc, date) => {
            const isPast = new Date(date).getTime() < new Date().setHours(0, 0, 0, 0);
            acc[date] = {
                ...events[date],
                customStyles: {
                    container: {
                        backgroundColor: isPast ? '#d3d3d3' : 'white',
                        opacity: isPast ? 0.5 : 1
                    },
                    text: {
                        color: isPast ? '#a9a9a9' : 'black',
                    },
                }
            };
            return acc;
        }, {}),
        [today]: {
            ...events[today],
            customStyles: {
                container: {
                    backgroundColor: 'green',
                },
                text: {
                    color: 'white',
                },
            },
        },
    };

    return (
        <View style={{ flex: 1, paddingHorizontal: 20, paddingVertical: 80, backgroundColor: 'white' }}>
            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#40FF01" />
                    <Text style={{ marginLeft: 10, fontSize: 24, fontWeight: "bold", color: "#000" }}>Voltar</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.calendarContainer}>
                <Calendar
                    onDayPress={handleDayPress}
                    markedDates={markedDates}
                    theme={{
                        'stylesheet.calendar.header': {
                            week: {
                                marginTop: 5,
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                            },
                        },
                    }}
                    dayComponent={({ date }: { date: DateData }) => {
                        const isPast = new Date(date.dateString).getTime() < new Date().setHours(0, 0, 0, 0);
                        const isToday = date.dateString === today;
                        const isSelected = date.dateString === selectedDate;
                        return (
                            <TouchableOpacity onPress={() => handleDayPress(date)} disabled={isPast && !isToday}>
                                <View style={[styles.dayContainer, isPast && styles.pastDay, isToday && styles.today, isSelected && styles.selectedDay]}>
                                    <Text style={[styles.dayText, isPast && styles.pastDayText, isToday && styles.todayText, isSelected && styles.selectedDayText]}>
                                        {date.day}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
                {allEvents.length > 0 ? (
                    allEvents.map((event, index) => (
                        <View key={index} style={styles.eventContainer}>
                            <Text style={styles.eventTitle}>Título: {event.title}</Text>
                            <Text style={styles.eventDetails}>Cliente: {clients.find(c => c.id === event.client)?.nome}</Text>
                            <Text style={styles.eventDetails}>Funcionário: {employees.find(e => e.id === event.employee)?.nome}</Text>
                            <View style={styles.eventFooter}>
                                <Text style={styles.eventDate}>Data: {event.date}</Text>
                                <Text style={styles.eventTime}>Hora: {event.time}</Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text style={styles.noEventText}>Nenhum evento agendado.</Text>
                )}
            </ScrollView>

            <Modalize ref={modalizeRef} adjustToContentHeight>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Adicionar Evento</Text>
                    <TextInput
                        placeholder="Título"
                        value={title}
                        onChangeText={setTitle}
                        style={styles.input}
                    />
                    <TouchableOpacity onPress={openClientPicker} style={styles.pickerButton}>
                        <Text style={styles.pickerButtonText}>{client ? clients.find(c => c.id === client)?.nome : 'Selecione o Cliente'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={openEmployeePicker} style={styles.pickerButton}>
                        <Text style={styles.pickerButtonText}>{employee ? employees.find(e => e.id === employee)?.nome : 'Selecione o Responsável'}</Text>
                    </TouchableOpacity>
                    <TextInput
                        placeholder="Hora"
                        value={time}
                        onChangeText={setTime}
                        style={styles.input}
                    />
                    <TouchableOpacity onPress={handleAddEvent} style={styles.addButton}>
                        <Text style={styles.addButtonText}>Adicionar</Text>
                    </TouchableOpacity>
                </View>
            </Modalize>

            <Modalize ref={clientPickerRef} adjustToContentHeight>
                <ScrollView contentContainerStyle={{ padding: 20 }}>
                    {clients.map((client) => (
                        <TouchableOpacity
                            key={client.id}
                            onPress={() => {
                                setClient(client.id);
                                clientPickerRef.current?.close();
                            }}
                            style={styles.pickerItem}
                        >
                            <Text style={styles.pickerItemText}>{client.nome}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </Modalize>

            <Modalize ref={employeePickerRef} adjustToContentHeight>
                <ScrollView contentContainerStyle={{ padding: 20 }}>
                    {employees.map((employee) => (
                        <TouchableOpacity
                            key={employee.id}
                            onPress={() => {
                                setEmployee(employee.id);
                                employeePickerRef.current?.close();
                            }}
                            style={styles.pickerItem}
                        >
                            <Text style={styles.pickerItemText}>{employee.nome}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </Modalize>
        </View>
    );
}

const styles = StyleSheet.create({
    calendarContainer: {
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 10,
        overflow: 'hidden',
        marginTop: 20,
    },
    dayContainer: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
    },
    dayText: {
        fontSize: 16,
    },
    pastDay: {
        backgroundColor: '#d3d3d3',
        opacity: 0.5,
    },
    pastDayText: {
        color: '#a9a9a9',
    },
    today: {
        backgroundColor: 'green',
    },
    todayText: {
        color: 'black',
    },
    selectedDay: {
        backgroundColor: 'green',
    },
    selectedDayText: {
        color: 'white',
    },
    scrollView: {
        marginTop: 20,
        flexGrow: 1,
    },
    scrollViewContent: {
        paddingBottom: 20, // Adiciona espaço para evitar corte
    },
    eventContainer: {
        padding: 15,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#40FF01",
    },
    eventTitle: {
        fontSize: 18,
        color: '#000',
        marginBottom: 5,
    },
    eventDetails: {
        fontSize: 16,
        color: '#555',
        marginBottom: 5,
    },
    eventFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    eventDate: {
        fontSize: 16,
        color: '#555',
    },
    eventTime: {
        fontSize: 16,
        color: '#555',
    },
    noEventText: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        marginTop: 20,
    },
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
    pickerButton: {
        borderWidth: 1,
        marginBottom: 10,
        padding: 10,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    pickerButtonText: {
        color: '#555',
    },
    addButton: {
        backgroundColor: '#40FF01',
        padding: 15,
        borderRadius: 10,
    },
    addButtonText: {
        textAlign: 'center',
        color: '#fff',
        fontWeight: 'bold',
    },
    cancelButton: {
        marginTop: 10,
        backgroundColor: '#ccc',
        padding: 15,
        borderRadius: 10,
    },
    cancelButtonText: {
        textAlign: 'center',
        color: '#fff',
        fontWeight: 'bold',
    },
    pickerItem: {
        borderWidth: 1,
        marginBottom: 20,
        padding: 10,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    pickerItemText: {
        fontSize: 18,
    },
});
