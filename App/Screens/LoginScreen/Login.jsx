import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import React from 'react'

export default function Login() {

    const handleGoogleSignup = () => {
       
      };


    return (
        <View>
            <Image source={require('./../../../assets/images/login.jpg')}
                style={styles.loginImage}
            />
            <TouchableOpacity onPress={handleGoogleSignup}>
                <Image source={require('./../../../assets/images/google.png')}
                    style={styles.googleLoginImage}
                />
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
    },
    googleLoginImage: {
        width: 350,
        height: 50,
        padding: 20,
        marginTop: 100

    }
})