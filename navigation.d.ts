export declare global {
    namespace ReactNavigation {
        interface RootParamList {
            Feed: undefined;
            clientes: undefined;
            Home: undefined;
            ClienteDetalhes: { cliente: ClientDTO };
            AcessosCliente: { cliente: ClientDTO };
            BriefingCliente: { cliente: ClientDTO };
            ServicosCliente: { cliente: ClientDTO }; 
            RelatoriosCliente: { cliente: ClientDTO };
            Demanda: { cliente: ClientDTO };
            ReuniaoCliente: { cliente: ClientDTO };
            VisualizarArquivo: { uri: string; tipo: string };
            Calendario: undefined;
            Avisos: undefined;
            DemandasFeed: undefined; // Adicione esta linha
            Ponto: undefined; // Adicionei esta 
            GerenciarAvisos: undefined; // Adicionei esta
            GerenciarPontos: undefined; // Adicionei esta
        }
    }
}
