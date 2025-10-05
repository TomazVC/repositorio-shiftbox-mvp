import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES } from '../constants';

// Screens
import Dashboard from '../screens/Dashboard';
import CreditScore from '../screens/CreditScore';
import InvestScreen from '../screens/InvestScreen';
import LoanRequestScreen from '../screens/LoanRequestScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import WithdrawScreen from '../screens/WithdrawScreen';
import Login from '../screens/Login';
import Register from '../screens/Register';
import InvestmentDetails from '../screens/InvestmentDetails';
import Notifications from '../screens/Notifications';

import { RootStackParamList, TabParamList } from '../types';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

type TabIconName = keyof typeof MaterialCommunityIcons.glyphMap;

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: TabIconName = 'home';

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'CreditScore':
              iconName = focused ? 'chart-line' : 'chart-line-variant';
              break;
            case 'Invest':
              iconName = focused ? 'finance' : 'finance';
              break;
            case 'Transactions':
              iconName = focused ? 'receipt' : 'receipt-outline';
              break;
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.PRIMARY,
        tabBarInactiveTintColor: COLORS.TEXT_SECONDARY,
        tabBarStyle: {
          backgroundColor: COLORS.BG_SCREEN,
          borderTopColor: COLORS.DIVIDER,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
        },
        tabBarLabelStyle: {
          fontSize: FONT_SIZES.XS,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={Dashboard} 
        options={{ tabBarLabel: 'Início' }}
      />
      <Tab.Screen 
        name="CreditScore" 
        component={CreditScore} 
        options={{ tabBarLabel: 'Score' }}
      />
      <Tab.Screen 
        name="Invest" 
        component={InvestScreen} 
        options={{ tabBarLabel: 'Investir' }}
      />
      <Tab.Screen 
        name="Transactions" 
        component={TransactionsScreen} 
        options={{ tabBarLabel: 'Extrato' }}
      />
    </Tab.Navigator>
  );
};

export default function AppNavigator() {
  return (
    <Stack.Navigator 
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="LoanRequest" component={LoanRequestScreen} />
      <Stack.Screen name="Withdraw" component={WithdrawScreen} />
      <Stack.Screen name="InvestmentDetails" component={InvestmentDetails} />
      <Stack.Screen name="Notifications" component={Notifications} />
    </Stack.Navigator>
  );
}