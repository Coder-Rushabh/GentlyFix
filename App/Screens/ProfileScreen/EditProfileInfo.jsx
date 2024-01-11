import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput } from 'react-native'
import React from 'react'
import { AntDesign } from '@expo/vector-icons';

export default function EditProfileInfo({ navigation }) {
    const submitInfo = ({ navigation }) => {
        navigation.navigate('Profile')
    }
    return (
        <>
            <View style={styles.container}>
                <TouchableOpacity onPress={() =>
                    navigation.navigate('Profile')
                }>
                    <AntDesign style={styles.edit} name="back" size={24} color="black" />
                </TouchableOpacity>

                <Text style={styles.text2}>Edit Profile</Text>
            </View>


            <Text style={styles.text1}>Email ID</Text>
            <TextInput
                style={styles.inputBox1}
                placeholder="Enter your email id"
            />
            <Text style={styles.text1}>Address</Text>

            <TextInput
                style={styles.inputBox1}
                placeholder="Enter your address"
            />
            <Text style={styles.text1}>City</Text>

            <TextInput
                style={styles.inputBox1}
                placeholder="Enter your city name"
            />
            <Text style={styles.text1}>PIN Code</Text>

            <TextInput
                style={styles.inputBox1}
                placeholder="Enter your pin code"
            />

            <TouchableOpacity onClick={submitInfo} style={styles.submitBtn}><Text style={styles.text3}>Submit</Text></TouchableOpacity>
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
        marginBottom: 20
    },
    edit: {
        marginLeft: 0,
        marginRight: 'auto',
        marginTop: 20,
        height: 45,
        width: 45,
    },
    text2: {
        color: '#000',
        fontSize: 25,
        alignSelf: 'center',
        marginLeft: '25%'
    },
    text1: {
        color: '#000',
        fontSize: 17,
        marginLeft: 20
    },
    text3: {
        color: '#fff',
        fontSize: 17,
        alignItems: 'center'
    },
    inputBox1: {
        fontSize: 20,
        marginTop: 20,
        margin: 20,
        borderColor: 'gray',
        borderRadius: 25,
        borderWidth: 1,
        height: 50,
        textAlign: 'center'

    },
    submitBtn: {
        height: 40,
        width: '40%',
        backgroundColor: '#4FD3DA',
        alignSelf: 'center',
        alignItems: 'center',
        borderRadius: 15,
        justifyContent: 'center',
        marginTop: 40
    }

})