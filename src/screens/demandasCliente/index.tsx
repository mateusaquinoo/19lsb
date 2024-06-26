import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ClientDTO } from '../../../firestore/Cliente/clienteDTO';
import { db, storage } from '../../../config/firebase';
import { Modalize } from 'react-native-modalize';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { FuncionarioDTO } from '../../../firestore/Funcionarios/funcionariosDTO';
import { getFuncionarios } from '../../../firestore/Funcionarios/funcionariosController';
import { useAuth } from '../../auth/AuthProvider';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DemandaDTO } from '../../../firestore/Demanda/demandaDTO';
import { addDemanda, getDemandasByClient, updateDemanda } from '../../../firestore/Demanda/demandaController';

type RootStackParamList = {
    DemandaCliente: { cliente: ClientDTO };
};

type DemandaClienteRouteProp = RouteProp<RootStackParamList, 'DemandaCliente'>;

export default function DemandaCliente() {
    const navigation = useNavigation();
    const route = useRoute<DemandaClienteRouteProp>();
    const { cliente } = route.params;

    const { user } = useAuth();

    const [demandas, setDemandas] = useState<DemandaDTO[]>([]);
    const [titulo, setTitulo] = useState('');
    const [data, setData] = useState('');
    const [hora, setHora] = useState('');
    const [descricao, setDescricao] = useState('');
    const [responsavel, setResponsavel] = useState<{ nome: string; id: string }>({ nome: '', id: '' });
    const [arquivoUri, setArquivoUri] = useState('');
    const [funcionarios, setFuncionarios] = useState<{ nome: string | undefined; id: string; }[]>([]);
    const [uploading, setUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const modalizeRef = useRef<Modalize>(null);
    const pickerRef = useRef<Modalize>(null);
    const filePickerRef = useRef<Modalize>(null);

    useEffect(() => {
        const fetchFuncionarios = async () => {
            const fetchedFuncionarios = await getFuncionarios();
            const formattedFuncionarios = fetchedFuncionarios.map(funcionario => ({
                nome: funcionario.nome,
                id: funcionario.id ?? ''
            }));
            setFuncionarios(formattedFuncionarios);
        };

        const fetchDemandas = async () => {
            const fetchedDemandas = await getDemandasByClient(cliente.id);
            setDemandas(fetchedDemandas);
        };

        fetchFuncionarios();
        fetchDemandas();
    }, [cliente.id]);

    const handleAddOrUpdateDemanda = async () => {
        if (uploading) return;

        const novaDemanda: DemandaDTO = {
            titulo,
            data,
            hora,
            descricao,
            responsavel: user?.uid?? '',
            clienteId: cliente.id,
            arquivoUri,
            createdAt: new Date(),
        };

        if (isEditing && editingId) {
            await updateDemanda(editingId, novaDemanda);
            const updatedDemandas = demandas.map(demanda => demanda.id === editingId ? { ...demanda, ...novaDemanda } : demanda);
            setDemandas(updatedDemandas);
            setIsEditing(false);
            setEditingId(null);
        } else {
            await addDemanda(novaDemanda);
            setDemandas([...demandas, novaDemanda]);
        }

        setTitulo('');
        setData('');
        setHora('');
        setDescricao('');
        setResponsavel({ nome: '', id: '' });
        setArquivoUri('');
        modalizeRef.current?.close();
    };

    const openPicker = () => {
        pickerRef.current?.open();
    };

    const openFilePicker = () => {
        filePickerRef.current?.open();
    };

    const pickDocument = async () => {
        let result: any = await DocumentPicker.getDocumentAsync({ type: "*/*" });
        if (result.type === 'success') {
            await uploadFile(result.uri, result.name);
        } else {
            console.log('Document picker canceled');
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
            const imageUri = result.assets[0].uri;
            await uploadFile(imageUri, imageUri.split('/').pop() || 'image');
        } else {
            console.log('Image picker canceled');
        }
    };

    const uploadFile = async (uri: string, name: string) => {
        setUploading(true);
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const storageRef = ref(storage, `demandas/${name}`);
            const uploadTask = uploadBytesResumable(storageRef, blob);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`Upload is ${progress}% done`);
                },
                (error) => {
                    console.error('Upload error:', error);
                    Alert.alert('Erro', 'Ocorreu um erro ao fazer o upload do arquivo. Tente novamente.');
                    setUploading(false);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        setArquivoUri(downloadURL);
                        setUploading(false);
                        filePickerRef.current?.close();
                    }).catch((error) => {
                        console.error('Get download URL error:', error);
                        Alert.alert('Erro', 'Ocorreu um erro ao obter o URL do arquivo. Tente novamente.');
                        setUploading(false);
                    });
                }
            );
        } catch (error) {
            console.error('Fetch error:', error);
            Alert.alert('Erro', 'Ocorreu um erro ao processar o arquivo. Tente novamente.');
            setUploading(false);
        }
    };

    const handleEditDemanda = (demanda: DemandaDTO) => {
        setTitulo(demanda.titulo);
        setData(demanda.data);
        setHora(demanda.hora);
        setDescricao(demanda.descricao);
        setResponsavel({ nome: funcionarios.find(f => f.id === demanda.responsavel)?.nome || '', id: demanda.responsavel });
        setArquivoUri(demanda.arquivoUri?? '');
        setIsEditing(true);
        setEditingId(demanda.id ?? null);
        modalizeRef.current?.open();
    };

    return (
        <View style={{ flex: 1, paddingHorizontal: 20, paddingVertical: 80, backgroundColor: '#fff' }}>
            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#40FF01" />
                    <Text style={{ marginLeft: 10, fontSize: 24, fontWeight: "bold", color: "#000" }}>Voltar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => modalizeRef.current?.open()} style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                    <MaterialCommunityIcons name="plus" size={24} color="#40FF01" />
                    <Text style={{ marginLeft: 10, fontSize: 16, color: "#000" }}>Adicionar Demanda</Text>
                </TouchableOpacity>
            </View>
            <View style={{ marginTop: 20 }}>
                <Text style={{ fontSize: 28, fontWeight: 'bold' }}>{cliente.nome}</Text>
                <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, marginTop: 10 }}>Demandas:</Text>

                <FlatList
                    data={demandas}
                    keyExtractor={(item) => item.id ?? ''}
                    renderItem={({ item }) => (
                        <View style={{ padding: 15, backgroundColor: '#f0f0f0', borderRadius: 10, marginBottom: 10 }}>
                            <Text style={{ fontSize: 20, color: '#000', marginBottom: 5 }}>{item.titulo}</Text>
                            <Text style={{ fontSize: 16, color: '#555' }}>Data: {item.data}</Text>
                            <Text style={{ fontSize: 16, color: '#555' }}>Hora: {item.hora}</Text>
                            <Text style={{ fontSize: 16, color: '#555' }}>Descrição: {item.descricao}</Text>
                            <Text style={{ fontSize: 16, color: '#555' }}>Responsável: {funcionarios.find(f => f.id === item.responsavel)?.nome}</Text>
                            <Text style={{ fontSize: 16, color: '#555' }}>Criado em: {new Date(item.createdAt).toLocaleDateString()}</Text>
                            {item.arquivoUri && (
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('VisualizarArquivo', { uri: item.arquivoUri ?? '', tipo: 'application/pdf' })}
                                    style={{ backgroundColor: '#40FF01', padding: 10, borderRadius: 5, marginTop: 10, alignItems: 'center' }}
                                >
                                    <Text style={{ color: '#fff' }}>Ver Arquivo</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity onPress={() => handleEditDemanda(item)} style={{ marginRight: 10, marginTop: 10,}}>
                                <Text style={{ color: '#007bff' }}>Editar</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    showsVerticalScrollIndicator={false}
                />
            </View>
            <Modalize ref={modalizeRef} adjustToContentHeight>
                <View style={{ padding: 20 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>{isEditing ? 'Editar Demanda' : 'Adicionar Demanda'}</Text>
                    <TextInput
                        placeholder="Título"
                        value={titulo}
                        onChangeText={setTitulo}
                        style={{ borderWidth: 1, marginBottom: 10, padding: 10, borderRadius: 5 }}
                    />
                    <TextInput
                        placeholder="Data"
                        value={data}
                        onChangeText={setData}
                        style={{ borderWidth: 1, marginBottom: 10, padding: 10, borderRadius: 5 }}
                    />
                    <TextInput
                        placeholder="Hora"
                        value={hora}
                        onChangeText={setHora}
                        style={{ borderWidth: 1, marginBottom: 10, padding: 10, borderRadius: 5 }}
                    />
                    <TextInput
                        placeholder="Descrição"
                        value={descricao}
                        onChangeText={setDescricao}
                        style={{ borderWidth: 1, marginBottom: 10, padding: 10, borderRadius: 5 }}
                    />
                    <TouchableOpacity onPress={openPicker} style={{ borderWidth: 1, marginBottom: 10, padding: 10, borderRadius: 5, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }}>
                        <Text style={{ color: '#555' }}>{responsavel.nome || 'Selecione o Responsável'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={openFilePicker} style={{ borderWidth: 1, marginBottom: 10, padding: 10, borderRadius: 5, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }}>
                        {uploading ? <ActivityIndicator size="small" color="#0000ff" /> : <Text style={{ color: '#555' }}>{arquivoUri ? 'Arquivo Selecionado' : 'Adicionar Arquivo/Imagem'}</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleAddOrUpdateDemanda} style={{ backgroundColor: '#40FF01', padding: 15, borderRadius: 10 }}>
                        <Text style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>{isEditing ? 'Salvar Alterações' : 'Adicionar'}</Text>
                    </TouchableOpacity>
                </View>
            </Modalize>

            <Modalize ref={pickerRef} adjustToContentHeight>
                <ScrollView contentContainerStyle={{ padding: 20 }}>
                    {funcionarios.map((funcionario) => (
                        <TouchableOpacity
                            key={funcionario.id}
                            onPress={() => {
                                setResponsavel({ nome: funcionario.nome ?? '', id: funcionario.id });
                                pickerRef.current?.close();
                            }}
                            style={{ borderWidth: 1, marginBottom: 20, padding: 10, borderRadius: 5, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }}
                        >
                            <Text style={{ fontSize: 18 }}>{funcionario.nome}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </Modalize>

            <Modalize ref={filePickerRef} adjustToContentHeight>
                <View style={{ padding: 20 }}>
                    <TouchableOpacity onPress={pickDocument} style={{ marginBottom: 20 }}>
                        <Text style={{ fontSize: 18, color: '#000' }}>Selecionar Arquivo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={pickImage} style={{ marginBottom: 20 }}>
                        <Text style={{ fontSize: 18, color: '#000' }}>Selecionar Imagem</Text>
                    </TouchableOpacity>
                </View>
            </Modalize>
        </View>
    );
}
