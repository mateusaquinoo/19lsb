export interface DemandaDTO {
    id?: string;
    titulo: string;
    data: string;
    hora: string;
    descricao: string;
    responsavel: string;
    clienteId: string;
    arquivoUri?: string;
    createdAt: string;
}
