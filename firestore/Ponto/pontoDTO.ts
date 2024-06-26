export interface PontoDTO {
    localizacao: any;  // Considere definir um tipo mais específico para localização
    horario: string;
    id?: string;
    userId: string;
    time: Date;
    type: 'entrada' | 'almoco' | 'retorno' | 'saida';
    location: {
        latitude: number;
        longitude: number;
    };
    atrasado: boolean | undefined;  // Agora pode ser boolean ou undefined
}
