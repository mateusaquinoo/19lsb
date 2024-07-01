// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/auth/AuthProvider'; // Ajuste o caminho conforme necessário
import { Routes } from './src/routes';

export default function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
                <NavigationContainer>
                    <Routes />
                </NavigationContainer>
            </AuthProvider>
        </GestureHandlerRootView>
    );
}
