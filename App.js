import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import Login from './App/Screens/LoginScreen/Login';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './App/Screens/HomeScreen/Home';
import MobileLogin from './App/Screens/LoginScreen/MobileLogin';
import Tabs from './App/Screens/Tabs';
import EditProfileInfo from './App/Screens/ProfileScreen/EditProfileInfo';
import Profile from './App/Screens/ProfileScreen/Profile';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer >
      <Stack.Navigator >
        <Stack.Screen options={{ headerShown: false }} name='Login' component={Login}/>
        <Stack.Screen options={{ headerShown: false }} name='MobileLogin' component={MobileLogin}/>
        <Stack.Screen options={{ headerShown: false }} name='Home' component={Home}/>
        <Stack.Screen options={{ headerShown: false }} name='Tabs' component={Tabs}/>
        <Stack.Screen options={{ headerShown: false }} name='EditProfileInfo' component={EditProfileInfo}/>
        <Stack.Screen options={{ headerShown: false }} name='Profile' component={Profile}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}


