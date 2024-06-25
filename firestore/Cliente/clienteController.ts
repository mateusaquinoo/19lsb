import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { ClientDTO } from './clienteDTO';


const clientsCollection = collection(db, 'clientes');

export const addClient = async (client: ClientDTO) => {
  try {
    const docRef = await addDoc(clientsCollection, client);
    return { ...client, id: docRef.id };
  } catch (error) {
    console.error("Error adding client: ", error);
    throw error;
  }
};

export const getClients = async () => {
  try {
    const snapshot = await getDocs(clientsCollection);
    const clients: ClientDTO[] = [];
    snapshot.forEach(doc => {
      clients.push({ id: doc.id, ...doc.data() } as ClientDTO);
    });
    return clients;
  } catch (error) {
    console.error("Error fetching clients: ", error);
    throw error;
  }
};
