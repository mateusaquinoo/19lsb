export interface PontoDTO {
    localizacao: any;
    horario: string;
    id?: string;
    userId: string;
    time: Date;
    type: 'entrada' | 'saida';
    location: {
        latitude: number;
        longitude: number;
    };
}
