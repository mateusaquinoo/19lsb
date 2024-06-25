export interface ClientDTO {
    demandas: never[];
    relatorios: never[];
    briefing: never[];
    id: string;
    nome: string;
    dataEntrada: string;
    tempoContrato: string;
    servicos: string[];
    valor: string;
    acessos?: Acesso[];
}

interface Acesso {
    id: string;
    redeSocial: string;
    login: string;
    senha: string;
}
