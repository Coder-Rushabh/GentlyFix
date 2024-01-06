import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Platform, TouchableOpacity, Image } from 'react-native';
import { getApp, initializeApp } from 'firebase/app';
import { getAuth, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { FirebaseRecaptchaVerifierModal, FirebaseRecaptchaBanner } from 'expo-firebase-recaptcha';

const fbConfig = {
  // Your Firebase configuration goes here
  
};

export default function MobileLogin({ navigation }) {
  try {
    initializeApp(fbConfig);
  } catch (error) {
    console.log("Initializing error ", error);
  }

  const app = getApp();
  const auth = getAuth(app);

  if (!app?.options || Platform.OS === 'web') {
    throw new Error(
      'This example only works on Android or iOS, and requires a valid Firebase config.'
    );
  }

  const recaptchaVerifier = useRef(null);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationId, setVerificationID] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [info, setInfo] = useState('');
  const attemptInvisibleVerification = false;

  const handleSendVerificationCode = async () => {
    try {
      const phoneProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneProvider.verifyPhoneNumber(
        phoneNumber,
        recaptchaVerifier.current
      );
      setVerificationID(verificationId);
    } catch (error) {
      setInfo(`Error : ${error.message}`);
    }
  };

  const handleVerifyVerificationCode = async () => {
    try {
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
      await signInWithCredential(auth, credential);
      setInfo('Success: Phone authentication successful');
      navigation.navigate("Home"); // You need to have 'navigation' defined to use this line
    } catch (error) {
      setInfo(`Error : ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={fbConfig} // Use your Firebase configuration here
      />

      {info && <Text style={styles.text}>{info}</Text>}

      {!verificationId && (
        <View>
          <Text style={styles.text1}>Enter the phone number</Text>

          <Image source={require('./../../../assets/images/phone.jpg')}
            style={styles.loginImage}
          />
          <Text style={styles.text2}>Start with your country code</Text>

          <TextInput
            style={styles.inputBox}
            placeholder="+91xxxxxxxxxx"
            autoFocus
            autoCompleteType="tel"
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            onChangeText={(phoneNumber) => setPhoneNumber(phoneNumber)}
          />

          <TouchableOpacity onPress={() => handleSendVerificationCode()}
            style={styles.loginBtn}
            disabled={!phoneNumber}>
            <Text style={styles.loginText}>Get OTP</Text>
          </TouchableOpacity>

        </View>
      )}

      {verificationId && (
        <View>
          <Text style={styles.text1}>Enter the verification code</Text>
          <Image source={require('./../../../assets/images/phone.jpg')}
            style={styles.loginImage}
          />
          <TextInput
          style={styles.inputBox1}
            editable={!!verificationId}
            placeholder="0 0 0 0 0 0 "
            onChangeText={setVerificationCode}
          />

          <TouchableOpacity onPress={() => handleVerifyVerificationCode()}
            style={styles.loginBtn}
            disabled={!verificationCode}>
            <Text style={styles.loginText}>Confirm OTP</Text>
          </TouchableOpacity>
        </View>
      )}

      {attemptInvisibleVerification && <FirebaseRecaptchaBanner />}
    </View>
  );
}

const styles = StyleSheet.create({
  text1: {
    color: "#4FD3DA",
    fontSize: 30,
    marginBottom: 50,
    marginTop: 30
  },
  text2: {
    color: 'grey',
    fontSize: 20
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtn: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4FD3DA',
    borderRadius: 25,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
  loginImage: {
    width: 250,
    height: 250,
    alignSelf: 'center'
  },
  loginText: {
    color: '#4FD3DA',
    fontSize: 20,
  },
  inputBox: {
    fontSize: 20,
    marginTop: 20,
    borderColor: 'gray',
    borderRadius: 25,
    borderWidth: 1,
    height: 50,
    paddingLeft: 25

  },
  inputBox1: {
    fontSize: 20,
    marginTop: 20,
    borderColor: 'gray',
    borderRadius: 25,
    borderWidth: 1,
    height: 50,
    textAlign: 'center'

  }
});
