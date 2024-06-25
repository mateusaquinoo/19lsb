import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { ServicoDTO } from './servicosDTO';


const servicosCollection = collection(db, 'servicos');

export const addServico = async (servico: ServicoDTO) => {
    try {
        const docRef = await addDoc(servicosCollection, servico);
        return { ...servico, id: docRef.id };
    } catch (error) {
        console.error("Error adding servico: ", error);
        throw error;
    }
};

export const getServicos = async () => {
    try {
        const snapshot = await getDocs(servicosCollection);
        const servicos: ServicoDTO[] = [];
        snapshot.forEach(doc => {
            servicos.push({ id: doc.id, ...doc.data() } as ServicoDTO);
        });
        return servicos;
    } catch (error) {
        console.error("Error fetching servicos: ", error);
        throw error;
    }
};
