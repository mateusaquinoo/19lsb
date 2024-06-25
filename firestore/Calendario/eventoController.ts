import { db } from '../../config/firebase';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { EventoDTO } from './eventoDTO';

const eventosCollection = collection(db, 'eventos');

export const addEvento = async (evento: EventoDTO): Promise<void> => {
    await addDoc(eventosCollection, evento);
};

export const getEventos = async (): Promise<EventoDTO[]> => {
    const snapshot = await getDocs(eventosCollection);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as EventoDTO[];
};

export const updateEvento = async (id: string, evento: Partial<EventoDTO>): Promise<void> => {
    const eventoDoc = doc(eventosCollection, id);
    await updateDoc(eventoDoc, evento);
};

export const deleteEvento = async (id: string): Promise<void> => {
    const eventoDoc = doc(eventosCollection, id);
    await deleteDoc(eventoDoc);
};
