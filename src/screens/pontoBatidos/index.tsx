import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../auth/AuthProvider';
import { getPontos } from '../../../firestore/Ponto/pontoController';
import { PontoDTO } from '../../../firestore/Ponto/pontoDTO';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function PontosBatidos() {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [pontos, setPontos] = useState<PontoDTO[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPontos = async () => {
            if (user?.uid) {
                const fetchedPontos = await getPontos(user.uid);
                setPontos(fetchedPontos);
            }
            setLoading(false);
        };

        fetchPontos();
    }, [user?.uid]);

    if (loading) {
        return <Text>Carregando...</Text>;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#40FF01" />
                    <Text style={styles.backButtonText}>Voltar</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.title}>Pontos Batidos</Text>
            <FlatList
                data={pontos}
                keyExtractor={(item) => item.horario}
                renderItem={({ item }) => (
                    <View style={styles.pontoContainer}>
                        <Text style={styles.pontoText}>Horário: {new Date(item.horario).toLocaleString()}</Text>
                        <Text style={styles.pontoText}>Localização: {item.localizacao.latitude}, {item.localizacao.longitude}</Text>
                        {item.atrasado && <Text style={styles.atrasoText}>Atrasado</Text>}
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
        marginBottom: 10,
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
    pontoContainer: {
        padding: 15,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#40FF01',
    },
    pontoText: {
        fontSize: 16,
        color: '#555',
    },
    atrasoText: {
        fontSize: 16,
        color: 'red',
    },
});
