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

const empresaLatitude = -16.7063946; // Substitua pela latitude da empresa
const empresaLongitude = -49.2382167; // Substitua pela longitude da empresa

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

    const handleBaterPonto = async () => {
        if (!location) return;

        const distance = getDistanceFromLatLonInKm(
            empresaLatitude,
            empresaLongitude,
            location.coords.latitude,
            location.coords.longitude
        );

        if (distance > 0.1) { // Considerando 100 metros como limite para bater o ponto
            Alert.alert('Você está fora do alcance da empresa para bater o ponto');
            return;
        }

        const novoPonto: PontoDTO = {
            userId: user?.uid ?? '',
            horario: new Date().toISOString(),
            localizacao: {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            },
            time: new Date(),
            type: 'entrada',
            location: {
                latitude: 0,
                longitude: 0
            }
        };

        await addPonto(novoPonto);
        setPontos([...pontos, novoPonto]);
    };

    function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
        const R = 6371; // Raio da Terra em km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distância em km
        return d;
    }

    function deg2rad(deg: number) {
        return deg * (Math.PI / 180);
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
            <FlatList
                data={pontos}
                keyExtractor={(item) => item.horario}
                renderItem={({ item }) => (
                    <View style={styles.pontoContainer}>
                        <Text style={styles.pontoText}>Horário: {new Date(item.horario).toLocaleString()}</Text>
                        <Text style={styles.pontoText}>Localização: {item.localizacao.latitude}, {item.localizacao.longitude}</Text>
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
        textAlign: 'center',
        marginTop: 20,
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
