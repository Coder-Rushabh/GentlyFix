import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './screens/HomeScreen';
import CategoryScreen from './screens/CategoryScreen';
import BusinessDetails from './screens/BusinessDetails';
import SavedScreen from './screens/SavedScreen';
import ChooseCityScreen from './screens/ChooseCityScreen';
import ReportScreen from './screens/ReportScreen';
import AddBusinessScreen from './screens/AddBusinessScreen';
import { LocationProvider } from './lib/location';
import { FavoritesProvider } from './lib/favorites';
import { useTheme } from './theme';

const Stack = createNativeStackNavigator();

export default function App() {
  const { colors, isDark } = useTheme();
  const base = isDark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: { ...base.colors, background: colors.bg, card: colors.bg, text: colors.text, primary: colors.primary, border: colors.border },
  };
  return (
    <SafeAreaProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <LocationProvider>
        <FavoritesProvider>
          <NavigationContainer theme={navTheme}>
            <Stack.Navigator
              initialRouteName="Home"
              screenOptions={{ headerShadowVisible: false, headerTitleStyle: { fontWeight: '700' }, animation: 'slide_from_right' }}
            >
              <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
              <Stack.Screen
                name="Category"
                component={CategoryScreen}
                options={({ route }) => ({ title: route.params.searchText ? 'Search' : route.params.category })}
              />
              <Stack.Screen name="BusinessDetails" component={BusinessDetails} options={{ title: '' }} />
              <Stack.Screen name="Saved" component={SavedScreen} options={{ title: 'Saved' }} />
              <Stack.Screen name="ChooseCity" component={ChooseCityScreen} options={{ title: 'Choose location', presentation: 'modal', animation: 'slide_from_bottom' }} />
              <Stack.Screen name="Report" component={ReportScreen} options={{ title: 'Report a problem', presentation: 'modal', animation: 'slide_from_bottom' }} />
              <Stack.Screen name="AddBusiness" component={AddBusinessScreen} options={{ title: 'Add a business', presentation: 'modal', animation: 'slide_from_bottom' }} />
            </Stack.Navigator>
          </NavigationContainer>
        </FavoritesProvider>
      </LocationProvider>
    </SafeAreaProvider>
  );
}
