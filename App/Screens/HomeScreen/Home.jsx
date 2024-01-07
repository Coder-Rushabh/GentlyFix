import { View, Text } from 'react-native'
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Header from './Header.jsx'

const Tab = createBottomTabNavigator();

export default function Home() {
  return (
    <View>
      {/* Header added */}
      <Header />

    </View>
  )
}