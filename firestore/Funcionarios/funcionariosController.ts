import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase'; // Certifique-se de importar o db corretamente
import { FuncionarioDTO } from './funcionariosDTO'; // Importe a interface FuncionarioDTO

export const getFuncionarios = async (): Promise<FuncionarioDTO[]> => {
  const funcionariosCollection = collection(db, 'funcionarios');
  const funcionariosSnapshot = await getDocs(funcionariosCollection);
  const funcionariosList = funcionariosSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      nome: data.nome,
      cargo: data.cargo,
    } as FuncionarioDTO;
  });
  return funcionariosList;
};
