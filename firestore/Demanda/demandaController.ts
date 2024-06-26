import { collection, addDoc, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { DemandaDTO } from './demandaDTO';

const demandasCollection = collection(db, 'demandas');

export const addDemanda = async (demanda: DemandaDTO) => {
    try {
        const docRef = await addDoc(demandasCollection, demanda);
        console.log('Demanda adicionada com ID:', docRef.id);
    } catch (error) {
        console.error("Error adding demanda: ", error);
        throw error;
    }
};

export const getDemandasByClient = async (clienteId: string): Promise<DemandaDTO[]> => {
    const q = query(demandasCollection, where('clienteId', '==', clienteId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as DemandaDTO[];
};

export const getDemandasByResponsavel = async (responsavelId: string): Promise<DemandaDTO[]> => {
    try {
        console.log('Responsavel ID na Consulta:', responsavelId);
        const q = query(demandasCollection, where('responsavel', '==', responsavelId));
        const querySnapshot = await getDocs(q);
        const demandas = querySnapshot.docs.map(doc => {
            console.log('Documento:', doc.data());
            return {
                id: doc.id,
                ...doc.data()
            } as DemandaDTO;
        });
        console.log('Query Result:', demandas);
        return demandas;
    } catch (error) {
        console.error("Error fetching demandas: ", error);
        throw error;
    }
};

export const updateDemanda = async (id: string, demanda: Partial<DemandaDTO>): Promise<void> => {
    const demandaDoc = doc(db, 'demandas', id);
    await updateDoc(demandaDoc, demanda);
};


