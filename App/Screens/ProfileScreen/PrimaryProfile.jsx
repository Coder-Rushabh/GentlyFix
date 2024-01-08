import { View, Text, Image, StyleSheet } from 'react-native'
import React from 'react'

export default function PrimaryProfile() {
  return (
    <>
      <View style={styles.line}></View>

      <View style={styles.container}>
        <Image source={require('./../../../assets/images/dp.jpg')}
          style={styles.userImage} />
        <View style={styles.details} >
          <Text style={styles.text1}>Rushabh Dabhade</Text>
          <Text style={styles.text2}>+91 7522910571</Text>
        </View>
      </View>
    </>

  )
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    paddingTop: 20,
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  line: {
    height: 1,
    width: '100%',
    backgroundColor: 'gray',
    alignSelf: 'center',

  },
  userImage: {
    marginLeft: 20,
    height: 120,
    width: 120,
    borderRadius: 99
  },
  text2: {
   
    marginTop: 5
  },
  text1: {
    color: '#000',
    fontSize: 25,
  },
  details:{
    marginLeft: 20
  }
})