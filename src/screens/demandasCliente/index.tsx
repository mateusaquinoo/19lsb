import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState, useEffect, useRef } from 'react';
import { Text, TouchableOpacity, View, TextInput, FlatList, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ClientDTO } from '../../../firestore/Cliente/clienteDTO';
import { updateDoc, doc, getDoc } from 'firebase/firestore';
import { db, storage } from '../../../config/firebase';
import { Modalize } from 'react-native-modalize';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getFuncionarios } from '../../../firestore/Funcionarios/funcionariosController';
import { FuncionarioDTO } from '../../../firestore/Funcionarios/funcionariosDTO';

type RootStackParamList = {
    Demanda: { cliente: ClientDTO };
    VisualizarArquivo: { uri: string; tipo: string };
};

type DemandaRouteProp = RouteProp<RootStackParamList, 'Demanda'>;

interface Demanda {
    id: string;
    titulo: string;
    arquivoUri: string;
    responsavel: string;
    data: string;
    hora: string;
    descricao: string;
}

export default function Demanda() {
    const navigation = useNavigation();
    const route = useRoute<DemandaRouteProp>();
    const { cliente } = route.params;

    const [demandas, setDemandas] = useState<Demanda[]>(cliente.demandas || []);
    const [titulo, setTitulo] = useState('');
    const [arquivoUri, setArquivoUri] = useState('');
    const [responsavel, setResponsavel] = useState('');
    const [data, setData] = useState('');
    const [hora, setHora] = useState('');
    const [descricao, setDescricao] = useState('');
    const [funcionarios, setFuncionarios] = useState<FuncionarioDTO[]>([]);
    const [currentDemandaId, setCurrentDemandaId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const modalizeRef = useRef<Modalize>(null);
    const filePickerRef = useRef<Modalize>(null);
    const responsavelPickerRef = useRef<Modalize>(null);

    useEffect(() => {
        const fetchCliente = async () => {
            if (cliente.id) {
                const clienteDoc = doc(db, 'clientes', cliente.id);
                const docSnap = await getDoc(clienteDoc);
                if (docSnap.exists()) {
                    const clienteData = docSnap.data() as ClientDTO;
                    setDemandas(clienteData.demandas || []);
                }
            }
        };

        const fetchFuncionarios = async () => {
            const fetchedFuncionarios = await getFuncionarios();
            setFuncionarios(fetchedFuncionarios);
        };

        fetchCliente();
        fetchFuncionarios();
    }, [cliente.id]);

    const handleAddDemanda = async () => {
        if (uploading) return;

        setLoading(true);
        const novaDemanda: Demanda = {
            id: Math.random().toString(36).substring(7),
            titulo,
            arquivoUri,
            responsavel,
            data,
            hora,
            descricao
        };

        const updatedDemandas = [...demandas, novaDemanda];
        setDemandas(updatedDemandas);

        if (cliente.id) {
            const clienteDoc = doc(db, 'clientes', cliente.id);
            await updateDoc(clienteDoc, { demandas: updatedDemandas });
        }

        setTitulo('');
        setArquivoUri('');
        setResponsavel('');
        setData('');
        setHora('');
        setDescricao('');
        setCurrentDemandaId(null);
        setLoading(false);
        modalizeRef.current?.close();
    };

    const handleEditDemanda = async () => {
        if (!currentDemandaId || uploading) return;

        setLoading(true);
        const updatedDemandas = demandas.map((item) =>
            item.id === currentDemandaId ? { ...item, titulo, arquivoUri, responsavel, data, hora, descricao } : item
        );
        setDemandas(updatedDemandas);

        if (cliente.id) {
            const clienteDoc = doc(db, 'clientes', cliente.id);
            await updateDoc(clienteDoc, { demandas: updatedDemandas });
        }

        setTitulo('');
        setArquivoUri('');
        setResponsavel('');
        setData('');
        setHora('');
        setDescricao('');
        setCurrentDemandaId(null);
        setLoading(false);
        modalizeRef.current?.close();
    };

    const handleDeleteDemanda = async (id: string) => {
        const updatedDemandas = demandas.filter((item) => item.id !== id);
        setDemandas(updatedDemandas);

        if (cliente.id) {
            const clienteDoc = doc(db, 'clientes', cliente.id);
            await updateDoc(clienteDoc, { demandas: updatedDemandas });
        }
    };

    const openEditModal = (item: Demanda) => {
        setTitulo(item.titulo);
        setArquivoUri(item.arquivoUri);
        setResponsavel(item.responsavel);
        setData(item.data);
        setHora(item.hora);
        setDescricao(item.descricao);
        setCurrentDemandaId(item.id);
        modalizeRef.current?.open();
    };

    const confirmDeleteDemanda = (id: string) => {
        Alert.alert(
            "Excluir Demanda",
            "Você tem certeza que deseja excluir esta demanda?",
            [
                {
                    text: "Não",
                    style: "cancel"
                },
                {
                    text: "Sim",
                    onPress: () => handleDeleteDemanda(id)
                }
            ]
        );
    };

    const pickDocument = async () => {
        let result: any = await DocumentPicker.getDocumentAsync({ type: "*/*" });
        if (result.type === 'success') {
            console.log('Document selected:', result.uri);
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
            console.log('Image selected:', imageUri);
            await uploadFile(imageUri, imageUri.split('/').pop() || 'image');
        } else {
            console.log('Image picker canceled');
        }
    };

    const uploadFile = async (uri: string, name: string) => {
        setUploading(true);
        try {
            console.log('Uploading file:', uri);
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
                        console.log('File available at', downloadURL);
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

    return (
        <View style={{
            flex: 1,
            paddingHorizontal: 20,
            paddingVertical: 80,
            backgroundColor: '#fff'
        }}>
            <View
                style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                    }}
                >
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#40FF01" />
                    <Text
                        style={{
                            marginLeft: 10,
                            fontSize: 24,
                            fontWeight: "bold",
                            color: "#000",
                        }}
                    >
                        Voltar
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={{ marginTop: 20 }}>
                <Text style={{ fontSize: 28, fontWeight: 'bold' }}>{cliente.nome}</Text>
                <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, marginTop: 10 }}>Demandas:</Text>

                <FlatList
                    data={demandas}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={{ padding: 15, backgroundColor: '#f0f0f0', borderRadius: 10, marginBottom: 10 }}>
                            <Text style={{ fontSize: 18, color: '#000' }}>Título: {item.titulo}</Text>
                            <Text style={{ fontSize: 16, color: '#555' }}>Responsável: {funcionarios.find(f => f.id === item.responsavel)?.nome}</Text>
                            <Text style={{ fontSize: 16, color: '#555' }}>Data: {item.data}</Text>
                            <Text style={{ fontSize: 16, color: '#555' }}>Hora: {item.hora}</Text>
                            <Text style={{ fontSize: 16, color: '#555' }}>Descrição: {item.descricao}</Text>
                            {item.arquivoUri ? (
                                <TouchableOpacity
                                    onPress={() => {
                                        navigation.navigate('VisualizarArquivo', { uri: item.arquivoUri, tipo: 'application/pdf' });
                                    }}
                                    style={{ backgroundColor: '#40FF01', padding: 10, borderRadius: 5, marginTop: 10, alignItems: 'center' }}
                                >
                                    <Text style={{ color: '#fff' }}>Abrir</Text>
                                </TouchableOpacity>
                            ) : null}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                                <TouchableOpacity
                                    onPress={() => openEditModal(item)}
                                    style={{ marginRight: 10 }}
                                >
                                    <Text style={{ color: '#007bff' }}>Editar</Text>
                                </TouchableOpacity>
                            
                            </View>
                        </View>
                    )}
                />
            </View>

            <Modalize ref={modalizeRef} adjustToContentHeight>
                <ScrollView contentContainerStyle={{ padding: 20 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>{currentDemandaId ? 'Editar Demanda' : 'Adicionar Demanda'}</Text>
                    <TextInput
                        placeholder="Título"
                        value={titulo}
                        onChangeText={setTitulo}
                        style={{
                            borderWidth: 1,
                            marginBottom: 10,
                            padding: 10,
                            borderRadius: 5
                        }}
                    />
                    <TextInput
                        placeholder="Data (dd/mm/yyyy)"
                        value={data}
                        onChangeText={setData}
                        style={{
                            borderWidth: 1,
                            marginBottom: 10,
                            padding: 10,
                            borderRadius: 5
                        }}
                    />
                    <TextInput
                        placeholder="Hora"
                        value={hora}
                        onChangeText={setHora}
                        style={{
                            borderWidth: 1,
                            marginBottom: 10,
                            padding: 10,
                            borderRadius: 5
                        }}
                    />
                    <TextInput
                        placeholder="Descrição"
                        value={descricao}
                        onChangeText={setDescricao}
                        style={{
                            borderWidth: 1,
                            marginBottom: 10,
                            padding: 10,
                            borderRadius: 5
                        }}
                    />
                    <TouchableOpacity
                        onPress={() => responsavelPickerRef.current?.open()}
                        style={{
                            borderWidth: 1,
                            marginBottom: 10,
                            padding: 10,
                            borderRadius: 5,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: '#f0f0f0'
                        }}
                    >
                        <Text style={{ color: '#555' }}>{responsavel ? funcionarios.find(f => f.id === responsavel)?.nome : 'Selecionar Responsável'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => filePickerRef.current?.open()}
                        style={{
                            borderWidth: 1,
                            marginBottom: 20,
                            padding: 10,
                            borderRadius: 5,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: '#f0f0f0'
                        }}
                    >
                        {uploading ? (
                            <ActivityIndicator size="small" color="#0000ff" />
                        ) : (
                            <Text style={{ color: '#555' }}>{arquivoUri ? 'Arquivo Selecionado' : 'Selecionar Arquivo/Imagem'}</Text>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={currentDemandaId ? handleEditDemanda : handleAddDemanda} style={{ backgroundColor: '#40FF01', padding: 15, borderRadius: 10 }}>
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>{currentDemandaId ? 'Salvar Alterações' : 'Adicionar'}</Text>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => modalizeRef.current?.close()} style={{ marginTop: 10, backgroundColor: '#ccc', padding: 15, borderRadius: 10 }}>
                        <Text style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>Cancelar</Text>
                    </TouchableOpacity>
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

            <Modalize ref={responsavelPickerRef} adjustToContentHeight>
                <ScrollView contentContainerStyle={{ padding: 20 }}>
                    {funcionarios.map((funcionario) => (
                        <TouchableOpacity
                            key={funcionario.id}
                            onPress={() => {
                                setResponsavel(funcionario.id ?? '');
                                responsavelPickerRef.current?.close();
                            }}
                            style={{
                                padding: 10,
                                borderRadius: 5,
                                backgroundColor: responsavel === funcionario.id ? '#40FF01' : '#f0f0f0',
                                marginBottom: 10,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <Text style={{ color: responsavel === funcionario.id ? '#fff' : '#000' }}>{funcionario.nome}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </Modalize>

            <TouchableOpacity
                style={{
                    position: 'absolute',
                    bottom: 30,
                    right: 30,
                    backgroundColor: '#40FF01',
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
                onPress={() => modalizeRef.current?.open()}
            >
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}
