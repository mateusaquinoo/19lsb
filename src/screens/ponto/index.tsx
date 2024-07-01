import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../auth/AuthProvider';
import { addPonto, getPontos } from '../../../firestore/Ponto/pontoController';
import { PontoDTO } from '../../../firestore/Ponto/pontoDTO';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FlatList } from 'react-native-gesture-handler';

const empresaLatitude = -16.7063946;
const empresaLongitude = -49.2382167;

type TipoPonto = 'entrada' | 'almoco' | 'retorno' | 'saida';

const HORARIOS = {
    entrada: { hora: 9, tolerancia: 15 },
    almoco: { hora: 12, tolerancia: 0 },
    retorno: { hora: 14, tolerancia: 15 },
    saida: { hora: 18, tolerancia: 0 }
};

export default function Ponto() {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [pontos, setPontos] = useState<PontoDTO[]>([]);

    useEffect(() => {
        const fetchLocation = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permissão de localização negada');
                return;
            }
            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
        };

        const fetchPontos = async () => {
            if (user?.uid) {
                const fetchedPontos = await getPontos(user.uid);
                setPontos(fetchedPontos);
            }
        };

        fetchLocation();
        fetchPontos();
    }, [user?.uid]);

    const verificarHorarioPermitido = (horarioAtual: Date, tipoPonto: TipoPonto) => {
        const horaAtual = horarioAtual.getHours();
        const minutosAtual = horarioAtual.getMinutes();
        const horario = HORARIOS[tipoPonto];
        const inicioPermitido = horario.hora;
        const fimPermitido = inicioPermitido + (horario.tolerancia / 60);

        if (horaAtual < inicioPermitido) {
            return { permitido: false, mensagem: "Você só pode bater o ponto às " + inicioPermitido + ":00" };
        } else if (horaAtual > fimPermitido || (horaAtual === fimPermitido && minutosAtual > 0)) {
            return { permitido: true, atrasado: true, mensagem: "Você está atrasado" };
        }
        return { permitido: true, atrasado: false, mensagem: "Ponto registrado com sucesso" };
    };

    const handleBaterPonto = async (tipoPonto: TipoPonto) => {
        if (!location) return;

        const horarioAtual = new Date();
        const { permitido, atrasado, mensagem } = verificarHorarioPermitido(horarioAtual, tipoPonto);

        if (!permitido) {
            Alert.alert("Aviso", mensagem);
            return;
        }

        const novoPonto: PontoDTO = {
            userId: user?.uid ?? '',
            horario: horarioAtual.toISOString(),
            localizacao: location.coords,
            time: horarioAtual,
            type: tipoPonto,
            atrasado:   atrasado,
            location: location.coords
        };

        await addPonto(novoPonto);
        setPontos([...pontos, novoPonto]);
        Alert.alert(atrasado ? "Atraso" : "Sucesso", mensagem);
    };


    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#40FF01" />
                    <Text style={styles.backButtonText}>Voltar</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.title}>Bater Ponto</Text>
            <Text style={styles.subtitle}>Localização da Empresa</Text>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: empresaLatitude,
                    longitude: empresaLongitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
            >
                <Marker
                    coordinate={{ latitude: empresaLatitude, longitude: empresaLongitude }}
                    title="Empresa"
                    description="Localização da Empresa"
                />
            </MapView>
            <Text style={styles.subtitle}>Sua Localização</Text>
            <MapView
                style={styles.map}
                region={{
                    latitude: location?.coords.latitude || 0,
                    longitude: location?.coords.longitude || 0,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
                showsUserLocation={true}
            >
                {location && (
                    <Marker
                        coordinate={{
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                        }}
                        title="Você está aqui"
                    />
                )}
            </MapView>
            <TouchableOpacity onPress={() => handleBaterPonto('entrada')} style={styles.pontoButton}>
                <Text style={styles.pontoButtonText}>Bater Ponto de Entrada</Text>
            </TouchableOpacity>
            <FlatList
                data={pontos}
                keyExtractor={(item) => item.horario}
                renderItem={({ item }) => (
                    <View style={styles.pontoContainer}>
                        <Text style={styles.pontoText}>Horário: {new Date(item.horario).toLocaleString()}</Text>
                        <Text style={styles.pontoText}>Localização: {item.localizacao.latitude}, {item.localizacao.longitude}</Text>
                        <Text style={styles.pontoText}>Status: {item.atrasado ? "Atrasado" : "No Horário"}</Text>
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
    },
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#000',
    },
    map: {
        width: '100%',
        height: 200,
        marginBottom: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#40FF01',
    },
    pontoButton: {
        backgroundColor: '#40FF01',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
    },
    pontoButtonText: {
        color: '#fff',
        fontWeight: 'bold',
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
});
