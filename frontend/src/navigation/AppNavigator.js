import React, { useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

import { ChatScreen } from '../screens/ChatScreen';
import { LogsScreen } from '../screens/LogsScreen';
import { ProviderDetailsScreen } from '../screens/ProviderDetailsScreen';

import { RoleSelectionScreen } from '../screens/auth/RoleSelectionScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { ProviderSignupScreen } from '../screens/auth/ProviderSignupScreen';
import { ServiceTakerSignupScreen } from '../screens/auth/ServiceTakerSignupScreen';
import ServiceDetails from '../screens/ServiceDetails';
import BottomTabNavigation from './BottomTabNavigation';

const Stack = createStackNavigator();

export const AppNavigator = () => {
  const { loading } = useContext(AuthContext);

  // if (loading) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#46C96B' }}>
  //       <ActivityIndicator size="large" color="#FFFFFF" />
  //     </View>
  //   );
  // }

  const user = false
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // Authenticated App Stack
          <Stack.Group>
            <Stack.Screen name="Main" component={BottomTabNavigation} />
            <Stack.Screen name="ServiceDetails" component={ServiceDetails} />
            <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: true, title: 'Service Agent' }} />
            <Stack.Screen name="Logs" component={LogsScreen} options={{ headerShown: true, title: 'Orchestration Logs' }} />
            <Stack.Screen name="ProviderDetails" component={ProviderDetailsScreen} />
          </Stack.Group>
        ) : (
          // Authentication Stack — Main (tab nav) is mounted first as a landing/preview
          <Stack.Group>
            <Stack.Screen name="Main" component={BottomTabNavigation} />
            <Stack.Screen name="ServiceDetails" component={ServiceDetails} />
            <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="ProviderSignup" component={ProviderSignupScreen} />
            <Stack.Screen name="ServiceTakerSignup" component={ServiceTakerSignupScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
