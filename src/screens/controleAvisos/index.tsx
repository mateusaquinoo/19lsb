import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAvisosByEmployee, getAllEmployees } from '../../../firestore/Avisos/avisoController';
import { AvisoDTO } from '../../../firestore/Avisos/avisoDTO';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Modalize } from 'react-native-modalize';

export default function GerenciarAvisos() {
    const navigation = useNavigation();
    const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
    const [employees, setEmployees] = useState<{ id: string , nome: string}[]>([]);
    const [avisos, setAvisos] = useState<AvisoDTO[]>([]);
    const [filter, setFilter] = useState<'pendentes' | 'concluidos'>('pendentes');
    const employeePickerRef = useRef<Modalize>(null);

    useEffect(() => {
        const fetchEmployees = async () => {
            const employeesList = await getAllEmployees();
            console.log('Fetched employees:', employeesList);
            setEmployees(employeesList);
        };

        fetchEmployees();
    }, []);

    useEffect(() => {
        const fetchAvisos = async () => {
            if (selectedEmployee) {
                const avisosList = await getAvisosByEmployee(selectedEmployee);
                console.log('Avisos list for employee:', avisosList); // Log dos avisos
                setAvisos(avisosList);
            }
        };

        fetchAvisos();
    }, [selectedEmployee]);

    const openEmployeePicker = () => {
        employeePickerRef.current?.open();
    };

    const renderAviso = ({ item }: { item: AvisoDTO }) => (
        <View style={[
            styles.avisoContainer,
            { borderColor: item.completed ? 'green' : 'red' }
        ]}>
            <Text style={styles.avisoTitle}>Título: {item.title}</Text>
            <Text style={styles.avisoDetails}>Cliente: {item.client}</Text>
            <Text style={styles.avisoDetails}>Data: {item.date}</Text>
            <Text style={styles.avisoDetails}>Hora: {item.time}</Text>
            <Text style={[
                styles.avisoDetails,
                { color: item.completed ? 'green' : 'red' }
            ]}>
                Status: {item.completed ? 'Concluído' : 'Pendente'}
            </Text>
        </View>
    );

    const filteredAvisos = avisos.filter(aviso => 
        filter === 'pendentes' ? !aviso.completed : aviso.completed
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#40FF01" />
                    <Text style={styles.backButtonText}>Voltar</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.title}>Controle de Demandas</Text>

            <TouchableOpacity onPress={openEmployeePicker} style={styles.pickerButton}>
                <Text style={styles.pickerButtonText}>
                    {selectedEmployee ? employees.find(e => e.id === selectedEmployee)?.nome : 'Selecione um responsável'}
                </Text>
            </TouchableOpacity>

            {selectedEmployee && (
                <View style={styles.filterContainer}>
                    <TouchableOpacity 
                        onPress={() => setFilter('pendentes')} 
                        style={[
                            styles.filterButtonPendentes, 
                            filter === 'pendentes' && styles. filterButtonActivePendente
                        ]}
                    >
                        <Text style={styles.filterButtonTextPendente}>Pendentes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => setFilter('concluidos')} 
                        style={[
                            styles.filterButton, 
                            filter === 'concluidos' && styles.filterButtonActive
                        ]}
                    >
                        <Text style={styles.filterButtonText}>Concluídos</Text>
                    </TouchableOpacity>
                </View>
            )}

            <FlatList
                data={filteredAvisos}
                keyExtractor={item => item.id ?? ''}
                renderItem={renderAviso}
                ListEmptyComponent={<Text style={styles.noAvisoText}>Nenhum aviso {filter === 'pendentes' ? 'pendente' : 'concluído'} encontrado.</Text>}
                showsVerticalScrollIndicator={false}
            />

            <Modalize ref={employeePickerRef} adjustToContentHeight>
                <View style={{ padding: 20 }}>
                    {employees.map((employee) => (
                        <TouchableOpacity
                            key={employee.id}
                            onPress={() => {
                                setSelectedEmployee(employee.id);
                                employeePickerRef.current?.close();
                            }}
                            style={styles.pickerItem}
                        >
                            <Text style={styles.pickerItemText}>{employee.nome}</Text>
                        </TouchableOpacity>
                    ))}
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
        textAlign: 'center',
    },
    pickerButton: {
        borderWidth: 1,
        borderColor: '#40FF01',
        padding: 10,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: '#f0f0f0',
        marginTop: 10,
    },
    pickerButtonText: {
        color: '#555',
        fontSize: 16,
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    filterButton: {
        padding: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#40FF01',
        backgroundColor: '#f0f0f0',
    },

    filterButtonPendentes: {
        padding: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'red',
        backgroundColor: '#f0f0f0',
    },

    filterButtonActive: {
        backgroundColor: '#40FF01',
    },

    filterButtonActivePendente: {
        backgroundColor: 'red',
    },

    filterButtonText: {
        color: 'black',
        fontSize: 16,
    },

    filterButtonTextPendente: {
        color: 'black',
        fontSize: 16,
    },

    avisoContainer: {
        padding: 15,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
    },
    avisoTitle: {
        fontSize: 18,
        color: '#000',
        marginBottom: 5,
    },
    avisoDetails: {
        fontSize: 16,
    },
    noAvisoText: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        marginTop: 20,
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
