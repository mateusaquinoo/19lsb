import React, { useState, useEffect } from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { AppRoutes } from "./app.routes";
import { AuthProvider } from "../auth/AuthProvider"; // Certifique-se de ajustar o caminho conforme necessário
import { View,Text } from 'react-native';

export function Routes() {
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        const initializeApp = async () => {
            try {
                // Adicione qualquer inicialização assíncrona necessária aqui
                // Por exemplo, inicializar Firebase, verificar autenticação, etc.
                setIsLoading(false);
            } catch (error) {
                setIsError(true);
                console.error("Error initializing app: ", error);
            }
        };

        initializeApp();
    }, []);

    if (isLoading) {
        return (
            // Adicione um componente de carregamento aqui, se desejar
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Carregando...</Text>
            </View>
        );
    }



    return (
        <AuthProvider>
            <NavigationContainer>
                <AppRoutes />
            </NavigationContainer>
        </AuthProvider>
    );
}
