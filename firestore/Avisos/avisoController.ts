// firestore/Avisos/avisoController.ts
import { db } from '../../config/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { AvisoDTO } from './avisoDTO';

const avisosCollection = collection(db, 'avisos');

export const addAviso = async (aviso: AvisoDTO) => {
    await addDoc(avisosCollection, aviso);
};

export const getAvisosByEmployee = async (employeeId: string): Promise<AvisoDTO[]> => {
    const q = query(avisosCollection, where('employeeId', '==', employeeId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AvisoDTO[];
};
