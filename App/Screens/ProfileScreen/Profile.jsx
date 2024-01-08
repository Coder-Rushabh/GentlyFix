import { View, Text } from 'react-native'
import React from 'react'
import Header from './Header.jsx'
import PrimaryProfile from './PrimaryProfile.jsx'
import SecondaryProfile from './SecondaryProfile.jsx'


export default function Profile() {
  return (
    <View>
      <Header />
      <PrimaryProfile />
      <SecondaryProfile />
    </View>
  )
}