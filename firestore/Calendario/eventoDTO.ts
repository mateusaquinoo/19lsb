import { ReactNode } from "react";

export interface EventoDTO {
    time: ReactNode;
    id?: string;
    title: string;
    client: string;
    employee: string;
    date: string;
    createdAt: Date;
}
