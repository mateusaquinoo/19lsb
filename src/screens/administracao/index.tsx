import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PontoDTO } from '../../../firestore/Ponto/pontoDTO';
import { FuncionarioDTO } from '../../../firestore/Funcionarios/funcionariosDTO';
import { getFuncionarios } from '../../../firestore/Funcionarios/funcionariosController';
import { getPontos } from '../../../firestore/Ponto/pontoController';

type FiltroPonto = 'todos' | 'atrasados' | 'no prazo';

export default function GerenciarPontos() {
    const navigation = useNavigation();
    const [funcionarios, setFuncionarios] = useState<FuncionarioDTO[]>([]);
    const [selectedFuncionario, setSelectedFuncionario] = useState<string>('');
    const [pontos, setPontos] = useState<PontoDTO[]>([]);
    const [filteredPontos, setFilteredPontos] = useState<PontoDTO[]>([]);
    const [filtro, setFiltro] = useState<FiltroPonto>('todos');

    useEffect(() => {
        const fetchFuncionarios = async () => {
            const fetchedFuncionarios = await getFuncionarios();
            setFuncionarios(fetchedFuncionarios);
        };

        fetchFuncionarios();
    }, []);

    useEffect(() => {
        const fetchPontos = async () => {
            if (selectedFuncionario) {
                const fetchedPontos = await getPontos(selectedFuncionario);
                setPontos(fetchedPontos);
                filterPontos('todos');
            }
        };

        fetchPontos();
    }, [selectedFuncionario]);

    const filterPontos = (filtro: FiltroPonto) => {
        setFiltro(filtro);
        switch (filtro) {
            case 'atrasados':
                setFilteredPontos(pontos.filter(ponto => ponto.atrasado));
                break;
            case 'no prazo':
                setFilteredPontos(pontos.filter(ponto => !ponto.atrasado));
                break;
            default:
                setFilteredPontos(pontos);
                break;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#40FF01" />
                    <Text style={styles.backButtonText}>Voltar</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.title}>Gerenciar Pontos</Text>
            <Picker
                selectedValue={selectedFuncionario}
                onValueChange={(itemValue) => setSelectedFuncionario(itemValue)}
                style={styles.picker}
            >
                {funcionarios.map(funcionario => (
                    <Picker.Item key={funcionario.id} label={funcionario.nome} value={funcionario.id} />
                ))}
            </Picker>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={() => filterPontos('todos')}>
                    <Text style={styles.buttonText}>Todos os Pontos</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => filterPontos('atrasados')}>
                    <Text style={styles.buttonText}>Pontos em Atraso</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => filterPontos('no prazo')}>
                    <Text style={styles.buttonText}>Pontos no Prazo</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView}>
                {filteredPontos.map(ponto => (
                    <View key={ponto.id} style={styles.pontoItem}>
                        <Text>Data e Hora: {new Date(ponto.horario).toLocaleString()}</Text>
                        <Text>Status: {ponto.atrasado ? 'Atrasado' : 'No Prazo'}</Text>
                    </View>
                ))}
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
        textAlign: 'center',
    },
    picker: {
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#40FF01',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
    },
    scrollView: {
        flex: 1,
    },
    pontoItem: {
        padding: 15,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#40FF01',
    },
});
