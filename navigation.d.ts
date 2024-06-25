export declare global {
    namespace ReactNavigation {
        interface RootParamList {
            Feed: undefined;
            clientes: undefined;
            servicos: undefined;
            Home: undefined;
            ClienteDetalhes: { cliente: ClientDTO };
            AcessosCliente: { cliente: ClientDTO };
            BriefingCliente: { cliente: ClientDTO };
            ServicosCliente: { cliente: ClientDTO }; 
            RelatoriosCliente: { cliente: ClientDTO };
            Demanda: { cliente: ClientDTO };
            VisualizarArquivo: { uri: string; tipo: string };
            Calendario: undefined;
            Avisos: undefined;  // Adicione esta linha
            
        }
    }
}
