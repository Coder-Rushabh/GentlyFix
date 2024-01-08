import { View, Text, Image, StyleSheet } from 'react-native'
import React from 'react'
import { AntDesign } from '@expo/vector-icons';

export default function Header() {
    return (
        <>
            <View style={styles.container}>
                <View style={styles.profileContainer}>

                        <Text style={styles.text2}>Profile</Text>
                        <AntDesign style={styles.edit} name="edit" size={24} color="black" />
                </View>
            </View>
            
        </>
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
        marginLeft: 'auto',
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