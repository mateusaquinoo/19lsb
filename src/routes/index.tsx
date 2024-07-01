// routes/Routes.tsx
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { AppRoutes } from './app.routes';

export function Routes() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initialize = async () => {
            // Realiza a inicialização necessária aqui
            setIsLoading(false);
        };

        initialize();
    }, []);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Carregando...</Text>
            </View>
        );
    }

    return <AppRoutes />;
}
