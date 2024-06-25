// firestore/Avisos/avisoDTO.ts
export interface AvisoDTO {
    id?: string;
    title: string;
    employeeId: string;
    client: string;
    date: string;
    time: string;
    createdAt: Date;
}
