import { View, Text } from 'react-native'
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Profile from '../ProfileScreen/Profile';
import Bookings from '../BookingsScreen/Bookings';


const Tab = createBottomTabNavigator();

export default function Home() {
  return (
    <View>
      <Text>Home</Text>
    </View>
  )
}