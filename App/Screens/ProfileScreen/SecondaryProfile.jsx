import { View, Text, Image, StyleSheet } from 'react-native'
import React from 'react'

export default function SecondaryProfile() {
  return (
    <>
          <Text style={styles.text1}>Email ID</Text>
          <Text style={styles.text2}>rushabhdabhade30@gmail.com</Text>

          <View style={styles.line}></View>

          <Text style={styles.text1}>Address</Text>
          <Text style={styles.text2}>147, Hudco Colony, Jamner Road</Text>

          <View style={styles.line}></View>

          <Text style={styles.text1}>City</Text>
          <Text style={styles.text2}>Bhusawal</Text>

          <View style={styles.line}></View>

          <Text style={styles.text1}>PIN Code</Text>
          <Text style={styles.text2}>425201</Text>

          <View style={styles.line}></View>

    </>

  )
}

const styles = StyleSheet.create({
  text2: {
    marginLeft: 20,
    marginTop: 5
  },
  text1: {
    marginLeft: 20,
    marginTop: 20,
    color: '#000',
    fontSize: 17,
    
  },
  line: {
    height: 1,
    width: '80%',
    backgroundColor: 'gray',
    marginTop: 10,
    marginLeft: 10

  },
})