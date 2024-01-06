import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { router } from 'expo-router';

export default function Login({ navigation }) {

    return (
        <View style={styles.container}>
            <Image source={require('./../../../assets/images/login.jpg')}
                style={styles.loginImage}
            />
            <TouchableOpacity onPress={() =>
                navigation.navigate('MobileLogin')
            }
                style={styles.loginBtn}>
                <Text style={styles.loginText}>Get Started </Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    loginImage: {
        width: 350,
        height: 340,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginTop: 70
    },
    loginText: {
        color: '#4FD3DA',
        fontSize: 20,
    },
    loginBtn: {
        width: "80%",
        backgroundColor: "#fff",
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#4FD3DA',
        borderRadius: 25,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 70,
        marginBottom: 10
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    }
})