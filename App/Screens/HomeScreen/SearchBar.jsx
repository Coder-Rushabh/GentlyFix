import { View, Text, StyleSheet, TextInput } from 'react-native'
import React from 'react'
import { FontAwesome } from '@expo/vector-icons';

export default function SearchBar() {
  return (
    <View style={styles.container}>
      
      <TextInput placeholder='Search' style={styles.inputField}>
      </TextInput>
      <FontAwesome style={styles.searchBtn} name="search" size={24} color='black' />

    </View>
  )
}

const styles = StyleSheet.create({
  inputField: {
    padding: 7,
    marginLeft: 12,
    paddingLeft: 20,
    borderRadius: 8,
    width: '80%',
    backgroundColor: '#fff'

  },
  container: {
    marginTop: 15,
    display: 'flex',
    flexDirection: 'row',
    gap: 13,
  },
  searchBtn:{
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fff'

  }
})