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
      employeeId: data.employeeId, // Certifique-se de que employeeId está sendo corretamente mapeado
      nome: data.nome,
      email: data.email,
      dataNascimento: data.dataNascimento,
      cargo: data.cargo,
    } as FuncionarioDTO;
  });
  return funcionariosList;
};
