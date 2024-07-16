// firestore/Avisos/avisoDTO.ts
export interface AvisoDTO {
    status: boolean;
    completed: boolean;
    id?: string;
    title: string;
    employeeId: string;
    client: string;
    date: string;
    time: string;
    createdAt: Date;
    fileUri: string;
}
