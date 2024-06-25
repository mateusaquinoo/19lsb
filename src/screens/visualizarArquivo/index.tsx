import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

type RootStackParamList = {
    VisualizarArquivo: { uri: string; tipo: string };
};

type VisualizarArquivoRouteProp = RouteProp<RootStackParamList, 'VisualizarArquivo'>;

export default function VisualizarArquivo() {
    const navigation = useNavigation();
    const route = useRoute<VisualizarArquivoRouteProp>();
    const { uri, tipo } = route.params;

    return (
        <View style={{ flex: 1 }}>
            <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ padding: 10, marginTop: 50}}
            >
                <Ionicons name="arrow-back" size={24} color="#40FF01" />
            </TouchableOpacity>
            <WebView source={{ uri }} />
        </View>
    );
}
