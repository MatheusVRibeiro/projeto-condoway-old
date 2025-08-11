import { createNativeStackNavigator  } from "@react-navigation/native-stack";

import Login from '../screens/Login';
import CadUsuario from '../screens/CadUsuario';
import EsqSenha from '../screens/EsqSenha';
import Home from '../screens/Home';

const Stack = createNativeStackNavigator();

export default function Tab () {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="CadUsuario" component={CadUsuario} />
            <Stack.Screen name="EsqSenha" component={EsqSenha} />
            <Stack.Screen name="Home" component={Home} />
        </Stack.Navigator>
    );
}   