import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './screens/Login';
import Register from './screens/Register';
import Dashboard from './screens/Dashboard';
import InvestScreen from './screens/InvestScreen';
import LoanRequestScreen from './screens/LoanRequestScreen';
import TransactionsScreen from './screens/TransactionsScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="Invest" component={InvestScreen} />
        <Stack.Screen name="LoanRequest" component={LoanRequestScreen} />
        <Stack.Screen name="Transactions" component={TransactionsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}