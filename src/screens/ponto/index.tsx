import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../auth/AuthProvider';
import { addPonto, getPontos } from '../../../firestore/Ponto/pontoController';
import { PontoDTO } from '../../../firestore/Ponto/pontoDTO';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const empresaLatitude = -16.704231734087685;
const empresaLongitude = -49.23995908831295;

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
    const [loading, setLoading] = useState(true);

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

        fetchLocation().then(() => setLoading(false));
        fetchPontos();
    }, [user?.uid]);

    const verificarHorarioPermitido = (horarioAtual: Date, tipoPonto: TipoPonto) => {
        const horaAtual = horarioAtual.getHours();
        const minutosAtual = horarioAtual.getMinutes();
        const horario = HORARIOS[tipoPonto];
        const inicioPermitido = horario.hora;
        const fimPermitido = inicioPermitido + Math.floor(horario.tolerancia / 60);
        const minutosTolerancia = horario.tolerancia % 60;

        if (horaAtual < inicioPermitido) {
            return { permitido: false, mensagem: `Você só pode bater o ponto às ${inicioPermitido}:00` };
        } else if (horaAtual > fimPermitido || (horaAtual === fimPermitido && minutosAtual > minutosTolerancia)) {
            const mensagem = tipoPonto === 'retorno' ? 'Ponto de retorno almoço: você está atrasado' : `Ponto de ${tipoPonto}: você está atrasado`;
            return { permitido: true, atrasado: true, mensagem };
        }
        return { permitido: true, atrasado: false, mensagem: 'Ponto registrado com sucesso' };
    };

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const toRadians = (deg: number) => deg * (Math.PI / 180);
        const R = 6371e3; // Earth radius in meters
        const φ1 = toRadians(lat1);
        const φ2 = toRadians(lat2);
        const Δφ = toRadians(lat2 - lat1);
        const Δλ = toRadians(lon2 - lon1);

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const distance = R * c; // in meters
        return distance;
    };

    const isAtCompanyLocation = (currentLocation: Location.LocationObjectCoords) => {
        const distance = calculateDistance(
            currentLocation.latitude,
            currentLocation.longitude,
            empresaLatitude,
            empresaLongitude
        );

        return distance <= 50; // 50 meters tolerance
    };

    const handleBaterPonto = async () => {
        if (!location) return;

        if (!isAtCompanyLocation(location.coords)) {
            Alert.alert("Aviso", "Você precisa estar na localização da empresa para bater o ponto.");
            return;
        }

        const horarioAtual = new Date();
        let tipoPonto: TipoPonto;

        if (horarioAtual.getHours() >= 9 && horarioAtual.getHours() < 12) {
            tipoPonto = 'entrada';
        } else if (horarioAtual.getHours() === 12) {
            tipoPonto = 'almoco';
        } else if (horarioAtual.getHours() >= 14 && horarioAtual.getHours() < 18) {
            tipoPonto = 'retorno';
        } else if (horarioAtual.getHours() === 18) {
            tipoPonto = 'saida';
        } else {
            Alert.alert("Aviso", "Horário inválido para bater ponto.");
            return;
        }

        const jaBateuPonto = pontos.some(ponto => {
            const pontoDate = new Date(ponto.horario);
            return pontoDate.toDateString() === horarioAtual.toDateString() && ponto.type === tipoPonto;
        });

        if (jaBateuPonto) {
            Alert.alert("Aviso", "Você já bateu este ponto hoje.");
            return;
        }

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
            atrasado: atrasado,
            location: location.coords
        };

        await addPonto(novoPonto);
        setPontos([...pontos, novoPonto]);
        Alert.alert(atrasado ? "Atraso" : "Sucesso", mensagem);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#40FF01" />
            </View>
        );
    }

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
            <TouchableOpacity onPress={handleBaterPonto} style={styles.pontoButton}>
                <Text style={styles.pontoButtonText}>Bater Ponto</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('PontosBatidos')} style={styles.verPontosButton}>
                <Text style={styles.verPontosButtonText}>Ver Pontos</Text>
            </TouchableOpacity>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    verPontosButton: {
        backgroundColor: '#000',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    verPontosButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
