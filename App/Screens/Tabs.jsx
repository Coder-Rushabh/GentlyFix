import { View, Text } from 'react-native'
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Profile from './ProfileScreen/Profile';
import Bookings from './BookingsScreen/Bookings';
import Home from './HomeScreen/Home';
import { AntDesign } from '@expo/vector-icons'; 
import { FontAwesome } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function Tabs() {
  return (
    <Tab.Navigator screenOptions={{headerShown:false}}>
      <Tab.Screen name="Home" component={Home} 
      options={{tabBarLabel:() => (
        <Text style={{color: '#4FD3DA', fontSize:13, paddingBottom: 5}}>Home</Text>
      ),
    tabBarIcon: ({color,size})=>(
      <AntDesign name="home" size={size} color='#4FD3DA' />
    )
  }}
      />
      <Tab.Screen name="Booking" component={Bookings} 
      options={{tabBarLabel:() => (
        <Text style={{color: '#4FD3DA', fontSize:13, paddingBottom: 5}}>Bookings</Text>
      ),
    tabBarIcon: ({color,size})=>(
<FontAwesome name="history" size={24} color="#4FD3DA" />    )
  }}/>
      <Tab.Screen name="Profile" component={Profile} 
      options={{tabBarLabel:() => (
        <Text style={{color: '#4FD3DA', fontSize:13, paddingBottom: 5}}>Profile</Text>
      ),
    tabBarIcon: ({color,size})=>(
<MaterialIcons name="tag-faces" size={24} color="#4FD3DA" />    )
  }}/>
    </Tab.Navigator>
  )
}