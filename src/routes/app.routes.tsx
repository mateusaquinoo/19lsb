import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Feed from "../screens/feed";
import Home from "../screens/home";
import Clientes from "../screens/clientes";
import ClienteDetalhes from "../screens/detalhesCliente";
import ServicosCliente from "../screens/servicosCliente";
import AcessosCliente from "../screens/acessosCliente";
import BriefingCliente from "../screens/breafing";
import VisualizarArquivo from "../screens/visualizarArquivo";
import RelatoriosCliente from "../screens/relatorios";
import Calendario from "../screens/calendario";
import Avisos from "../screens/avisos";
import DemandasScreen from "../screens/demandasCliente";
import DemandasFeed from "../screens/demandaFeed";
import DemandasCliente from "../screens/demandasCliente";
import Ponto from "../screens/ponto";
import ReuniaoCliente from "../screens/reuniao";
import GerenciarAvisos from "../screens/controleAvisos";
import GerenciarPontos from "../screens/administracao";
import PontosBatidos from "../screens/pontoBatidos";

const { Navigator, Screen } = createNativeStackNavigator();

export function AppRoutes() {
    return (
        <Navigator>
             <Screen   
             name="Home"
             component={Home} 
             options={{ headerShown: false }}  
             />
           
            <Screen 
            name="Feed"
            component={Feed} 
            options={{ headerShown: false }}  
            />

            <Screen 
            name="clientes"
            component={Clientes} 
            options={{ headerShown: false }}  
            />

            <Screen 
            name="ClienteDetalhes"
            component={ClienteDetalhes}
            options={{ headerShown: false }} 
            />

            <Screen 
            name="AcessosCliente"
            component={AcessosCliente}
            options={{ headerShown: false }} 
            />

            <Screen 
            name="ServicosCliente"
            component={ServicosCliente}
            options={{ headerShown: false }} 
            />

            <Screen 
            name="BriefingCliente"
            component={BriefingCliente}
            options={{ headerShown: false }} 
            />

            <Screen 
            name="RelatoriosCliente"
            component={RelatoriosCliente}
            options={{ headerShown: false }} 
            />

            <Screen 
            name="VisualizarArquivo"
            component={VisualizarArquivo}
            options={{ headerShown: false }} 
            />

            <Screen 
            name="Calendario"
            component={Calendario}
            options={{ headerShown: false }} 
            />

            <Screen 
            name="Avisos"
            component={Avisos}
            options={{ headerShown: false }} 
            />

            <Screen 
            name="Demanda"
            component={DemandasCliente}
            options={{ headerShown: false }} 
            />

            <Screen 
            name="GerenciarAvisos"
            component={GerenciarAvisos}
            options={{ headerShown: false }} 
            />

            <Screen 
            name="ReuniaoCliente"
            component={ReuniaoCliente}
            options={{ headerShown: false }} 
            />

            <Screen 
            name="DemandasFeed"
            component={DemandasFeed}
            options={{ headerShown: false }} 
            />

            <Screen 
            name="Ponto"
            component={Ponto}
            options={{ headerShown: false }} 
            />

            <Screen 
            name="GerenciarPontos"
            component={GerenciarPontos}
            options={{ headerShown: false }} 
            />

            <Screen 
            name="PontosBatidos"
            component={PontosBatidos}
            options={{ headerShown: false }} 
            />
        </Navigator>
    );
}