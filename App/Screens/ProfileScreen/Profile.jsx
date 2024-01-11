import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native'
import React from 'react'
import PrimaryProfile from './PrimaryProfile.jsx'
import SecondaryProfile from './SecondaryProfile.jsx'
import { AntDesign } from '@expo/vector-icons';


export default function Profile({ navigation }) {
  return (
    <View>
            <View style={styles.container}>
                <View style={styles.profileContainer}>

                    <Text style={styles.text2}>Profile</Text>
                    <TouchableOpacity onPress={() =>
                        navigation.navigate('EditProfileInfo')
                    }>
                        <AntDesign style={styles.edit} name="edit" size={24} color="black" />
                    </TouchableOpacity>
                </View>
            </View>
      <PrimaryProfile />
      <SecondaryProfile />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
      padding: 10,
      paddingTop: 40,
      backgroundColor: '#fff',

  },
  edit: {
      alignSelf: 'center',
      alignItems: 'center',
      marginLeft: '70%',
      marginRight: 0,
      marginTop: 20,
      height: 45,
      width: 45,
  },
  profileContainer: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 15,
  },

  text2: {
      color: '#000',
      fontSize: 25,
  },

})