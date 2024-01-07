import { View, Text, Image, StyleSheet } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons';
import SearchBar from './SearchBar';

export default function Header() {
    return (
        <>
            <View style={styles.container}>
                <Ionicons name="menu" size={34} color="black" style={styles.menu} />
                <View style={styles.profileContainer}>

                    <View >
                        <Text style={styles.text1}>Welcome</Text>
                        <Text style={styles.text2}>Rushabh</Text>
                    </View>
                    <Image source={require('./../../../assets/images/dp.jpg')}
                        style={styles.userImage} />

                </View>
            </View>
            
            <SearchBar />
        </>
    )
}
const styles = StyleSheet.create({
    container: {
        padding: 10,
        paddingTop: 40,
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    menu: {
        alignSelf: 'center',
        alignItems: 'center',
        marginLeft: 0,
        marginRight: 'auto',
        height: 45,
        width: 45,
    },
    profileContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        marginLeft: 'auto',
        marginRight: 0
    },
    userImage: {
        height: 45,
        width: 45,
        borderRadius: 99
    },
    text2: {
        color: '#4FD3DA',
        fontSize: 25,
    },
    text1: {
        marginLeft: 'auto',
        marginRight: 0,
        marginTop: 5
    }
})