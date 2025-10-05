import "react-native-gesture-handler";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import Login from './screens/Login';
import Register from './screens/Register';
import Dashboard from './screens/Dashboard';
import InvestScreen from './screens/InvestScreen';
import LoanRequestScreen from './screens/LoanRequestScreen';
import TransactionsScreen from './screens/TransactionsScreen';
import { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'web') {
      const { body, documentElement } = document;
      const previousBodyOverflow = body.style.overflowY;
      const previousBodyHeight = body.style.height;
      const previousRootHeight = documentElement.style.height;

      body.style.overflowY = 'auto';
      body.style.height = '100%';
      documentElement.style.height = '100%';

      return () => {
        body.style.overflowY = previousBodyOverflow;
        body.style.height = previousBodyHeight;
        documentElement.style.height = previousRootHeight;
      };
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
    </GestureHandlerRootView>
  );
}