import { collection, addDoc, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { AvisoDTO } from './avisoDTO';

// Função para adicionar um aviso
export const addAviso = async (aviso: AvisoDTO) => {
    const docRef = await addDoc(collection(db, 'avisos'), aviso);
    return docRef.id;
};

// Função para obter avisos por funcionário
export const getAvisosByEmployee = async (employeeId: string): Promise<AvisoDTO[]> => {
    const q = query(collection(db, 'avisos'), where('employeeId', '==', employeeId));
    const querySnapshot = await getDocs(q);
    const avisos: AvisoDTO[] = [];
    querySnapshot.forEach((doc) => {
        avisos.push({ id: doc.id, ...doc.data() } as AvisoDTO);
    });
    return avisos;
};

// Função para obter todos os funcionários
export const getAllEmployees = async () => {
    const employeesSnapshot = await getDocs(collection(db, 'funcionarios'));
    const employeesList = employeesSnapshot.docs.map(doc => ({ id: doc.id, nome: doc.data().nome, ...doc.data() }));
    return employeesList;
};

// Função para marcar um aviso como concluído
export const markAvisoAsCompleted = async (avisoId: string) => {
    const avisoRef = doc(db, 'avisos', avisoId);
    await updateDoc(avisoRef, {
        completed: true,
    });
};

export const updateAvisoStatus = async (avisoId: string, status: boolean) => {
    const avisoRef = doc(db, 'avisos', avisoId);
    await updateDoc(avisoRef, {
        completed: status,
    });
};
