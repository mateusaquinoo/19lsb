import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAvisosByEmployee } from '../../../firestore/Avisos/avisoController';
import { AvisoDTO } from '../../../firestore/Avisos/avisoDTO';
import { useAuth } from '../../auth/AuthProvider';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Avisos() {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [avisos, setAvisos] = useState<AvisoDTO[]>([]);

    useEffect(() => {
        const fetchAvisos = async () => {
            if (user) {
                const avisosList = await getAvisosByEmployee(user.uid);
                setAvisos(avisosList);
            }
        };

        fetchAvisos();
    }, [user]);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#40FF01" />
                    <Text style={styles.backButtonText}>Voltar</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.title}>Avisos</Text>
            <FlatList
                data={avisos}
                keyExtractor={item => item.id ?? ''}
                renderItem={({ item }) => (
                    <View style={styles.avisoContainer}>
                        <Text style={styles.avisoTitle}>Título: {item.title}</Text>
                        <Text style={styles.avisoDetails}>Cliente: {item.client}</Text>
                        <Text style={styles.avisoDetails}>Data: {item.date}</Text>
                        <Text style={styles.avisoDetails}>Hora: {item.time}</Text>
                    </View>
                )}
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
    avisoContainer: {
        padding: 15,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#40FF01',
    },
    avisoTitle: {
        fontSize: 18,
        color: '#000',
        marginBottom: 5,
    },
    avisoDetails: {
        fontSize: 16,
        color: '#555',
    },
});
