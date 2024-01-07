import { View, Text } from 'react-native'
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Profile from './ProfileScreen/Profile';
import Bookings from './BookingsScreen/Bookings';
import Home from './HomeScreen/Home';
import { AntDesign } from '@expo/vector-icons'; 
import { MaterialIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function Tabs() {
  return (
    <Tab.Navigator screenOptions={{headerShown:false, tabBarActiveTintColor: '#4FD3DA' }}>
      <Tab.Screen name="Home" component={Home} 
      options={{
    tabBarIcon: ({color,size})=>(
      <AntDesign name="home" size={24} color={color} />
    )
  }}
      />
      <Tab.Screen name="Booking" component={Bookings} 
      options={{
    tabBarIcon: ({color,size})=>(
<MaterialIcons name="history" size={24} color={color} />    )
  }}/>
      <Tab.Screen name="Profile" component={Profile} 
      options={{
    tabBarIcon: ({color,size})=>(
<AntDesign name="user" size={24} color={color} />  )
  }}/>
    </Tab.Navigator>
  )
}