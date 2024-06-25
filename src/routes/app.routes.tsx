import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Feed from "../screens/feed";
import Home from "../screens/home";
import Clientes from "../screens/clientes";
import Servico from "../screens/servico";
import ClienteDetalhes from "../screens/detalhesCliente";
import ServicosCliente from "../screens/servicosCliente";
import AcessosCliente from "../screens/acessosCliente";
import BriefingCliente from "../screens/breafing";
import VisualizarArquivo from "../screens/visualizarArquivo";
import RelatoriosCliente from "../screens/relatorios";
import Calendario from "../screens/calendario";
import Avisos from "../screens/avisos";

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
            name="servicos"
            component={Servico}
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
        </Navigator>
    );
}