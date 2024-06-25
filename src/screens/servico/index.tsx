import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Switch } from 'react-native';
import { FuncionarioDTO } from '../../../firestore/Funcionarios/funcionariosDTO';
import { getFuncionarios } from '../../../firestore/Funcionarios/funcionariosController';
import { ServicoDTO } from '../../../firestore/Servicos/servicosDTO';
import { addServico } from '../../../firestore/Servicos/servicoController';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function Servico() {
    const navigation = useNavigation();
    const [nome, setNome] = useState('');
    const [funcionarios, setFuncionarios] = useState<FuncionarioDTO[]>([]);
    const [selectedFuncionarios, setSelectedFuncionarios] = useState<string[]>([]);

    useEffect(() => {
        const fetchFuncionarios = async () => {
            try {
                const fetchedFuncionarios = await getFuncionarios();
                setFuncionarios(fetchedFuncionarios);
            } catch (error) {
                console.error("Erro ao buscar funcionários:", error);
            }
        };
        fetchFuncionarios();
    }, []);

    const toggleFuncionario = (funcionarioId: string) => {
        if (selectedFuncionarios.includes(funcionarioId)) {
            setSelectedFuncionarios(selectedFuncionarios.filter(id => id !== funcionarioId));
        } else {
            setSelectedFuncionarios([...selectedFuncionarios, funcionarioId]);
        }
    };

    const handleAddServico = async () => {
        const newServico: ServicoDTO = {
            nome,
            funcionariosResponsaveis: selectedFuncionarios
        };
        await addServico(newServico);
        setNome('');
        setSelectedFuncionarios([]);
    };

    return (
        <View style={{
            flex: 1,
            paddingHorizontal: 20,
            paddingVertical: 80,
            backgroundColor: '#fff'
        }}>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 20
                }}
            >
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}
                >
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#40FF01" />
                    <Text
                        style={{
                            marginLeft: 10,
                            fontSize: 24,
                            fontWeight: 'bold',
                            color: '#000',
                        }}
                    >
                        Menu
                    </Text>
                </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Adicionar Serviço</Text>

            <TextInput
                placeholder="Nome do Serviço"
                value={nome}
                onChangeText={setNome}
                style={{
                    borderWidth: 1,
                    marginBottom: 10,
                    padding: 10,
                    borderRadius: 5
                }}
            />

            <Text style={{ marginBottom: 10, fontWeight: 'bold' }}>Funcionários Responsáveis</Text>
            <FlatList
                data={funcionarios}
                keyExtractor={(item) => item.id ?? ''}
                renderItem={({ item }) => (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <Text>{item.nome} - {item.cargo}</Text>
                        {item.id && (
                            <Switch
                                value={selectedFuncionarios.includes(item.id)}
                                onValueChange={() => toggleFuncionario(item.id!)}
                            />
                        )}
                    </View>
                )}
            />

            <TouchableOpacity onPress={handleAddServico} style={{ backgroundColor: '#40FF01', padding: 15, borderRadius: 10, marginTop: 10 }}>
                <Text style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>Adicionar Serviço</Text>
            </TouchableOpacity>
        </View>
    );
}
