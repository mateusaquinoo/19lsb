import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { PontoDTO } from './pontoDTO';

const pontosCollection = collection(db, 'pontos');

export const addPonto = async (ponto: PontoDTO) => {
    await addDoc(pontosCollection, ponto);
};

export const getPontos = async (userId: string): Promise<PontoDTO[]> => {
    const q = query(collection(db, 'pontos'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as PontoDTO }));
};
