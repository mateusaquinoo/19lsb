import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Share, StyleSheet } from 'react-native';
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

    const [loading, setLoading] = useState(true);

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Confira este arquivo: ${uri}`,
            });
        } catch (error) {
            console.error('Erro ao compartilhar', error);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#40FF01" />
                </TouchableOpacity>
                <Text style={{ color: '#000', fontSize: 18 }}>
                    {tipo === 'pdf' ? 'Visualizar PDF' : 'Visualizar Imagem'}
                </Text>
                <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
                    <Ionicons name="share-social" size={24} color="#40FF01" />
                </TouchableOpacity>
            </View>
            {loading && (
                <ActivityIndicator
                    size="large"
                    color="#40FF01"
                    style={styles.loadingIndicator}
                />
            )}
            <WebView
                source={{ uri }}
                onLoad={() => setLoading(false)}
                onError={() => setLoading(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        marginTop: 50,
    },
    backButton: {
        padding: 10,
    },
    shareButton: {
        padding: 10,
    },
    loadingIndicator: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -50 }, { translateY: -50 }],
    },
});
